# YuziCare Scheduler

An AI-driven scheduling system for healthcare providers and families.  
Built with Next.js (frontend), Express + Prisma (backend), and Postgres (Dockerized).  

This project was developed as a take-home assignment to demonstrate full-stack design, database modeling, and AI integration.  

---

## Features

- **Backend (Express + Prisma + Postgres)**
  - REST API for providers, families, requests, and assignments
  - AI endpoint (`/ai-suggest`) that recommends the best provider for a request using OpenAI GPT
  - Database migrations and seeding with Prisma ORM

- **Frontend (Next.js + Tailwind + Framer Motion)**
  - Pages for Providers and Requests
  - Dark modern UI theme inspired by YuziCare branding
  - Fetches live data from backend REST API

- **Infrastructure**
  - Docker Compose with Postgres for local development
  - `.env` configuration for API keys and DB URLs
  - Example dataset seeded into database

---

## Monorepo Structure

```
yuzicare-scheduler/
│── backend/        # Express + Prisma + Postgres API
│   ├── prisma/     # Prisma schema + migrations + seed data
│   ├── src/        # Express routes and controllers
│   ├── package.json
│
│── frontend/       # Next.js + Tailwind + Framer Motion UI
│   ├── app/        # Next.js app router pages
│   ├── package.json
│
│── docker-compose.yml   # Postgres container
│── example.env          # Sample environment variables
│── README.md
```

---

## Setup

### 1. Clone Repo
```bash
git clone https://github.com/Cyberbot777/yuzicare-scheduler.git
cd yuzicare-scheduler
```

### 2. Environment Variables
Copy the example env:
```bash
cp example.env .env
```

Fill in:
- `DATABASE_URL` → your local Postgres (from Docker Compose)
- `OPENAI_API_KEY` → if testing AI suggestion

### 3. Run Postgres with Docker
```bash
docker compose up -d
```

### 4. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

API runs at `http://localhost:4000`

Test endpoints:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/providers
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

UI runs at `http://localhost:3000`

Pages:
- `/providers` → list providers
- `/requests` → list care requests

---

## Example API Usage

Create a request:
```bash
curl -X POST http://localhost:4000/requests \
  -H "Content-Type: application/json" \
  -d '{"familyId": 1, "careType": "Overnight newborn care", "startTime": "2025-08-25T22:00:00.000Z", "endTime": "2025-08-26T06:00:00.000Z"}'
```

AI suggestion:
```bash
curl -X POST http://localhost:4000/ai-suggest \
  -H "Content-Type: application/json" \
  -d '{"requestId": 1}'
```

Example response:
```json
{
  "requestId": 1,
  "suggestedProvider": {
    "providerId": 1,
    "name": "Alice Johnson",
    "reasoning": "Best provider based on family consistency preference, specialty, and availability."
  }
}
```

---

## Next Steps

- Add authentication for providers and coordinators
- Extend AI to support multi-provider scheduling
- Deployment to Vercel (frontend) + Render/Fly.io (backend)

---

## Author

Richard Hall  
Full-Stack AI Engineer  
Built for YuziCare 
