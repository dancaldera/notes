import "@std/dotenv/load";
import { Application } from "./deps.ts";
import notesRouter from "./routes/notes.ts";

const port = parseInt(Deno.env.get("PORT") || "8000", 10);

const app = new Application();

// CORS middleware
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }

  await next();
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Unhandled error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    };
  }
});

// Request logging middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(
    `${ctx.request.method} ${ctx.request.url} - ${ctx.response.status} (${duration}ms)`
  );
});

// Routes
app.use(notesRouter.routes());
app.use(notesRouter.allowedMethods());

// Start server
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port });
