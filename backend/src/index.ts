import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get providers with pagination + filter + search + sort
app.get("/providers", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const specialty = req.query.specialty as string | undefined;
  const day = req.query.day as string | undefined;
  const time = req.query.time ? parseInt(req.query.time as string) : undefined;
  const search = req.query.search as string | undefined;
  const sortBy = req.query.sortBy as string || "name";
  const sortOrder = req.query.sortOrder as "asc" | "desc" || "asc";

  const where: any = {};
  if (specialty) {
    where.specialty = {
      contains: specialty,
      mode: "insensitive"
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        specialty: {
          contains: search,
          mode: "insensitive"
        }
      }
    ];
  }

  // fetch all candidates from DB (still paginated later)
  const [allProviders, total] = await Promise.all([
    prisma.provider.findMany({ where }),
    prisma.provider.count({ where }),
  ]);

  // Step 2: apply availability filtering in Node
  let filteredProviders = allProviders;
  
  // Helper: check if a given hour is inside a time slot (supports overnight and >24 ends)
  const isHourInSlot = (hour: number, timeSlot: string): boolean => {
    const parts = timeSlot.split("-");
    if (parts.length !== 2) return false;
    const rawStart = Number(parts[0]);
    const rawEnd = Number(parts[1]);
    if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) return false;

    // Normalize into 0-23 clock; keep original end to detect explicit next-day ranges (>=24)
    let start = ((rawStart % 24) + 24) % 24;
    let endNorm = ((rawEnd % 24) + 24) % 24;
    const isOvernight = rawEnd >= 24 || endNorm < start;

    if (isOvernight) {
      // Range wraps across midnight, e.g., 20-2 or 17-25 (→ 17-1)
      return hour >= start || hour <= endNorm;
    }
    return hour >= start && hour <= endNorm;
  };

  // Filter by day
  if (day) {
    filteredProviders = filteredProviders.filter(p => {
      // Check if provider has availability for the requested day
      const dayAvailability = p.availability?.[day.toLowerCase()];
      
      // If no availability for this day, exclude the provider
      if (!dayAvailability || !Array.isArray(dayAvailability) || dayAvailability.length === 0) {
        return false;
      }
      
      return true;
    });
  }

  // Filter by time (independent of day filter)
  if (time !== undefined) {
    filteredProviders = filteredProviders.filter(p => {
      // If day filter was applied, only check the specific day's availability
      if (day) {
        const dayAvailability = p.availability?.[day.toLowerCase()];
        if (!dayAvailability || !Array.isArray(dayAvailability)) {
          return false;
        }
        return dayAvailability.some((timeSlot: string) => isHourInSlot(time, timeSlot));
      } else {
        // If no day filter, check all days for the specified time
        const availability = p.availability;
        if (!availability || typeof availability !== 'object') {
          return false;
        }
        
        // Check if the provider is available at the specified time on ANY day
        return Object.values(availability).some((daySlots: any) => {
          if (!Array.isArray(daySlots)) return false;
          return daySlots.some((timeSlot: string) => isHourInSlot(time, timeSlot));
        });
      }
    });
  }

  // Step 3: apply sorting
  filteredProviders.sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a];
    let bValue = b[sortBy as keyof typeof b];
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Step 4: paginate
  const paginated = filteredProviders.slice(skip, skip + limit);

  res.json({
    data: paginated,
    pagination: {
      total: filteredProviders.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProviders.length / limit),
    },
  });
});



// Get all families
app.get("/families", async (req, res) => {
  const families = await prisma.family.findMany();
  res.json(families);
});

