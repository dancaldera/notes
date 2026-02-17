# Deno Notes API, V2

A minimal RESTful API for managing notes, built with Deno, Oak, and PostgreSQL.

## Prerequisites

- [Deno 2.x](https://deno.com/)
- PostgreSQL (local or [Neon](https://neon.tech))

## Database Setup

### Local PostgreSQL

```bash
# Create the database
createdb notesdb

# Run the schema
psql -d notesdb -f <(cat <<'SQL'
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
SQL
)
```

### Using Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Get the connection string from the dashboard
3. Set up your `.env` file with the `DATABASE_URL`

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` with your database credentials:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/notesdb
PORT=8000
```

## Running the Server

### Development (with hot reload)

```bash
deno run --watch --allow-net --allow-env --allow-read main.ts
```

### Production

```bash
deno run --allow-net --allow-env --allow-read main.ts
```

**Permission flags:**

- `--allow-net`: HTTP server + database connectivity
- `--allow-env`: Read DATABASE_URL environment variable
- `--allow-read`: Load .env file

## API Endpoints

| Method | Endpoint         | Description     | Request Body         |
| ------ | ---------------- | --------------- | -------------------- |
| GET    | `/api/notes`     | List all notes  | -                    |
| GET    | `/api/notes/:id` | Get single note | -                    |
| POST   | `/api/notes`     | Create note     | `{title, content?}`  |
| PATCH  | `/api/notes/:id` | Update note     | `{title?, content?}` |
| DELETE | `/api/notes/:id` | Delete note     | -                    |

## Usage Examples

### Create a note

```bash
curl -X POST http://localhost:8000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Note", "content": "Hello, Deno!"}'
```

### List all notes

```bash
curl http://localhost:8000/api/notes
```

### Get a single note

```bash
curl http://localhost:8000/api/notes/1
```

### Update a note

```bash
curl -X PATCH http://localhost:8000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated content"}'
```

### Delete a note

```bash
curl -X DELETE http://localhost:8000/api/notes/1
```

## Response Format

### Success

```json
{
  "id": 1,
  "title": "My Note",
  "content": "Note content",
  "created_at": "2025-02-13T10:30:00Z",
  "updated_at": "2025-02-13T10:30:00Z"
}
```

### Error

```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

## Project Structure

```
notes/
├── main.ts              # Entry point, server setup
├── deps.ts              # Centralized dependency exports
├── db/
│   ├── client.ts        # PostgreSQL connection singleton
│   ├── schema.ts        # Database schema SQL
│   └── queries.ts       # SQL query functions
├── routes/
│   └── notes.ts         # Notes route handlers
├── types/
│   └── notes.ts         # TypeScript interfaces
├── scripts/
│   └── init_db.ts       # Database initialization script
├── tests/
│   └── main_test.ts     # Test files
├── .env.example         # Environment template
└── README.md            # This file
```

## Technology Stack

- **Oak** (`jsr:@oak/oak`) - HTTP server framework
- **postgres.js** (`npm:postgres@3.4.5`) - PostgreSQL client
- **std/dotenv** (`jsr:@std/dotenv`) - Environment configuration

## Deployment

### Deno Deploy

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to [dash.deno.com](https://dash.deno.com)
3. Click "New Project"
4. Connect your Git repository
5. Configure:
   - **Entrypoint**: `main.ts`
   - **Region**: Select nearest region
6. Add environment variable: `DATABASE_URL` (your Neon or PostgreSQL connection
   string)
7. Click "Deploy"

Or deploy via CLI:

```bash
deno deploy create --org "Daniel Caldera Rosas" --app "notes" --source=. --region=global
```

**Important**: Deno Deploy uses environment variables directly. Add
`DATABASE_URL` in the project settings dashboard after deployment.

### Initialize Database on Production

After setting up your database, run the schema:

```bash
# Using Neon
# Go to your Neon dashboard → SQL Editor
# Run the schema from db/schema.ts
```
