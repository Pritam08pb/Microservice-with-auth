# Helpy Multi-Agent Service

A comprehensive AI-powered multi-agent system with RAG capabilities, real-time chat, document processing, and OAuth integrations.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [User Flows](#user-flows)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Development](#development)

## 🎯 Overview

Helpy is a sophisticated multi-agent AI system that combines:

- **Multi-Agent Architecture**: LangGraph-based agent orchestration with routing, RAG, and drafting nodes
- **Real-time Chat**: Socket.io-powered live agent conversations
- **Document Processing**: PDF/text ingestion with local vector embeddings
- **OAuth Integrations**: Google Workspace connectivity for email/calendar access
- **Hybrid LLM**: Local Ollama + Cloud Groq models for cost-effective processing
- **Modern UI**: Next.js React application with responsive design

### Key Features

- 🤖 **Intelligent Agent Routing**: Automatically routes tasks to appropriate processing paths
- 📄 **RAG-Powered Responses**: Context-aware responses using uploaded documents
- 💬 **Real-time Chat**: Live streaming of agent thoughts and responses
- 🔐 **Secure Authentication**: JWT-based auth with API key generation
- 📊 **Document Management**: Upload, process, and vectorize documents
- 🔗 **OAuth Integrations**: Connect external services (Google Workspace)
- 🏗️ **Scalable Architecture**: Kafka-based task queuing for horizontal scaling

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI    │    │  Express API    │    │   Kafka Queue   │
│                 │    │                 │    │                 │
│ - React Pages   │◄──►│ - REST Routes   │◄──►│ - Task Queue    │
│ - Socket Client │    │ - Socket Server │    │ - Async Workers │
│ - Auth Forms    │    │ - Auth Middleware│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    │                 │
                    │ - Users         │
                    │ - Documents     │
                    │ - Agent Tasks   │
                    │ - OAuth Tokens  │
                    └─────────────────┘
```

### Agent Flow Architecture

```
User Prompt → Router Node → [RAG Node] → Drafter Node → Response
                      │
                      ├── USE_RAG: Document search + context
                      ├── USE_CLOUD: Groq LLM (complex tasks)
                      └── USE_LOCAL: Ollama LLM (simple chat)
```

### Data Flow

1. **User Authentication**: JWT tokens stored in localStorage
2. **Document Upload**: Files processed → text extracted → chunked → vectorized → Redis
3. **Agent Tasks**: API request → Kafka queue → worker processes → socket streaming
4. **Real-time Updates**: Socket.io rooms for user-specific agent communications

## 🛠️ Tech Stack

### Backend (multi-agent-service)

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with middleware (CORS, Helmet, Morgan)
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Vector Store**: Redis for embeddings
- **Message Queue**: Kafka for task processing
- **Authentication**: JWT + bcrypt password hashing
- **AI/ML**:
  - LangGraph for agent orchestration
  - LangChain for LLM integrations
  - Ollama for local LLM (Llama 3)
  - Groq API for cloud LLM
- **Real-time**: Socket.io for live chat
- **File Processing**: Multer + pdf-parse for document ingestion
- **OAuth**: Google APIs for Workspace integration

### Frontend (multi-agent-ui)

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: React 18 with custom CSS
- **State**: React hooks (useState, useEffect)
- **Real-time**: Socket.io client
- **Routing**: Next.js file-based routing
- **Styling**: Custom CSS with responsive design

### Infrastructure

- **Containerization**: Docker
- **Database**: PostgreSQL in Docker
- **Cache**: Redis for vector storage
- **Message Queue**: Kafka for async processing
- **Reverse Proxy**: Nginx (production)

## 🗄️ Database Schema

### User Model

```sql
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT uuid(),
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  apiKey TEXT UNIQUE,
  activeDocumentId TEXT,
  isEmailEnabled BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
);
```

### Document Model

```sql
CREATE TABLE "Document" (
  id TEXT PRIMARY KEY DEFAULT uuid(),
  userId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  vectorKeyPrefix TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
);
```

### OAuthIntegration Model

```sql
CREATE TABLE "OAuthIntegration" (
  id TEXT PRIMARY KEY DEFAULT uuid(),
  userId TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'google',
  refreshToken TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
);
```

### AgentTask Model

```sql
CREATE TABLE "AgentTask" (
  id TEXT PRIMARY KEY DEFAULT uuid(),
  userId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  route TEXT, -- USE_RAG, USE_CLOUD, USE_LOCAL
  resultText TEXT,
  status TEXT DEFAULT 'QUEUED', -- QUEUED, PROCESSING, COMPLETED, FAILED
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP
);
```

## 🔌 API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint    | Description       | Auth Required |
| ------ | ----------- | ----------------- | ------------- |
| POST   | `/register` | User registration | No            |
| POST   | `/login`    | User login        | No            |
| POST   | `/api-key`  | Generate API key  | Yes           |

**Request/Response Examples:**

```bash
# Register
curl -X POST http://localhost:4001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response: 201
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

