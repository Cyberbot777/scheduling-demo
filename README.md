# YuziCare Scheduler

A comprehensive AI-driven scheduling system for healthcare providers and families, built to solve real-world scheduling challenges in the healthcare industry.

**Tech Stack**: Next.js 15 (Frontend), Node.js/Express (Backend), PostgreSQL (Database), Prisma (ORM), OpenAI GPT (AI Integration), Docker (Containerization)

---

## Problem Statement

YuziCare, a growing healthcare startup, was experiencing critical scheduling failures:
- 3-hour emergency response times for urgent care requests
- Double-booking of providers due to manual scheduling
- Inconsistent care delivery for families who specifically requested provider consistency
- Complete breakdown of manual scheduling processes

This system provides a complete solution to these challenges through intelligent automation, conflict prevention, and AI-powered provider matching.

---

## Core Features

### Complete CRUD Operations

**Care Requests Management**
- **Create**: New care requests with family selection, care type, and time slots
- **Read**: View all requests with assignment status and provider details
- **Update**: Edit request details including care type, times, and family assignment
- **Delete**: Remove requests with automatic cleanup of associated assignments

**Provider Assignments**
- **Create**: Assign providers to requests with conflict detection
- **Read**: View all assignments with provider and family details
- **Update**: Change assigned providers with real-time conflict validation
- **Delete**: Remove assignments while maintaining request integrity

**Provider Management**
- **Read**: View all providers with specialties and availability
- **Availability Tracking**: JSON-based availability patterns for each provider

**Family Management**
- **Read**: View family profiles with consistency preferences
- **Consistency Logic**: Track and respect family preferences for provider consistency

### AI-Powered Scheduling

**Intelligent Provider Recommendations**
- OpenAI GPT integration for smart provider matching
- Considers family consistency preferences, provider specialties, and availability
- Provides reasoning for each recommendation
- Learns from previous assignments to improve future suggestions

**Conflict Detection System**
- Prevents double-booking of providers
- Validates time overlaps across all assignments
- Real-time conflict checking during assignment creation and updates
- Detailed error messages with conflict information

### User Experience

**Modern Interface**
- Dark theme optimized for healthcare professionals
- Responsive design for desktop and mobile use
- Smooth animations and transitions
- Intuitive navigation and workflow

**Real-time Updates**
- Immediate reflection of changes across all pages
- Live status updates for request assignments
- Instant feedback for all user actions

---

## Technical Architecture

### Backend (Node.js/Express/Prisma)

**Database Schema**
```sql
- providers: id, name, specialty, availability
- families: id, name, consistency
- requests: id, familyId, careType, startTime, endTime
- assignments: id, requestId, providerId
```

**API Endpoints**
```
GET    /health                    - Health check
GET    /providers                 - List all providers
GET    /families                  - List all families
GET    /requests                  - List all requests with assignments
POST   /requests                  - Create new request
PUT    /requests/:id              - Update request
DELETE /requests/:id              - Delete request
GET    /assignments               - List all assignments
POST   /assignments               - Create assignment
PUT    /assignments/:id           - Update assignment (change provider)
DELETE /assignments/:id           - Delete assignment
POST   /requests/:id/assign       - Manual provider assignment
POST   /ai-suggest                - AI provider recommendation
```

**Business Logic**
- Comprehensive validation for all operations
- Scheduling conflict detection and prevention
- Family consistency preference handling
- Data integrity maintenance across all operations

### Frontend (Next.js 15/Tailwind CSS)

**Page Structure**
- Dashboard: Overview with key metrics and quick actions
- Providers: List all providers with availability details
- Requests: Manage care requests with full CRUD operations
- Assignments: View and manage provider assignments
- New Request: Create requests with AI suggestion integration

**State Management**
- React hooks for local state management
- Real-time data synchronization
- Optimistic updates for better UX
- Error handling and user feedback

### AI Integration (OpenAI GPT)

