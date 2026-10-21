# Backend Starter Template Architecture & Specification Blueprint

This document is a comprehensive technical blueprint extracted from the `self-help-group-api` codebase. It serves as an exact prompt/specification for an AI Agent or developer to generate a clean, modular, production-ready TypeScript backend starter template.

---

## 1. Core Architecture & Design Paradigm

The project implements a **Modular 4-Tier Layered Architecture** with strict separation of concerns:

```
[HTTP Client Request]
       │
       ▼
[Global Middlewares] (Security, Request ID, Rate Limiter, Auth, Sanitization)
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

### Architectural Rules
1. **Controller Isolation**: Controllers only parse inputs, call services, and invoke `successResponse()` or `errorResponse()`. Never call `prisma` directly from a controller.
2. **Service Purity**: Services handle business rules, error raising (via `AppError`), and cross-entity logic.
3. **Repository Encapsulation**: Only repositories interact with the database via `prisma.<model>`.
4. **Uniform Response Envelope**: Every HTTP endpoint returns an identical JSON response structure with metadata (`timestamp`, `path`, `method`, `requestId`).
5. **Fail-Safe Type Serialization**: Prisma `Decimal`, JavaScript `BigInt`, `Date`, and `Buffer` types are automatically serialized so `JSON.stringify` never throws errors.

---

## 2. Directory & File Structure

```
backend-template/
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── jest.config.ts
├── package.json
├── plopfile.js                          # Plop generator for instant CRUD modules
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
│   │   ├── common.message.constant.ts   # System message codes
│   │   └── message.code.type.ts
│   ├── middlewares/
│   │   ├── index.ts
│   │   ├── validateRequest.ts           # Joi validation middleware
│   │   ├── requestLogger.ts             # Winston HTTP request logger
│   │   ├── jwt.ts                       # JWT Authentication & session verification
│   │   └── rateLimiter.ts               # Express rate limiter
│   ├── modules/
│   │   ├── index.ts                     # Aggregated routes
│   │   └── <module-name>/               # Self-contained feature module
│   │       ├── <module>.routes.ts
│   │       ├── <module>.controller.ts
│   │       ├── <module>.service.ts
│   │       ├── <module>.repository.ts
│   │       ├── <module>.validator.ts
│   │       └── <module>.type.ts
│   ├── types/
│   │   └── express.d.ts                 # Global Express Request typing
│   └── utils/
│       ├── index.ts
│       ├── logger.ts                    # Winston daily rotating logger
│       ├── responseFormatter.ts         # Unified success and error response envelopes
│       ├── prismaErrorHandler.ts        # Prisma error mapper & AppError class
│       └── pagination.ts                # Pagination helpers
└── tests/
    ├── __mocks__/
    ├── integration/
    └── unit/
```

---

## 3. Standard API Response Envelopes

### 3.1 Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "cuid-12345",
    "name": "Sample Entity"
  },
  "message": "Entity created successfully",
  "statusCode": 201,
  "timestamp": "2026-10-21T11:20:00.000Z",
  "method": "POST",
  "path": "/api/v1/o/sample",
  "requestId": "a8a4f664-9037-4d76-b337-0cfc3e7f41f0"
}
```

### 3.2 Error Response (`400 Bad Request` / `404 Not Found` / `500 Internal Server Error`)
```json
{
  "success": false,
  "error": "Field 'email' must be a valid email address",
  "message": "VALIDATION_FAILED_400",
  "statusCode": 400,
  "timestamp": "2026-10-21T11:20:00.000Z",
  "method": "POST",
  "path": "/api/v1/o/sample",
  "requestId": "a8a4f664-9037-4d76-b337-0cfc3e7f41f0"
}
```