### Configuration Routes (`/api/v1/config`)

| Method | Endpoint | Description            | Auth Required |
| ------ | -------- | ---------------------- | ------------- |
| GET    | `/`      | Get user configuration | Yes           |
| PUT    | `/`      | Update bot settings    | Yes           |

**Update Config:**

```json
{
  "activeDocumentId": "doc-uuid",
  "isEmailEnabled": true
}
```

### Document Routes (`/api/v1/documents`)

| Method | Endpoint  | Description                           | Auth Required |
| ------ | --------- | ------------------------------------- | ------------- |
| GET    | `/`       | List user documents                   | Yes           |
| POST   | `/upload` | Upload document (multipart/form-data) | Yes           |
| DELETE | `/:id`    | Delete document                       | Yes           |

### Agent Routes (`/api/v1/agents`)

| Method | Endpoint | Description       | Auth Required |
| ------ | -------- | ----------------- | ------------- |
| POST   | `/task`  | Submit agent task | Yes           |

**Agent Task Request:**

```json
{
  "prompt": "Summarize my uploaded invoice"
}
```

**Response:**

```json
{
  "messageId": "task-uuid",
  "message": "Thought accepted and queued for Agentic Processing."
}
```

### Plugin Routes (`/api/v1/plugins`)

| Method | Endpoint           | Description           | Auth Required |
| ------ | ------------------ | --------------------- | ------------- |
| POST   | `/google/connect`  | Initiate Google OAuth | Yes           |
| GET    | `/google/callback` | OAuth callback        | No            |

### Health Check

| Method | Endpoint  | Description           |
| ------ | --------- | --------------------- |
| GET    | `/health` | Service health status |

## 🎨 Frontend Components

### Page Components

#### `/` - Home Page

- Service overview and navigation links
- Links to login, register, dashboard, chat

#### `/login` - Login Page

- Email/password form
- JWT token storage on success
- Redirect to dashboard

#### `/register` - Register Page

- User registration form
- Automatic login after registration

#### `/dashboard` - Dashboard Page

- User profile information
- Bot configuration settings
- Document count display
- API key generation
- Google OAuth integration

#### `/chat` - Chat Page

- Real-time agent conversation
- Socket.io streaming of agent thoughts
- Message history display

#### `/documents` - Documents Page

- File upload interface
- Document listing with delete functionality
- PDF/text file support

#### `/config` - Configuration Page

- Bot settings management
- Active document selection
- Email integration toggle

### Shared Components

#### `Navbar.tsx`

- Navigation links
- Authentication state management
- Logout functionality

### API Integration (`lib/api.ts`)

