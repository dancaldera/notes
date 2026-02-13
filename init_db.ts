import "@std/dotenv/load";
import { getClient } from "./db/client.ts";
import { schemaSql } from "./db/schema.ts";

async function initDatabase() {
  try {
    const client = getClient();
    console.log("Running database schema...");

    // Split the schema into individual statements and execute them
    const statements = schemaSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await client.unsafe(statement);
    }

    console.log("Database schema created successfully!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    Deno.exit(1);
  } finally {
    const client = getClient();
    await client.end();
  }
}

await initDatabase();
