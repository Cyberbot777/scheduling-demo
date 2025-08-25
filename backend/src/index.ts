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

// Get all providers
app.get("/providers", async (req, res) => {
  const providers = await prisma.provider.findMany();
  res.json(providers);
});

// Get all families
app.get("/families", async (req, res) => {
  const families = await prisma.family.findMany();
  res.json(families);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
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