```typescript
export const auth = {
  register: (email: string, password: string) => apiRequest(...),
  login: (email: string, password: string) => apiRequest(...),
  generateApiKey: (token: string) => apiRequest(...)
};

export const config = {
  get: (token: string) => apiRequest(...),
  update: (token: string, payload) => apiRequest(...)
};

export const documents = {
  list: (token: string) => apiRequest(...),
  upload: (token: string, file: File) => apiRequest(...),
  delete: (token: string, id: string) => apiRequest(...)
};

export const agent = {
  task: (token: string, prompt: string) => apiRequest(...)
};
```

### Socket Integration (`lib/socket.ts`)

```typescript
export function getAgentSocket() {
  const socket = io("http://localhost:4001");
  socket.emit("join_agent_room", userId);

  socket.on("agent_status", (payload) => {
    /* status updates */
  });
  socket.on("agent_stream", (text) => {
    /* streaming thoughts */
  });
  socket.on("agent_complete", (payload) => {
    /* final response */
  });
  socket.on("agent_error", (payload) => {
    /* error handling */
  });
}
```

## 👤 User Flows

### 1. User Registration & Authentication

1. User visits `/register`
2. Enters email/password
3. API call to `/api/v1/auth/register`
4. JWT token stored in localStorage
5. Redirect to `/dashboard`

### 2. Document Upload & Processing

1. User visits `/documents`
2. Selects PDF/text file
3. API call to `/api/v1/documents/upload`
4. File processed server-side:
   - Text extraction (PDF parsing)
   - Text chunking (1000 chars, 200 overlap)
   - Vector embedding generation
   - Redis storage with user-specific keys
5. Document appears in list

### 3. Agent Chat Interaction

1. User visits `/chat`
2. Socket connection established
3. User types prompt
4. API call to `/api/v1/agents/task`
5. Task queued in Kafka
6. Worker processes task:
   - Router determines processing path
   - RAG searches user documents if needed
   - LLM generates response
7. Real-time streaming via socket:
   - `agent_status`: "thinking"
   - `agent_stream`: Live thoughts
   - `agent_complete`: Final response

### 4. Configuration Management

1. User visits `/dashboard` or `/config`
2. Loads current settings via `/api/v1/config`
3. Updates active document or email settings
4. API call to `PUT /api/v1/config`
5. Settings saved to database

### 5. OAuth Integration

1. User clicks "Connect Google Workspace"
2. API call to `/api/v1/plugins/google/connect`
3. Redirect to Google OAuth consent screen
4. User grants permissions
5. Callback to `/api/v1/plugins/google/callback`
6. Refresh token stored in database

## 🚀 Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL (Docker or local)
- Redis (Docker or local)
- Kafka (Docker or local)
- Ollama (for local LLM)
- Docker & Docker Compose

### 1. Clone and Install Dependencies

```bash
# Backend
cd services/multi-agent-service
npm install

# Frontend
cd ../multi-agent-ui
npm install
```

### 2. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker run --name postgres-helpy -e POSTGRES_PASSWORD=helpy -d -p 5432:5432 postgres:15

# Run migrations
cd services/multi-agent-service
npx prisma migrate reset --force
```

### 3. Environment Configuration

Create `.env` file in `services/multi-agent-service/`:

```env
DATABASE_URL="postgresql://helpy:helpy@localhost:5432/helpy"
PORT=4001
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV=development

# LLM Configuration
GROQ_API_KEY="your-groq-api-key"
OLLAMA_BASE_URL="http://localhost:11434"

# Kafka Configuration
KAFKA_BROKERS="localhost:9092"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
```

### 4. Start External Services

```bash
# Redis
docker run --name redis-helpy -d -p 6379:6379 redis:alpine

# Kafka (using Bitnami image)
docker run --name kafka-helpy \
  -e KAFKA_CFG_NODE_ID=0 \
  -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@localhost:9093 \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -p 9092:9092 \
  -d bitnami/kafka:latest

# Ollama
ollama serve
ollama pull llama3
ollama pull nomic-embed-text
```

### 5. Start Services

```bash
# Terminal 1: Backend
cd services/multi-agent-service
npm run dev

