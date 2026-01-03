# Ticketing Microservices Platform

A production-ready, cloud-native ticketing application built with microservices architecture. This platform enables users to create, purchase, and manage event tickets with real-time order processing, automatic expiration handling, and secure payment integration.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Services](#services)
- [Technology Stack](#technology-stack)
- [Event-Driven Communication](#event-driven-communication)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Running with Skaffold](#running-with-skaffold)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Kubernetes Configuration](#kubernetes-configuration)
  - [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NGINX INGRESS                                  │
│                         (ticketing.dev routing)                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │              │              │              │              │
         ▼              ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Auth     │ │   Tickets   │ │   Orders    │ │  Payments   │ │   Client    │
│   Service   │ │   Service   │ │   Service   │ │   Service   │ │  (Next.js)  │
│  :3000      │ │   :3000     │ │   :3000     │ │   :3000     │ │   :3000     │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────────────┘
       │               │               │               │
       ▼               │               │               │
┌─────────────┐        │               │               │
│   MongoDB   │        └───────────────┴───────────────┘
│ (auth-mongo)│                        │
└─────────────┘                        ▼
                    ┌─────────────────────────────────────┐
                    │        NATS Streaming Server        │
                    │         (Event Message Bus)         │
                    │          Cluster: ticketing         │
                    └─────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│ tickets-mongo   │          │  orders-mongo   │          │ payments-mongo  │
│    MongoDB      │          │    MongoDB      │          │    MongoDB      │
└─────────────────┘          └─────────────────┘          └─────────────────┘

                    ┌─────────────────────────────────────┐
                    │        Expiration Service           │
                    │     (Bull Queue + Redis Worker)     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │      Redis      │
                              │  (Job Queue)    │
                              └─────────────────┘
```

### Key Architectural Patterns

- **Microservices Architecture**: Independent, loosely coupled services with single responsibility
- **Event-Driven Communication**: Asynchronous messaging via NATS Streaming
- **Database per Service**: Each service maintains its own MongoDB instance
- **Event Sourcing**: Services publish domain events for state changes
- **CQRS-lite**: Separate read/write patterns through event subscriptions

---

## Services

### Auth Service (`/auth`)
Handles user identity and authentication.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/signup` | POST | Register a new user |
| `/api/users/signin` | POST | Authenticate user |
| `/api/users/signout` | POST | End user session |
| `/api/users/currentuser` | GET | Get current authenticated user |

### Tickets Service (`/tickets`)
Manages ticket creation and updates.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tickets` | GET | List all available tickets |
| `/api/tickets` | POST | Create a new ticket |
| `/api/tickets/:id` | GET | Get ticket by ID |
| `/api/tickets/:id` | PUT | Update ticket details |

**Events Published:**
- `ticket:created` - When a new ticket is created
- `ticket:updated` - When a ticket is modified

**Events Consumed:**
- `order:created` - Reserves the ticket
- `order:cancelled` - Unreserves the ticket

### Orders Service (`/orders`)
Handles order lifecycle management.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET | List user's orders |
| `/api/orders` | POST | Create a new order |
| `/api/orders/:id` | GET | Get order by ID |
| `/api/orders/:id` | DELETE | Cancel an order |

**Events Published:**
- `order:created` - When a new order is placed
- `order:cancelled` - When an order is cancelled

**Events Consumed:**
- `ticket:created` - Syncs ticket data
- `ticket:updated` - Updates local ticket copy
- `expiration:complete` - Cancels expired orders
- `payment:created` - Marks order as complete

**Order Statuses:**
- `Created` - Order created, awaiting payment
- `Cancelled` - Order cancelled (manually or expired)
- `AwaitingPayment` - Payment in progress
- `Complete` - Payment successful

### Payments Service (`/payments`)
Processes payments via Stripe integration.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments` | POST | Create a payment for an order |

**Events Published:**
- `payment:created` - When payment is successfully processed

**Events Consumed:**
- `order:created` - Syncs order data
- `order:cancelled` - Updates order status locally

### Expiration Service (`/expiration`)
Background worker for order timeout management.

- Uses Bull queue with Redis for job scheduling
- Default expiration window: **15 minutes**
- No REST API - purely event-driven

**Events Published:**
- `expiration:complete` - When order expiration timer fires

**Events Consumed:**
- `order:created` - Schedules expiration job

### Client (`/client`)
Next.js frontend application providing the user interface.

**Pages:**
- `/` - Landing page with ticket listings
- `/auth/signup` - User registration
- `/auth/signin` - User login
- `/tickets/new` - Create new ticket
- `/tickets/:id` - Ticket details
- `/orders` - User's orders
- `/orders/:id` - Order details

---

## Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| TypeScript | Type-safe JavaScript |
| Express.js | Web framework |
| MongoDB | Document database |
| Mongoose | MongoDB ODM |
| NATS Streaming | Message broker |
| Redis | Job queue storage |
| Bull | Job queue processor |
| Stripe | Payment processing |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 10.x | React framework |
| React 17.x | UI library |
| Bootstrap 5.x | CSS framework |
| Axios | HTTP client |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Kubernetes | Container orchestration |
| Skaffold | Local K8s development |
| NGINX Ingress | Load balancer & routing |
| DigitalOcean | Cloud provider (production) |

### Testing
| Technology | Purpose |
|------------|---------|
| Jest | Test framework |
| Supertest | HTTP assertions |
| mongodb-memory-server | In-memory MongoDB for tests |
| ts-jest | TypeScript preprocessor |

---

## Event-Driven Communication

### Event Flow Diagram

```
┌──────────────┐     ticket:created      ┌──────────────┐
│              │ ──────────────────────► │              │
│   Tickets    │     ticket:updated      │    Orders    │
│   Service    │ ◄────────────────────── │    Service   │
│              │     order:created       │              │
│              │     order:cancelled     │              │
└──────────────┘                         └──────────────┘
                                                │
                                                │ order:created
                                                │ order:cancelled
                                                ▼
┌──────────────┐    payment:created      ┌──────────────┐
│              │ ◄────────────────────── │              │
│    Orders    │                         │   Payments   │
│   Service    │                         │   Service    │
│              │                         │              │
└──────────────┘                         └──────────────┘

┌──────────────┐     order:created       ┌──────────────┐
│              │ ◄────────────────────── │              │
│  Expiration  │                         │    Orders    │
│   Service    │ ──────────────────────► │    Service   │
│              │   expiration:complete   │              │
└──────────────┘                         └──────────────┘
```

### Event Subjects

| Subject | Publisher | Subscribers |
|---------|-----------|-------------|
| `ticket:created` | Tickets | Orders |
| `ticket:updated` | Tickets | Orders |
| `order:created` | Orders | Tickets, Payments, Expiration |
| `order:cancelled` | Orders | Tickets, Payments |
| `expiration:complete` | Expiration | Orders |
| `payment:created` | Payments | Orders |

### Queue Groups

Each service uses queue groups to ensure only one instance processes each event:
- `tickets-service`
- `orders-service`
- `payments-service`
- `expiration-service`

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Kubernetes](https://kubernetes.io/) (enabled in Docker Desktop)
- [Skaffold](https://skaffold.dev/) v1.x+
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ticketing.git
   cd ticketing
   ```

2. **Configure hosts file**

   Add to your hosts file (`/etc/hosts` on Mac/Linux, `C:\Windows\System32\drivers\etc\hosts` on Windows):
   ```
   127.0.0.1 ticketing.dev
   ```

3. **Install NGINX Ingress Controller**
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
   ```

4. **Create Kubernetes Secrets**
   ```bash
   # JWT signing key
   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_jwt_secret_key

   # Stripe API key
   kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_stripe_secret_key
   ```

5. **Install common package dependencies** (for local development)
   ```bash
   cd common
   npm install
   npm run build
   cd ..
   ```

### Running with Skaffold

Start all services with hot-reload:

```bash
skaffold dev
```

This will:
- Build all Docker images locally
- Deploy to your local Kubernetes cluster
- Watch for file changes and sync automatically
- Stream logs from all pods

Access the application at: `https://ticketing.dev`

> **Note**: You may see a certificate warning in your browser. This is expected for local development. Proceed to the site (type "thisisunsafe" in Chrome).

### Running Individual Services (Development)

For developing a single service without Kubernetes:

```bash
cd auth  # or tickets, orders, payments, expiration
npm install
npm run test:ci  # Run tests
npm start        # Start service
```

---

## API Reference

### Authentication

All protected endpoints require a valid JWT cookie obtained from `/api/users/signin` or `/api/users/signup`.

### Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Not Authenticated |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Error description",
      "field": "fieldName"  // Optional, for validation errors
    }
  ]
}
```

### Auth Service API

#### POST /api/users/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "id": "user_id",
  "email": "user@example.com"
}
```

#### POST /api/users/signin
Authenticate and receive session cookie.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "email": "user@example.com"
}
```

#### POST /api/users/signout
End the current session.

**Response:** `200 OK`
```json
{}
```

#### GET /api/users/currentuser
Get the currently authenticated user.

**Response:** `200 OK`
```json
{
  "currentUser": {
    "id": "user_id",
    "email": "user@example.com",
    "iat": 1234567890
  }
}
```

### Tickets Service API

#### GET /api/tickets
List all tickets not currently reserved.

**Response:** `200 OK`
```json
[
  {
    "id": "ticket_id",
    "title": "Concert Ticket",
    "price": 50,
    "userId": "user_id",
    "version": 0
  }
]
```

#### POST /api/tickets
Create a new ticket. **Requires authentication.**

**Request Body:**
```json
{
  "title": "Concert Ticket",
  "price": 50
}
```

**Response:** `201 Created`
```json
{
  "id": "ticket_id",
  "title": "Concert Ticket",
  "price": 50,
  "userId": "user_id",
  "version": 0
}
```

#### GET /api/tickets/:id
Get ticket details.

**Response:** `200 OK`
```json
{
  "id": "ticket_id",
  "title": "Concert Ticket",
  "price": 50,
  "userId": "user_id",
  "orderId": null,
  "version": 0
}
```

#### PUT /api/tickets/:id
Update a ticket. **Requires authentication.** Only the ticket owner can update.

**Request Body:**
```json
{
  "title": "Updated Title",
  "price": 75
}
```

**Response:** `200 OK`
```json
{
  "id": "ticket_id",
  "title": "Updated Title",
  "price": 75,
  "userId": "user_id",
  "version": 1
}
```

### Orders Service API

#### GET /api/orders
List all orders for the authenticated user. **Requires authentication.**

**Response:** `200 OK`
```json
[
  {
    "id": "order_id",
    "status": "created",
    "expiresAt": "2024-01-15T10:30:00.000Z",
    "ticket": {
      "id": "ticket_id",
      "title": "Concert Ticket",
      "price": 50
    },
    "userId": "user_id"
  }
]
```

#### POST /api/orders
Create a new order. **Requires authentication.**

**Request Body:**
```json
{
  "ticketId": "ticket_id"
}
```

**Response:** `201 Created`
```json
{
  "id": "order_id",
  "status": "created",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "ticket": {
    "id": "ticket_id",
    "title": "Concert Ticket",
    "price": 50
  },
  "userId": "user_id"
}
```

#### GET /api/orders/:id
Get order details. **Requires authentication.**

**Response:** `200 OK`
```json
{
  "id": "order_id",
  "status": "created",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "ticket": {
    "id": "ticket_id",
    "title": "Concert Ticket",
    "price": 50
  },
  "userId": "user_id"
}
```

#### DELETE /api/orders/:id
Cancel an order. **Requires authentication.**

**Response:** `204 No Content`

### Payments Service API

#### POST /api/payments
Create a payment for an order. **Requires authentication.**

**Request Body:**
```json
{
  "token": "stripe_token",
  "orderId": "order_id"
}
```

**Response:** `201 Created`
```json
{
  "id": "payment_id"
}
```

---

## Database Schema

### Auth Service - Users Collection

```typescript
{
  _id: ObjectId,
  email: string,        // Unique, lowercase
  password: string,     // Hashed with scrypt
}
```

### Tickets Service - Tickets Collection

```typescript
{
  _id: ObjectId,
  title: string,
  price: number,
  userId: string,       // Owner's user ID
  orderId?: string,     // Set when reserved
  version: number,      // Optimistic concurrency control
}
```

### Orders Service

**Tickets Collection (Replica):**
```typescript
{
  _id: ObjectId,        // Same as source ticket
  title: string,
  price: number,
  version: number,
}
```

**Orders Collection:**
```typescript
{
  _id: ObjectId,
  userId: string,
  status: 'created' | 'cancelled' | 'awaiting:payment' | 'complete',
  expiresAt: Date,
  ticket: ObjectId,     // Reference to local ticket copy
  version: number,
}
```

### Payments Service

**Orders Collection (Replica):**
```typescript
{
  _id: ObjectId,
  userId: string,
  status: string,
  price: number,
  version: number,
}
```

**Payments Collection:**
```typescript
{
  _id: ObjectId,
  orderId: string,
  stripeId: string,     // Stripe charge ID
}
```

---

## Authentication

### JWT-Based Authentication

The platform uses JWT tokens stored in cookies for session management.

**Token Structure:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "iat": 1234567890
}
```

**Cookie Configuration:**
- Cookie name: `session`
- Signed: `false`
- Secure: `true` (in production)

### Middleware

Two middleware functions from the `@ms-shared-ticketing/common` package:

1. **currentUser** - Extracts user from JWT (optional, non-blocking)
2. **requireAuth** - Enforces authentication (throws 401 if not authenticated)

### Implementation Flow

```
Request → currentUser middleware → requireAuth middleware → Route Handler
              │                           │
              ▼                           ▼
         Extract JWT              Check req.currentUser
         from cookie              Throw if missing
              │
              ▼
         Verify & decode
         Set req.currentUser
```

---

## Testing

### Test Configuration

Each service has its own Jest configuration:

```javascript
// jest.config.js
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/test/setup.ts']
}
```

### Running Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once (CI/CD)
npm run test:ci
```

### Test Setup

Each service's `src/test/setup.ts` configures:
- In-memory MongoDB server
- Mock NATS client
- Global authentication helpers
- Database cleanup between tests

### Test Structure

```
service/
├── src/
│   ├── routes/
│   │   └── __test__/
│   │       └── route-name.test.ts
│   ├── events/
│   │   └── listeners/
│   │       └── __test__/
│   │           └── listener-name.test.ts
│   └── models/
│       └── __test__/
│           └── model-name.test.ts
```

### Writing Tests

Example route test:

```typescript
import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
});
```

---

## Deployment

### Kubernetes Configuration

#### Development (`infra/k8s-dev/`)

- `ingress-srv.yaml` - Ingress rules for local development

#### Production (`infra/k8s-prod/`)

- `ingress-srv.yaml` - Production ingress with SSL/TLS

#### Shared (`infra/k8s/`)

| File | Description |
|------|-------------|
| `auth-depl.yaml` | Auth service deployment & ClusterIP |
| `auth-mongo-depl.yaml` | Auth MongoDB deployment & ClusterIP |
| `tickets-depl.yaml` | Tickets service deployment & ClusterIP |
| `tickets-monogo-depl.yaml` | Tickets MongoDB deployment & ClusterIP |
| `orders-depl.yaml` | Orders service deployment & ClusterIP |
| `orders-mongo-depl.yaml` | Orders MongoDB deployment & ClusterIP |
| `payments-depl.yaml` | Payments service deployment & ClusterIP |
| `payments-mongo-depl.yaml` | Payments MongoDB deployment & ClusterIP |
| `expiration-depl.yaml` | Expiration service deployment |
| `expiration-redis-depl.yaml` | Redis deployment & ClusterIP |
| `client-depl.yaml` | Next.js client deployment & ClusterIP |
| `nats-depl.yaml` | NATS Streaming deployment & ClusterIP |

### CI/CD Pipeline

GitHub Actions workflows automate testing and deployment.

#### Test Workflows

| Workflow | Trigger | Services |
|----------|---------|----------|
| `tests-tickets.yaml` | PR changes to `tickets/**` | Tickets |
| `tests-orders.yaml` | PR changes to `orders/**` | Orders |
| `tests-payments.yaml` | PR changes to `payments/**` | Payments |

#### Deployment Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `deploy-auth.yaml` | Push to master (auth/**) | Build & deploy auth service |
| `deploy-tickets.yaml` | Push to master (tickets/**) | Build & deploy tickets service |
| `deploy-orders.yaml` | Push to master (orders/**) | Build & deploy orders service |
| `deploy-payments.yaml` | Push to main (payments/**) | Build & deploy payments service |
| `deploy-expiration.yaml` | Push to main (expiration/**) | Build & deploy expiration service |
| `deploy-client.yaml` | Push to master (client/**) | Build & deploy client |
| `deploy-manifests.yaml` | Push to master (infra/**) | Apply K8s manifests |

#### Deployment Process

```
Code Push → GitHub Actions → Docker Build → Push to Docker Hub → K8s Rolling Update
                                                                         │
                                                                         ▼
                                                              kubectl rollout restart
```

### Manual Deployment

```bash
# Build and push Docker image
docker build -t mostafasaad/auth ./auth
docker push mostafasaad/auth

# Apply Kubernetes manifests
kubectl apply -f infra/k8s
kubectl apply -f infra/k8s-prod

# Restart deployment
kubectl rollout restart deployment auth-depl
```

---

## Environment Variables

### Auth Service

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://auth-mongo-srv:27017/auth` |
| `JWT_KEY` | JWT signing secret | K8s secret |

### Tickets Service

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://tickets-mongo-srv:27017/tickets` |
| `JWT_KEY` | JWT signing secret | K8s secret |
| `NATS_URL` | NATS server URL | `nats://nats-srv:4222` |
| `NATS_CLUSTER_ID` | NATS cluster identifier | `ticketing` |
| `NATS_CLIENT_ID` | Unique client ID | Pod name (from metadata) |

### Orders Service

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://orders-mongo-srv:27017/orders` |
| `JWT_KEY` | JWT signing secret | K8s secret |
| `NATS_URL` | NATS server URL | `nats://nats-srv:4222` |
| `NATS_CLUSTER_ID` | NATS cluster identifier | `ticketing` |
| `NATS_CLIENT_ID` | Unique client ID | Pod name (from metadata) |

### Payments Service

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://payments-mongo-srv:27017/payments` |
| `JWT_KEY` | JWT signing secret | K8s secret |
| `STRIPE_KEY` | Stripe secret API key | K8s secret |
| `NATS_URL` | NATS server URL | `nats://nats-srv:4222` |
| `NATS_CLUSTER_ID` | NATS cluster identifier | `ticketing` |
| `NATS_CLIENT_ID` | Unique client ID | Pod name (from metadata) |

### Expiration Service

| Variable | Description | Example |
|----------|-------------|---------|
| `NATS_URL` | NATS server URL | `nats://nats-srv:4222` |
| `NATS_CLUSTER_ID` | NATS cluster identifier | `ticketing` |
| `NATS_CLIENT_ID` | Unique client ID | Pod name (from metadata) |
| `REDIS_HOST` | Redis server hostname | `expiration-redis-srv` |

### Required Kubernetes Secrets

```bash
# Create JWT secret
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<your-secret>

# Create Stripe secret
kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=<your-stripe-key>
```

---

## Project Structure

```
ticketing/
├── auth/                       # Authentication service
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── app.ts             # Express app configuration
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   └── test/              # Test setup
│   ├── Dockerfile
│   └── package.json
│
├── tickets/                    # Tickets service
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── models/
│   │   ├── routes/
│   │   ├── events/
│   │   │   ├── listeners/     # NATS event listeners
│   │   │   └── publishers/    # NATS event publishers
│   │   ├── nats-wrapper.ts    # NATS client singleton
│   │   └── test/
│   ├── Dockerfile
│   └── package.json
│
├── orders/                     # Orders service
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── models/
│   │   ├── routes/
│   │   ├── events/
│   │   │   ├── listeners/
│   │   │   └── publishers/
│   │   ├── nats-wrapper.ts
│   │   └── test/
│   ├── Dockerfile
│   └── package.json
│
├── payments/                   # Payments service
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── models/
│   │   ├── routes/
│   │   ├── events/
│   │   │   ├── listeners/
│   │   │   └── publishers/
│   │   ├── nats-wrapper.ts
│   │   ├── stripe.ts          # Stripe client
│   │   └── test/
│   ├── Dockerfile
│   └── package.json
│
├── expiration/                 # Expiration worker service
│   ├── src/
│   │   ├── index.ts
│   │   ├── events/
│   │   │   ├── listeners/
│   │   │   └── publishers/
│   │   ├── queues/            # Bull queue definitions
│   │   └── nats-wrapper.ts
│   ├── Dockerfile
│   └── package.json
│
├── client/                     # Next.js frontend
│   ├── pages/                 # Next.js pages
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── api/                   # API client utilities
│   ├── Dockerfile
│   └── package.json
│
├── common/                     # Shared npm package
│   ├── src/
│   │   ├── errors/            # Custom error classes
│   │   ├── middlewares/       # Express middlewares
│   │   └── events/            # Event types & interfaces
│   └── package.json
│
├── infra/                      # Kubernetes manifests
│   ├── k8s/                   # Shared K8s configs
│   ├── k8s-dev/               # Development configs
│   └── k8s-prod/              # Production configs
│
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
│
├── skaffold.yaml              # Skaffold development config
└── README.md
```

---

## Shared Package (@ms-shared-ticketing/common)

The common package is published to npm and provides shared functionality:

### Error Classes
- `BadRequestError` - 400 Bad Request
- `NotFoundError` - 404 Not Found
- `NotAuthorizedError` - 401 Unauthorized
- `DatabaseConnectionError` - 500 Database Error
- `RequestValidationError` - 400 Validation Error

### Middlewares
- `currentUser` - Extracts JWT from cookies
- `requireAuth` - Enforces authentication
- `errorHandler` - Global error handling
- `validateRequest` - express-validator integration

### Event Types
- `Subjects` - Event subject names enum
- `TicketCreatedEvent` - Ticket created payload
- `TicketUpdatedEvent` - Ticket updated payload
- `OrderCreatedEvent` - Order created payload
- `OrderCancelledEvent` - Order cancelled payload
- `ExpirationCompleteEvent` - Expiration complete payload
- `PaymentCreatedEvent` - Payment created payload

### Base Classes
- `Listener` - Abstract NATS listener
- `Publisher` - Abstract NATS publisher