// Dashboard stats endpoint
app.get("/stats", async (req, res) => {
  try {
    const [providers, families, requests, assignments] = await Promise.all([
      prisma.provider.count(),
      prisma.family.count(),
      prisma.request.count(),
      prisma.assignment.count()
    ]);

    res.json({ providers, families, requests, assignments });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

// Create a new care request
app.post("/requests", async (req, res) => {
  try {
    const { familyId, careType, startTime, endTime } = req.body;

    if (!familyId || !careType || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRequest = await prisma.request.create({
      data: {
        familyId,
        careType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
});

// Get all care requests
app.get("/requests", async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        family: true, 
        assignment: {
          include: {
            provider: true
          }
        }
      }
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// Update a care request
app.put("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { careType, startTime, endTime, familyId } = req.body;
    
    // Check if request exists
    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: { assignment: true }
    });
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    // Validate required fields
    if (!careType || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check for scheduling conflicts if times are being changed
    if (startTime !== request.startTime.toISOString() || endTime !== request.endTime.toISOString()) {
      const conflictingAssignment = await prisma.assignment.findFirst({
        where: {
          requestId: { not: parseInt(id) }, // Exclude current request
          providerId: request.assignment?.providerId,
          request: {
            OR: [
              {
                startTime: { lte: new Date(endTime) },
                endTime: { gte: new Date(startTime) }
              }
            ]
          }
        },
        include: {
          request: true
        }
      });
      
      if (conflictingAssignment) {
        return res.status(409).json({ 
          error: "Time change creates a scheduling conflict",
          conflict: {
            existingRequest: conflictingAssignment.request.careType,
            existingTime: `${conflictingAssignment.request.startTime} - ${conflictingAssignment.request.endTime}`
          }
        });
      }
    }
    
    // Update the request
    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        careType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        familyId: familyId || request.familyId
      },
      include: {
        family: true,
        assignment: {
          include: {
            provider: true
          }
        }
      }
    });
    
    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ error: "Failed to update request" });
  }
});

// Delete a care request
app.delete("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: { assignment: true }
    });
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    // If request has an assignment, delete it first
    if (request.assignment) {
      await prisma.assignment.delete({
        where: { requestId: parseInt(id) }
      });
    }
    
    // Delete the request
    await prisma.request.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ error: "Failed to delete request" });
  }
});

// Assign a provider to a request
app.post("/assignments", async (req, res) => {
  try {
    const { requestId, providerId } = req.body;

    if (!requestId || !providerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // make sure request exists
    const request = await prisma.request.findUnique({ 
      where: { id: requestId },
      include: { family: true }
    });
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // make sure provider exists
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Check for existing assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: { requestId }
    });
    if (existingAssignment) {
      return res.status(400).json({ error: "Request already has an assignment" });
    }

    // Check for scheduling conflicts (same provider, overlapping times)
    const conflictingAssignment = await prisma.assignment.findFirst({
      where: {
        providerId,
        request: {
          OR: [
            {
              startTime: { lte: request.endTime },
              endTime: { gte: request.startTime }
            }
          ]
        }
      },
      include: {
        request: true
      }
    });

    if (conflictingAssignment) {
      return res.status(409).json({ 
        error: "Provider has a scheduling conflict",
        conflict: {
          existingRequest: conflictingAssignment.request.careType,
          existingTime: `${conflictingAssignment.request.startTime} - ${conflictingAssignment.request.endTime}`
        }
      });
    }

    // create assignment
    const assignment = await prisma.assignment.create({
      data: {
        requestId,
        providerId
      },
      include: {
        provider: true,
        request: {
          include: { family: true }
        }
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

// Get all assignments
app.get("/assignments", async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        provider: true,
        request: {
          include: { family: true }
        }
      }
    });
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// Update an assignment (change provider)
app.put("/assignments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ error: "Provider ID is required" });
    }
    
    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) },
      include: {
        request: true,
        provider: true
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    // Check if new provider exists
    const newProvider = await prisma.provider.findUnique({
      where: { id: providerId }
    });
    
    if (!newProvider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    
    // Check for scheduling conflicts with the new provider
    const conflictingAssignment = await prisma.assignment.findFirst({
      where: {
        id: { not: parseInt(id) }, 
        providerId,
        request: {
          OR: [
            {
              startTime: { lte: assignment.request.endTime },
              endTime: { gte: assignment.request.startTime }
            }
          ]
        }
      },
      include: {
        request: true
      }
    });
    
    if (conflictingAssignment) {
      return res.status(409).json({ 
        error: "New provider has a scheduling conflict",
        conflict: {
          existingRequest: conflictingAssignment.request.careType,
          existingTime: `${conflictingAssignment.request.startTime} - ${conflictingAssignment.request.endTime}`
        }
      });
    }
    
    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: parseInt(id) },
      data: { providerId },
      include: {
        provider: true,
        request: {
          include: { family: true }
        }
      }
    });
    
    res.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ error: "Failed to update assignment" });
  }
});