# Terminal 2: Frontend
cd services/multi-agent-ui
npm run dev
```

### 6. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4001
- Health Check: http://localhost:4001/health

## ⚙️ Configuration

### Environment Variables

| Variable          | Description                  | Default                | Required |
| ----------------- | ---------------------------- | ---------------------- | -------- |
| `DATABASE_URL`    | PostgreSQL connection string | -                      | Yes      |
| `PORT`            | Server port                  | 4001                   | No       |
| `JWT_SECRET`      | JWT signing key              | -                      | Yes      |
| `GROQ_API_KEY`    | Groq API key for cloud LLM   | -                      | Yes      |
| `OLLAMA_BASE_URL` | Ollama server URL            | http://localhost:11434 | No       |
| `KAFKA_BROKERS`   | Kafka broker addresses       | localhost:9092         | No       |
| `REDIS_URL`       | Redis connection URL         | redis://localhost:6379 | No       |

### LLM Configuration

The system uses a hybrid LLM approach:

- **Local LLM (Ollama)**: Llama 3 for cost-effective, private processing
- **Cloud LLM (Groq)**: Fast inference for complex tasks

Models used:

- Chat: `llama3` (Ollama) / `llama3-8b-8192` (Groq)
- Embeddings: `nomic-embed-text` (Ollama)

### Kafka Topics

- `agent-tasks`: Async task processing queue
- Consumer Group: `ai-agent-workers`

### Socket Events

| Event             | Direction       | Payload                                 | Description             |
| ----------------- | --------------- | --------------------------------------- | ----------------------- |
| `join_agent_room` | Client → Server | `{ userId: string }`                    | Join user-specific room |
| `agent_status`    | Server → Client | `{ status: string, messageId: string }` | Task status updates     |
| `agent_stream`    | Server → Client | `string`                                | Live agent thoughts     |
| `agent_complete`  | Server → Client | `{ messageId: string, result: string }` | Final response          |
| `agent_error`     | Server → Client | `{ messageId: string, error: string }`  | Error notifications     |

## 🐳 Deployment

### Docker Compose (Recommended)

Create `docker-compose.yml` at repository root:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: helpy
      POSTGRES_DB: helpy
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  kafka:
    image: bitnami/kafka:latest
    environment:
      KAFKA_CFG_NODE_ID: 0
      KAFKA_CFG_PROCESS_ROLES: controller,broker
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 0@localhost:9093
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: CONTROLLER
    ports:
      - "9092:9092"

  backend:
    build:
      context: .
      dockerfile: services/multi-agent-service/dockerfile
    ports:
      - "4001:4005"
    environment:
      DATABASE_URL: postgresql://helpy:helpy@postgres:5432/helpy
      PORT: 4005
      JWT_SECRET: your-secret
      GROQ_API_KEY: your-key
      OLLAMA_BASE_URL: http://host.docker.internal:11434
      KAFKA_BROKERS: kafka:9092
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
      - kafka

  frontend:
    build:
      context: .
      dockerfile: services/multi-agent-ui/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:4005/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Production Deployment

1. **Environment Variables**: Use production secrets management
2. **Reverse Proxy**: Nginx for SSL termination and load balancing
3. **Database**: Managed PostgreSQL (AWS RDS, Google Cloud SQL)
4. **Cache**: Managed Redis (AWS ElastiCache, Redis Labs)
5. **Message Queue**: Managed Kafka (AWS MSK, Confluent Cloud)
6. **Monitoring**: Add logging, metrics, and health checks
7. **Scaling**: Horizontal scaling for backend workers

## 💻 Development

### Project Structure

```
services/
├── multi-agent-service/
│   ├── src/
│   │   ├── agents/          # LangGraph agent logic
│   │   ├── config/          # Database, env config
│   │   ├── controllers/     # Route handlers
│   │   ├── kafka/           # Message queue logic
│   │   ├── middlewares/     # Auth, error handling
│   │   ├── rag/             # Document processing
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Real-time communication
│   │   └── utils/           # Helper functions
│   ├── prisma/              # Database schema & migrations
│   └── dockerfile
└── multi-agent-ui/
    ├── app/                 # Next.js app router pages
    ├── components/          # React components
    ├── lib/                 # API clients, utilities
    └── public/              # Static assets