### 3.3 Response Formatter Implementation (`src/utils/responseFormatter.ts`)
```typescript
import { Request, Response } from 'express';

function sanitizeForJson(value: any): any {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value.toString('base64');
  if (t !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizeForJson);

  const result: Record<string, any> = {};
  for (const key of Object.keys(value)) {
    result[key] = sanitizeForJson(value[key]);
  }
  return result;
}

export function getDefaultSuccessMessage(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET': return 'Success';
    case 'POST': return 'Created';
    case 'PUT':
    case 'PATCH': return 'Updated';
    case 'DELETE': return 'Deleted';
    default: return 'Success';
  }
}

export const successResponse = (
  res: Response,
  data: any,
  statusCode: number = 200,
  message?: string,
): Response => {
  const req = res.req as Request;
  return res.status(statusCode).json({
    success: true,
    data: sanitizeForJson(data),
    message: message || getDefaultSuccessMessage(req.method),
    statusCode,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl ? req.originalUrl.split('?')[0] : '',
    requestId: (req as any).requestId || null,
  });
};

export const errorResponse = (
  res: Response,
  error: any,
  statusCode: number = 500,
  message: string = 'Internal server error',
): Response => {
  const req = res.req as Request;
  return res.status(statusCode).json({
    success: false,
    error: typeof error === 'object' && error?.message ? error.message : error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl ? req.originalUrl.split('?')[0] : '',
    requestId: (req as any).requestId || null,
  });
};
```

---

## 4. Joi Request Validation

### 4.1 Schema Definition (`<module>.validator.ts`)
```typescript
import Joi from 'joi';

export const ExampleValidator = {
  createOrUpdate: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone must be a valid 10-digit number',
      }),
    role: Joi.string().valid('ADMIN', 'USER', 'MANAGER').default('USER'),
  }).options({ abortEarly: false, stripUnknown: true }),
};
```

### 4.2 Validation Middleware (`src/middlewares/validateRequest.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { errorResponse } from '../utils';

export const validateRequest = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorDetails: Record<string, string> = {};
      error.details.forEach((err) => {
        const key = err.context?.key || 'unknown';
        if (!errorDetails[key]) {
          errorDetails[key] = err.message.replaceAll(/['"]/g, '');
        }
      });

      const firstError = error.details[0].message.replaceAll(/['"]/g, '');
      errorResponse(res, firstError, 400, 'VALIDATION_FAILED_400');
      return;
    }

    req.body = value; // Assign validated & sanitized values
    next();
  };
};
```

---

## 5. Prisma ORM Architecture

### 5.1 Prisma Decimal-to-String Extension (`src/common/prisma.ts`)
```typescript
import { PrismaClient, Prisma } from '@prisma/client';

const prismaClient = new PrismaClient();

const convert = (obj: any): any => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(convert);
  if (obj instanceof Prisma.Decimal) return obj.toString();
  if (typeof obj === 'object') {
    for (const key in obj) {
      obj[key] = convert(obj[key]);
    }
  }
  return obj;
};

// Global Decimal-to-String conversion middleware
const prisma = prismaClient.$extends({
  query: {
    $allOperations: async ({ args, query }) => {
      const result = await query(args);
      return convert(result);
    },
  },
}) as unknown as PrismaClient;

export default prisma;
```

### 5.2 Repository CRUD & Pagination Pattern (`<module>.repository.ts`)
```typescript
import prisma from '../../common/prisma';
import { PaginationInput } from '../../utils';

export const ExampleRepository = {
  async create(data: any) {
    return prisma.example.create({ data });
  },

  async getAll() {
    return prisma.example.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async getPaginated(pagination: PaginationInput) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.example.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.example.count(),
    ]);

    return {
      data,
      total,
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(id: string) {
    return prisma.example.findUnique({ where: { id } });
  },

  async update(id: string, data: any) {
    return prisma.example.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.example.delete({ where: { id } });
  },
};
```

---

## 6. Error Handling Strategy

### 6.1 Custom AppError (`src/utils/prismaErrorHandler.ts`)
```typescript
export class AppError extends Error {
  public code: number;
  public statusCode: number;
  public field?: string;

