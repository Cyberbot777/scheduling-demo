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

## Approach & Key Decisions

### Problem Analysis
The assignment described a healthcare startup struggling with manual scheduling that led to:
- 3-hour emergency response times
- Double-booking providers
- Inconsistent care for families who requested consistency

### Solution Architecture

**Backend (Express + Prisma + PostgreSQL)**
- **Database Design**: Normalized schema with clear relationships between providers, families, requests, and assignments
- **API Design**: RESTful endpoints with proper error handling and validation
- **Business Logic**: 
  - Conflict detection prevents double-booking
  - Consistency preferences influence AI recommendations
  - Assignment validation ensures data integrity

**Frontend (Next.js + Tailwind + Framer Motion)**
- **User Experience**: Dark theme with smooth animations for professional healthcare feel
- **Navigation**: Dashboard overview with quick access to all major functions
- **Forms**: Intuitive request creation with real-time AI suggestions

**AI Integration (OpenAI GPT)**
- **Context-Aware**: Considers family history, consistency preferences, and provider specialties
- **Structured Output**: Returns JSON with reasoning for transparency
- **Scalable**: Easy to extend with more sophisticated matching algorithms

### Key Technical Decisions

1. **Database Choice**: PostgreSQL for ACID compliance and complex queries needed for scheduling conflicts
2. **ORM**: Prisma for type safety and easy migrations
3. **API Structure**: RESTful design for simplicity and clear separation of concerns
4. **Frontend Framework**: Next.js App Router for modern React patterns and good DX
5. **Styling**: Tailwind CSS for rapid development and consistent design
6. **AI Integration**: OpenAI GPT for natural language understanding of complex scheduling scenarios

### Business Logic Implementation

**Consistency Preference Logic**
- Families marked as "consistency: true" get priority for providers they've worked with before
- AI considers previous assignments when making recommendations
- System tracks family-provider relationships over time

**Conflict Detection**
- Prevents same provider from being assigned overlapping times
- Validates request times against provider availability
- Returns detailed error messages for scheduling conflicts

**Scalability Considerations**
- Database indexes on time ranges for efficient conflict checking
- Modular API design for easy feature additions
- Docker containerization for consistent deployment

### Future Enhancements

- **Authentication**: Provider and family login systems
- **Calendar Integration**: Google Calendar/iCal sync
- **Payment Processing**: Stripe integration for bookings
- **Advanced AI**: Multi-provider scheduling and availability optimization
- **Mobile App**: React Native for providers and families
- **Analytics**: Scheduling efficiency metrics and provider utilization

---

## Author

Richard Hall  
Full-Stack AI Engineer  
Built for YuziCare 