// Delete an assignment
app.delete("/assignments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    // Delete the assignment
    await prisma.assignment.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

// Manual assignment endpoint (assign provider to request)
app.post("/requests/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ error: "Provider ID is required" });
    }
    
    // Check if request exists
    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: { family: true }
    });
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });
    
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    
    // Check for existing assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: { requestId: parseInt(id) }
    });
    
    if (existingAssignment) {
      return res.status(400).json({ error: "Request already has an assignment" });
    }
    
    // Check for scheduling conflicts
    const conflictingAssignment = await prisma.assignment.findFirst({
      where: {
        providerId,
        request: {
          OR: [
            {
              startTime: { lte: request.endTime },
              endTime: { gte: request.startTime }
            }
          ]
        }
      },
      include: {
        request: true
      }
    });
    
    if (conflictingAssignment) {
      return res.status(409).json({ 
        error: "Provider has a scheduling conflict",
        conflict: {
          existingRequest: conflictingAssignment.request.careType,
          existingTime: `${conflictingAssignment.request.startTime} - ${conflictingAssignment.request.endTime}`
        }
      });
    }
    
    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        requestId: parseInt(id),
        providerId
      },
      include: {
        provider: true,
        request: {
          include: { family: true }
        }
      }
    });
    
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating manual assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

// create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI Suggest route
app.post("/ai-suggest", async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ error: "Missing requestId" });
    }

    // fetch request + family
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { family: true }
    });
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // fetch providers
    const providers = await prisma.provider.findMany();

    // Get existing assignments for this family to check consistency
    const familyAssignments = await prisma.assignment.findMany({
      where: {
        request: {
          familyId: request.familyId
        }
      },
      include: {
        provider: true,
        request: true
      }
    });

    const prompt = `
You are a scheduling assistant. A family has made a care request. 
Pick the SINGLE best provider based on family consistency preference, specialty, and availability. 
Return ONLY valid JSON in this format:

{
  "providerId": <number>,
  "name": "<string>",
  "reasoning": "<string>"
}

Request:
- Care Type: ${request.careType}
- Time: ${request.startTime.toISOString()} to ${request.endTime.toISOString()}
- Family: ${request.family.name} (consistency: ${request.family.consistency})

${request.family.consistency && familyAssignments.length > 0 ? `
Previous assignments for this family:
${familyAssignments.map(a => `- ${a.provider.name} (${a.provider.specialty}) for ${a.request.careType}`).join("\n")}
` : ""}

Available Providers:
${providers.map(p => `- id:${p.id}, ${p.name} (${p.specialty}), availability: ${JSON.stringify(p.availability)}`).join("\n")}

${request.family.consistency ? "IMPORTANT: This family prefers consistency. Prioritize providers they've worked with before if available and suitable." : "This family is flexible with different providers."}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a precise scheduling assistant. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });

    const content = completion.choices[0].message?.content;

    let suggestion;
    try {
      suggestion = JSON.parse(content || "{}");
    } catch (e) {
      return res.status(500).json({ error: "AI returned invalid JSON", raw: content });
    }

    res.json({
      requestId,
      suggestedProvider: suggestion
    });
  } catch (error) {
    console.error("AI Suggestion error:", error);
    res.status(500).json({ error: "Failed to generate AI suggestion" });
  }
});