  constructor(statusCode: number, message: string, field?: string) {
    super(message);
    this.code = statusCode;
    this.statusCode = statusCode;
    this.field = field;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
```

### 6.2 Prisma Error Code Translation
```typescript
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: any): { statusCode: number; message: string; field?: string } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2000':
        return { statusCode: 400, message: 'Input value is too long for the field.' };
      case 'P2001':
      case 'P2025':
        return { statusCode: 404, message: 'Record not found.' };
      case 'P2002': {
        const target = Array.isArray(error.meta?.target)
          ? error.meta?.target.join(', ')
          : String(error.meta?.target || '');
        return {
          statusCode: 409,
          message: `Unique constraint failed on field: ${target}`,
          field: target,
        };
      }
      case 'P2003': {
        const field = String(error.meta?.field_name || '');
        return {
          statusCode: 400,
          message: `Foreign key constraint failed on field: ${field}`,
          field,
        };
      }
      default:
        return { statusCode: 400, message: `Database error code ${error.code}` };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: 400, message: 'Database schema validation error.' };
  }

  return { statusCode: 500, message: 'An unexpected internal database error occurred.' };
}
```

### 6.3 Global Error Handler Middleware (`src/app.ts`)
```typescript
app.use((err: any, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';

  const sanitizedHeaders = { ...req.headers };
  delete sanitizedHeaders.authorization;
  delete sanitizedHeaders.cookie;

  logger.error('Unhandled Application Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
    headers: sanitizedHeaders,
    requestId: (req as any).requestId || null,
  });

  errorResponse(res, message, statusCode);
});
```

---

## 7. Standard 6-File Feature Module

Each domain feature module consists of exactly 6 files:

### 7.1 `<module>.type.ts`
```typescript
export interface ExampleCreateInput {
  name: string;
  email: string;
  phone: string;
}

export type ExampleUpdateInput = Partial<ExampleCreateInput>;
```

### 7.2 `<module>.validator.ts`
```typescript
import Joi from 'joi';

export const ExampleValidator = {
  createOrUpdate: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  }),
};
```

### 7.3 `<module>.repository.ts`
```typescript
import prisma from '../../common/prisma';
import { ExampleCreateInput, ExampleUpdateInput } from './example.type';

export const ExampleRepository = {
  async create(data: ExampleCreateInput) {
    return prisma.example.create({ data });
  },
  async getAll() {
    return prisma.example.findMany();
  },
  async getById(id: string) {
    return prisma.example.findUnique({ where: { id } });
  },
  async update(id: string, data: ExampleUpdateInput) {
    return prisma.example.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.example.delete({ where: { id } });
  },
};
```

### 7.4 `<module>.service.ts`
```typescript
import { ExampleRepository } from './example.repository';
import { ExampleCreateInput, ExampleUpdateInput } from './example.type';
import { AppError } from '../../utils';

export const ExampleService = {
  async create(data: ExampleCreateInput) {
    return ExampleRepository.create(data);
  },
  async getAll() {
    return ExampleRepository.getAll();
  },
  async getById(id: string) {
    const item = await ExampleRepository.getById(id);
    if (!item) throw new AppError(404, 'Example not found');
    return item;
  },
  async update(id: string, data: ExampleUpdateInput) {
    await this.getById(id);
    return ExampleRepository.update(id, data);
  },
  async delete(id: string) {
    await this.getById(id);
    return ExampleRepository.delete(id);
  },
};
```

### 7.5 `<module>.controller.ts`
```typescript
import { Request, Response } from 'express';
import { ExampleService } from './example.service';
import { successResponse, errorResponse, AppError } from '../../utils';