```

### Key Files

#### Backend Entry Points

- `src/index.ts`: Server startup, Kafka init, socket setup
- `src/app.ts`: Express app configuration
- `src/routes/index.ts`: Route aggregation

#### Agent System

- `src/agents/core.agent.ts`: LangGraph workflow definition
- `src/kafka/workers/agent.worker.ts`: Async task processing

#### Data Layer

- `src/config/prisma.ts`: Database client
- `src/rag/local.embeddings.ts`: Vector operations

#### Authentication

- `src/controllers/auth.controller.ts`: Auth endpoints
- `src/middlewares/auth.middleware.ts`: JWT validation

### Development Workflow

1. **Backend Changes**:

   ```bash
   cd services/multi-agent-service
   npm run dev  # Hot reload with tsx
   ```

2. **Frontend Changes**:

   ```bash
   cd services/multi-agent-ui
   npm run dev  # Next.js hot reload
   ```

3. **Database Changes**:

   ```bash
   cd services/multi-agent-service
   npx prisma studio  # GUI database browser
   npx prisma migrate dev  # Create new migrations
   ```

4. **Testing API**:
   ```bash
   curl -X POST http://localhost:4001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

### Code Quality

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configuration
- **Formatting**: Prettier integration
- **Testing**: Jest setup (expand as needed)

### Debugging

- **Backend Logs**: Winston structured logging
- **Database Queries**: Prisma query logging
- **Socket Events**: Socket.io debug mode
- **Kafka Messages**: Consumer lag monitoring

## 📊 Monitoring & Observability

### Health Checks

- `/health`: Basic service availability
- Database connectivity checks
- External service dependencies (Redis, Kafka, Ollama)

### Logging

- **Winston**: Structured JSON logging
- **Morgan**: HTTP request logging
- **Error Tracking**: Global error handlers

### Metrics (Future Enhancement)

- Request latency and throughput
- Agent task processing times
- Document processing statistics
- User activity metrics

## 🔒 Security

### Authentication

- JWT tokens with expiration
- Password hashing with bcrypt
- API key generation for external access

### Authorization

- Route-level middleware
- User-scoped data access
- Document ownership validation

### Data Protection

- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- XSS protection (Helmet middleware)
- CORS configuration

### Secrets Management

- Environment variables for sensitive data
- No hardcoded credentials
- Secure token storage

## 🚀 Future Enhancements

### Planned Features

- **Multi-tenant Architecture**: Organization/user isolation
- **Advanced RAG**: Hybrid search, reranking, multi-modal
- **Agent Marketplace**: Pre-built agent templates
- **Analytics Dashboard**: Usage metrics and insights
- **Voice Integration**: Speech-to-text, text-to-speech
- **Plugin System**: Extensible integrations framework

### Scalability Improvements

- **Microservices**: Split into independent services
- **Event Sourcing**: Event-driven architecture
- **Caching Layer**: Advanced Redis caching strategies
- **Load Balancing**: Horizontal scaling support

### AI/ML Enhancements

- **Fine-tuning**: Custom model training
- **Multi-modal**: Image/document understanding
- **Chain-of-Thought**: Advanced reasoning capabilities
- **Memory Systems**: Long-term conversation memory

---

## 📞 Support

For questions or issues:

- Check the logs in `services/multi-agent-service/` and `services/multi-agent-ui/`
- Verify all external services (PostgreSQL, Redis, Kafka, Ollama) are running
- Ensure environment variables are correctly set
- Test API endpoints individually with curl

## 📄 License

ISC License - See LICENSE file for details.