**Recommendation Engine**
- Context-aware provider matching
- Family history consideration
- Specialty and availability analysis
- Structured JSON responses with reasoning

**Prompt Engineering**
- Detailed context including family preferences
- Previous assignment history
- Provider availability patterns
- Clear output format requirements

---

## Setup and Installation

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- OpenAI API key (for AI features)

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/Cyberbot777/yuzicare-scheduler.git
cd yuzicare-scheduler
```

2. **Environment Configuration**
```bash
cp example.env .env
# Edit .env with your OpenAI API key
```

3. **Start Services**
```bash
docker compose up -d
```

4. **Backend Setup**
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

5. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

**Access Points**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Database: PostgreSQL via Docker

---

## API Examples

### Create Care Request
```bash
curl -X POST http://localhost:4000/requests \
  -H "Content-Type: application/json" \
  -d '{
    "familyId": 1,
    "careType": "Overnight Newborn Care",
    "startTime": "2025-08-25T22:00:00.000Z",
    "endTime": "2025-08-26T06:00:00.000Z"
  }'
```

### Get AI Provider Recommendation
```bash
curl -X POST http://localhost:4000/ai-suggest \
  -H "Content-Type: application/json" \
  -d '{"requestId": 1}'
```

### Update Request
```bash
curl -X PUT http://localhost:4000/requests/1 \
  -H "Content-Type: application/json" \
  -d '{
    "careType": "Updated Care Type",
    "startTime": "2025-08-25T23:00:00.000Z",
    "endTime": "2025-08-26T07:00:00.000Z",
    "familyId": 1
  }'
```

### Change Provider Assignment
```bash
curl -X PUT http://localhost:4000/assignments/1 \
  -H "Content-Type: application/json" \
  -d '{"providerId": 2}'
```

---

## Key Technical Decisions

### Database Design
- **PostgreSQL**: Chosen for ACID compliance and complex query capabilities
- **Normalized Schema**: Clear relationships between entities
- **Indexing Strategy**: Optimized for time-range queries and conflict detection

### API Architecture
- **RESTful Design**: Standard HTTP methods for all operations
- **Error Handling**: Comprehensive error responses with detailed messages
- **Validation**: Input validation at both API and database levels

### Frontend Architecture
- **Next.js 15**: Latest App Router for modern React patterns
- **Tailwind CSS**: Utility-first styling for rapid development
- **Framer Motion**: Smooth animations for professional feel

### AI Integration
- **OpenAI GPT-3.5-turbo**: Cost-effective yet powerful for scheduling logic
- **Structured Prompts**: Clear context and output requirements
- **Error Handling**: Graceful fallbacks when AI is unavailable

---

## Scalability and Production Readiness

### Performance Optimizations
- Database indexes on time ranges for efficient conflict checking
- Optimistic updates for responsive UI
- Efficient data fetching with proper includes

### Security Considerations
- Input validation and sanitization
- SQL injection prevention through Prisma ORM
- CORS configuration for API access

### Deployment Ready
- Docker containerization for consistent environments
- Environment variable configuration
- Database migration system

---

## Future Enhancements

### Short Term
- User authentication and authorization
- Email notifications for assignments
- Calendar integration (Google Calendar, Outlook)
- Mobile-responsive optimizations

### Medium Term
- Payment processing integration
- Advanced reporting and analytics
- Provider availability management
- Family portal for request management

### Long Term
- Machine learning for predictive scheduling
- Multi-location support
- Advanced AI for optimal provider matching
- Mobile applications for providers and families

---

## Project Structure

```
yuzicare-scheduler/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── providers/
│   │   ├── requests/
│   │   ├── assignments/
│   │   └── layout.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── example.env
└── README.md
```

---

## Author

**Richard Hall**  
Full-Stack Engineer with expertise in modern web technologies, AI integration, and scalable system design.

Built for YuziCare as a demonstration of production-ready scheduling system development. 