export const ExampleController = {
  async create(req: Request, res: Response) {
    try {
      const result = await ExampleService.create(req.body);
      successResponse(res, result, 201, 'Created successfully');
    } catch (error: any) {
      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
        return;
      }
      errorResponse(res, 'Failed to create record', 500, error.message);
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const result = await ExampleService.getAll();
      successResponse(res, result, 200, 'Fetched successfully');
    } catch (error: any) {
      errorResponse(res, 'Failed to fetch records', 500, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const result = await ExampleService.getById(req.params.id);
      successResponse(res, result, 200, 'Fetched record');
    } catch (error: any) {
      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
        return;
      }
      errorResponse(res, 'Failed to get record', 500, error.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const result = await ExampleService.update(req.params.id, req.body);
      successResponse(res, result, 200, 'Updated successfully');
    } catch (error: any) {
      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
        return;
      }
      errorResponse(res, 'Failed to update record', 500, error.message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await ExampleService.delete(req.params.id);
      successResponse(res, result, 200, 'Deleted successfully');
    } catch (error: any) {
      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
        return;
      }
      errorResponse(res, 'Failed to delete record', 500, error.message);
    }
  },
};
```

### 7.6 `<module>.routes.ts`
```typescript
import { Router } from 'express';
import { ExampleController } from './example.controller';
import { ExampleValidator } from './example.validator';
import { validateRequest } from '../../middlewares';

const router = Router();

router.post('/o/example', validateRequest(ExampleValidator.createOrUpdate), ExampleController.create);
router.get('/o/example', ExampleController.getAll);
router.get('/o/example/:id', ExampleController.getById);
router.put('/o/example/:id', validateRequest(ExampleValidator.createOrUpdate), ExampleController.update);
router.delete('/o/example/:id', ExampleController.delete);

export default router;
```

---

## 8. Plop Code Generator Configuration (`plopfile.js`)

Add `plop` to generate entire modules in seconds:
```javascript
module.exports = function (plop) {
  plop.setGenerator('module', {
    description: 'Generate a complete 6-tier CRUD module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Enter module name (e.g. product):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.routes.ts',
        templateFile: 'plop-templates/routes.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.controller.ts',
        templateFile: 'plop-templates/controller.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.service.ts',
        templateFile: 'plop-templates/service.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.repository.ts',
        templateFile: 'plop-templates/repository.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.type.ts',
        templateFile: 'plop-templates/type.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{dashCase name}}/{{dashCase name}}.validator.ts',
        templateFile: 'plop-templates/validator.hbs',
      },
    ],
  });
};
```

---

## 9. Security, Middlewares & Observability

### 9.1 Express App Pipeline (`src/app.ts`)
1. **CORS**: Domain whitelist origin verification.
2. **Helmet**: HSTS, CSP, X-Frame-Options, NoSniff.
3. **Compression**: Gzip/Brotli response compression.
4. **Parsers with Body Limits**: `express.json({ limit: '10kb' })` to prevent memory exhaustion.
5. **Sanitization**:
   - `express-mongo-sanitize`: NoSQL injection defense.
   - `express-xss-sanitizer`: Strip malicious HTML scripts.
   - `hpp`: Protect against HTTP Parameter Pollution.
6. **Dotfile Shield**: Blocks requests attempting to fetch `/.env`, `/.git`, etc.
7. **Request Tracking**: Every request is assigned a `uuidv4()` on entry:
   ```typescript
   app.use((req, _res, next) => {
     (req as any).requestId = uuidv4();
     next();
   });
   ```

### 9.2 Winston Logging (`src/utils/logger.ts`)
- Dual output: Colorized Console in local development + Daily Rotating Files (`app-%DATE%.log`, `error-%DATE%.log`).
- Child loggers with context:
  ```typescript
  export const getModuleLogger = (name: string) => logger.child({ module: name });
  ```

---

## 10. Agent Execution Checklist

When instructing an Agent to generate the template from this specification:
- [x] Create package.json with dependencies (`express`, `@prisma/client`, `joi`, `winston`, `helmet`, `cors`, `uuid`, `dotenv`).
- [x] Configure TypeScript (`tsconfig.json`) with strict checks enabled.
- [x] Configure ESLint and Prettier.
- [x] Implement extended Prisma client with Decimal serialization.
- [x] Implement Joi validation middleware.
- [x] Implement response formatters (`successResponse`, `errorResponse`).
- [x] Implement `AppError` and Prisma error translation.
- [x] Set up Winston logger with rotating files.
- [x] Implement Plop generator with the 6 `.hbs` templates.
- [x] Provide a working sample module (`src/modules/user`) connected to `prisma/schema.prisma`.
- [x] Set up Jest and Supertest test harness.
