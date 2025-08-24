import express from "express";
import cors from "cors";
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
