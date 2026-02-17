# AGENTS.md

Guidelines for AI coding agents working in this Deno Notes API codebase.

## Project Overview

A minimal RESTful API for managing notes, built with Deno 2.x, Oak framework, and PostgreSQL.

## Build/Run Commands

```bash
# Development (with hot reload)
deno task dev

# Production
deno task start

# Initialize database schema
deno task init-db

# Run all tests
deno test --allow-net --allow-env --allow-read

# Run a single test file
deno test --allow-net --allow-env --allow-read tests/main_test.ts

# Run a specific test by name
deno test --allow-net --allow-env --allow-read --filter "testName" tests/main_test.ts

# Format code
deno fmt

# Check formatting (CI)
deno fmt --check

# Lint code
deno lint

# Lint with auto-fix
deno lint --fix
```

## Code Style Guidelines

### Imports

Organize imports in this order, separated by blank lines:

1. `import "@std/dotenv/load";` - Environment loader (if needed, must be first)
2. External dependencies from `deps.ts`
3. Type imports (use `import type`)
4. Local imports

```typescript
import "@std/dotenv/load";
import { Router } from "../deps.ts";
import type { CreateNoteDTO, UpdateNoteDTO } from "../types/notes.ts";
import * as noteQueries from "../db/queries.ts";
```

**Always add dependencies to `deps.ts`** and re-export from there, rather than importing directly from external packages in source files.

### TypeScript

- Use strict TypeScript (implicit in Deno)
- Prefer interfaces over type aliases for object shapes
- Use `type` keyword for type-only imports: `import type { Note }`
- Explicit return types on exported functions
- Use `| null` for nullable fields, not `?` on required database fields

```typescript
export interface Note {
  id: number;
  title: string;
  content: string | null;  // nullable database field
  created_at: string;
  updated_at: string;
}
```

### Naming Conventions

- **Files:** lowercase with underscores (`notes.ts`, `main_test.ts`)
- **Interfaces:** PascalCase (`Note`, `CreateNoteDTO`)
- **Functions:** camelCase (`getAllNotes`, `getNoteById`)
- **Variables:** camelCase (`const client`, `const result`)
- **Constants:** camelCase for regular, SCREAMING_SNAKE_CASE for true constants
- **Exported routers:** default export (`export default router`)
- **Utility functions:** named exports (`export async function getAllNotes()`)

### Error Handling

Use consistent error response format throughout route handlers:

```typescript
try {
  // operation
} catch (error) {
  ctx.response.status = 500;
  ctx.response.body = {
    error: "Descriptive error message",
    details: error instanceof Error ? error.message : String(error),
  };
}
```

For client errors (400, 404):

```typescript
ctx.response.status = 400;
ctx.response.body = { error: "Invalid request" };
```

### API Response Format

Success response:
```json
{
  "id": 1,
  "title": "Note title",
  "content": "Note content",
  "created_at": "2025-02-13T10:30:00Z",
  "updated_at": "2025-02-13T10:30:00Z"
}
```

Error response:
```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

### Middleware Pattern

All route handlers should use try/catch. The application has global error middleware, but handlers should catch and set appropriate status codes.

```typescript
router.get("/api/resource/:id", async (ctx) => {
  try {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid ID" };
      return;
    }

    // ... rest of handler
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to fetch resource",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});
```

### Database Queries

Use the postgres.js tagged template literal syntax for safe queries:

```typescript
const result = await client<Note[]>`
  SELECT id, title, content, created_at, updated_at
  FROM notes
  WHERE id = ${id}
`;
```

Use `client.unsafe()` only for dynamic SQL (like UPDATE with optional fields).

### Testing

Tests use Deno's built-in test runner with `@std/assert`:

```typescript
import { assertEquals } from "@std/assert";

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
```

For async tests:

```typescript
Deno.test(async function fetchNotesTest() {
  const notes = await getAllNotes();
  assertEquals(Array.isArray(notes), true);
});
```

## Project Structure

```
notes/
├── main.ts              # Entry point, server + middleware setup
├── deps.ts              # Centralized dependency exports
├── deno.json            # Deno config (tasks, imports)
├── db/
│   ├── client.ts        # PostgreSQL connection singleton
│   ├── schema.ts        # Database schema SQL
│   └── queries.ts       # SQL query functions
├── routes/
│   └── notes.ts         # Notes route handlers
├── types/
│   └── notes.ts         # TypeScript interfaces
├── scripts/
│   └── init_db.ts       # Database initialization
├── tests/
│   └── main_test.ts     # Test files
└── .env.example         # Environment template
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 8000)

## Permission Flags

Deno requires explicit permissions:

- `--allow-net` - HTTP server + database connectivity
- `--allow-env` - Read environment variables
- `--allow-read` - Load .env file

## Before Committing

1. Run `deno fmt` to format code
2. Run `deno lint` to check for issues
3. Run `deno test --allow-net --allow-env --allow-read` to verify tests pass
