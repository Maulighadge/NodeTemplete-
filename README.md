# 🚀 Production-Ready Node.js + Express + TypeScript + Prisma Starter Template

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-indigo.svg)](https://www.prisma.io/)
[![Joi Validation](https://img.shields.io/badge/Validation-Joi-orange.svg)](https://joi.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A battle-tested, modular 4-tier layered architecture starter template for scalable REST APIs. Built with **Node.js**, **Express**, **TypeScript**, **Prisma ORM**, and **Joi Validation**, featuring strict separation of concerns, uniform response envelopes, automated CRUD scaffolding, robust error translation, and comprehensive security middleware.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Directory Structure](#-directory-structure)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup & Seeding](#database-setup--seeding)
  - [Running the App](#running-the-app)
- [Standard API Response Format](#-standard-api-response-format)
- [CRUD Module Generator (Plop CLI)](#-crud-module-generator-plop-cli)
- [Security & Middlewares](#-security--middlewares)
- [Logging Architecture](#-logging-architecture)
- [Testing](#-testing)
- [Available NPM Scripts](#-available-npm-scripts)

---

## 🏛 Architectural Overview

The template strictly adheres to a **Modular 4-Tier Layered Architecture**:

```
[HTTP Client Request]
       │
       ▼
[Global Middlewares] (Request ID, Helmet, CORS, Rate Limiter, Compression, Sanitization)
       │
       ▼
[Route Layer] (`*.routes.ts`) ──> Validates Request Body (Joi) & Binds Middlewares
       │
       ▼
[Controller Layer] (`*.controller.ts`) ──> Handles req/res, extracts params, catches errors
       │
       ▼
[Service Layer] (`*.service.ts`) ──> Executes business logic and orchestrations
       │
       ▼
[Repository Layer] (`*.repository.ts`) ──> Direct Prisma ORM access & database transactions
       │
       ▼
[Prisma Client / PostgreSQL]
```

### Core Architectural Rules:
1. **Controller Isolation**: Controllers only parse inputs, call services, and invoke `successResponse()` or `errorResponse()`. Never call `prisma` directly from a controller.
2. **Service Purity**: Services handle business rules, error raising (via `AppError`), and cross-entity logic.
3. **Repository Encapsulation**: Only repositories interact with the database via `prisma.<model>`.
4. **Uniform Response Envelope**: Every HTTP endpoint returns an identical JSON response structure with metadata (`timestamp`, `path`, `method`, `requestId`).
5. **Fail-Safe Type Serialization**: Prisma `Decimal`, JavaScript `BigInt`, `Date`, and `Buffer` types are automatically serialized so `JSON.stringify` never throws errors.

---

## 📁 Directory Structure

```text
├── .env.example                         # Environment configuration template
├── .eslintrc.json                       # ESLint rules
├── .gitignore                           # Git ignore definitions
├── .prettierrc                          # Prettier code formatting rules
├── BACKEND_TEMPLATE_BLUEPRINT.md        # Technical specification blueprint
├── jest.config.ts                       # Jest test harness configuration
├── package.json                         # Dependencies and npm scripts
├── plopfile.js                          # Plop generator for instant CRUD modules
├── tsconfig.json                        # Strict TypeScript compiler options
├── plop-templates/                      # Scaffolding templates
│   ├── controller.hbs
│   ├── repository.hbs
│   ├── routes.hbs
│   ├── service.hbs
│   ├── type.hbs
│   └── validator.hbs
├── prisma/
│   ├── schema.prisma                    # Prisma models and migrations
│   └── seed.ts                          # Database seeding script
├── src/
│   ├── index.ts                         # App entrypoint (listens on PORT)
│   ├── app.ts                           # Express app configuration & middleware pipeline
│   ├── common/
│   │   ├── index.ts
│   │   └── prisma.ts                    # Extended Prisma Client (Decimal-to-string serializer)
│   ├── constants/
│   │   ├── common.message.constant.ts   # System message constants
│   │   ├── message.code.type.ts         # Standard message code types
│   │   └── index.ts
│   ├── middlewares/
│   │   ├── index.ts
│   │   ├── validateRequest.ts           # Joi validation middleware
│   │   ├── requestLogger.ts             # Winston HTTP request logger
│   │   ├── jwt.ts                       # JWT Authentication & role authorization
│   │   └── rateLimiter.ts               # Express rate limiter
│   ├── modules/
│   │   ├── index.ts                     # Aggregated routes & health check
│   │   ├── user/                        # Example User feature module
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.validator.ts
│   │   │   └── user.type.ts
│   │   └── example/                     # Blueprint Example module
│   │       ├── example.routes.ts
│   │       ├── example.controller.ts
│   │       ├── example.service.ts
│   │       ├── example.repository.ts
│   │       ├── example.validator.ts
│   │       └── example.type.ts
│   ├── types/
│   │   └── express.d.ts                 # Global Express Request typing
│   └── utils/
│       ├── index.ts
│       ├── logger.ts                    # Winston daily rotating logger
│       ├── responseFormatter.ts         # Unified success and error response envelopes
│       ├── prismaErrorHandler.ts        # Prisma error mapper & AppError class
│       └── pagination.ts                # Pagination helpers
└── tests/
    ├── integration/                     # Supertest HTTP integration tests
    │   └── app.test.ts
    └── unit/                            # Jest unit tests
        ├── prismaErrorHandler.test.ts
        ├── responseFormatter.test.ts
        └── validateRequest.test.ts
```

---

## ⚡ Key Features

- **Strict TypeScript Setup**: Strict null checks, absolute path mappings (`@modules/*`, `@utils/*`, etc.).
- **Extended Prisma Client**: Automatic conversion of `Prisma.Decimal` to `string` across all database queries.
- **Fail-Safe JSON Serialization**: Safely transforms `BigInt`, `Date`, and `Buffer` before sending JSON responses.
- **Declarative Validation**: Schema-driven validation using `Joi` with clean error messages.
- **Plop Module Scaffolding**: Create a full 6-file production-ready CRUD feature in seconds via `npm run generate:module`.
- **Centralized Error Handling**: Automatic mapping of Prisma error codes (`P2002` duplicate, `P2025` not found, `P2003` foreign key violation) to clean HTTP responses.
- **Observability & Logging**: Dual Winston logger with colorized terminal logs in development and daily rotating log files in production.
- **Security Hardened**: Helmet HTTP headers, CORS origin verification, HPP parameter pollution shield, dotfile protection, and rate limiting.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (>= 20.x)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL / MySQL / SQLite supported)
- **Validation**: Joi
- **Logging**: Winston + Winston Daily Rotate File
- **Security**: Helmet, CORS, HPP, Express-Rate-Limit
- **Generator**: Plop.js
- **Testing**: Jest, ts-jest, Supertest

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- PostgreSQL database (or update `provider` in `prisma/schema.prisma` to your database)

### Installation

```bash
# Clone the repository
git clone https://github.com/Maulighadge/NodeTemplete-.git
cd NodeTemplete-

# Install dependencies
npm install
```

### Environment Variables

Copy the example environment file and adjust the values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port for the HTTP server | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection URL | `"postgresql://postgres:postgres@localhost:5432/node_template_db?schema=public"` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:3000,http://localhost:5173` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `node_template_dev_secret_key_12345` |
| `JWT_EXPIRES_IN` | Token expiration timeframe | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 mins) |
| `RATE_LIMIT_MAX_REQUESTS`| Max requests per IP in the window | `100` |
| `LOG_LEVEL` | Minimum log level (`debug`, `info`, `warn`, `error`) | `info` |

### Database Setup & Seeding

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial admin and sample records
npm run prisma:seed

# Optional: Open Prisma Studio web GUI
npm run prisma:studio
```

### Running the App

```bash
# Development mode (with live reload)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Health check will be available at: `http://localhost:5000/health`

---

## 📦 Standard API Response Format

All responses follow an identical, predictable envelope.

### Success Response (`200 OK` / `201 Created`)

```json
{
  "success": true,
  "data": {
    "id": "cuid-12345",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "role": "USER",
    "createdAt": "2026-10-21T06:00:00.000Z",
    "updatedAt": "2026-10-21T06:00:00.000Z"
  },
  "message": "User created successfully",
  "statusCode": 201,
  "timestamp": "2026-10-21T06:00:00.000Z",
  "method": "POST",
  "path": "/api/v1/user",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Response (`400 Bad Request` / `404 Not Found` / `409 Conflict`)

```json
{
  "success": false,
  "error": "Field 'email' must be a valid email",
  "message": "VALIDATION_FAILED_400",
  "statusCode": 400,
  "timestamp": "2026-10-21T06:00:00.000Z",
  "method": "POST",
  "path": "/api/v1/user",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## ⚡ CRUD Module Generator (Plop CLI)

Easily scaffold a complete 6-file feature module adhering to the 4-tier architecture:

```bash
npm run generate:module
```

Prompt:
```text
? Enter module name (e.g. product): order
```

This instantly creates:
- `src/modules/order/order.type.ts`
- `src/modules/order/order.validator.ts`
- `src/modules/order/order.repository.ts`
- `src/modules/order/order.service.ts`
- `src/modules/order/order.controller.ts`
- `src/modules/order/order.routes.ts`

Then simply register the route in `src/modules/index.ts`:
```typescript
import orderRoutes from './order/order.routes';
router.use('/', orderRoutes);
```

---

## 🛡 Security & Middlewares

1. **Request Tracking (`requestId`)**: Every incoming request is assigned a UUID for distributed tracing.
2. **Security Headers (`helmet`)**: Protects against common vulnerabilities like XSS, Clickjacking, and MIME-sniffing.
3. **CORS Protection**: Enforces domain allowlisting.
4. **Compression (`compression`)**: Gzip compression on all responses for optimal network performance.
5. **Body Limits (`express.json({ limit: '10kb' })`)**: Shields against payload memory exhaustion attacks.
6. **HTTP Parameter Pollution (`hpp`)**: Prevents array pollution in query strings.
7. **Dotfile Shield**: Rejects requests targeting sensitive hidden files (`/.env`, `/.git`).
8. **Rate Limiting**: Configurable IP-based rate limiting to prevent DDoS and brute-force attempts.
9. **JWT Authentication & Authorization**: Pre-built middlewares for Bearer token validation and role-based access control.

---

## 📊 Logging Architecture

The logging system utilizes **Winston**:
- **Console**: Human-readable, colorized output with timestamps and error stack traces.
- **Rotating Files**: Automated rotation via `winston-daily-rotate-file`:
  - `logs/app-YYYY-MM-DD.log` (retention: 14 days)
  - `logs/error-YYYY-MM-DD.log` (retention: 30 days)

Create child loggers with context:
```typescript
import { getModuleLogger } from '@utils/logger';
const logger = getModuleLogger('AuthService');
logger.info('User authenticated successfully');
```

---

## 🧪 Testing

The template comes configured with **Jest** and **Supertest**:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 📜 Available NPM Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server with live reload |
| `npm run build` | Compile TypeScript into `./dist` directory |
| `npm start` | Run compiled production build from `./dist` |
| `npm run lint` | Check code for ESLint issues |
| `npm run lint:fix` | Automatically fix ESLint errors |
| `npm run format` | Format codebase using Prettier |
| `npm test` | Run test suite with Jest |
| `npm run test:coverage`| Generate unit and integration test coverage |
| `npm run prisma:generate` | Generate Prisma client bindings |
| `npm run prisma:migrate` | Apply Prisma database migrations |
| `npm run prisma:seed` | Execute database seed script |
| `npm run prisma:studio` | Launch Prisma Studio GUI |
| `npm run generate:module` | Scaffold a new 6-tier feature module with Plop |

---

## 👨‍💻 Author

**Mauli Ghadge**
- GitHub: [@Maulighadge](https://github.com/Maulighadge)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
