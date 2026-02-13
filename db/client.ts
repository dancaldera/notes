import { postgres } from "../deps.ts";

let client: postgres.Sql<Record<string, never>> | null = null;

export function getClient(): postgres.Sql<Record<string, never>> {
  if (!client) {
    const databaseUrl = Deno.env.get("DATABASE_URL");

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    client = postgres(databaseUrl, {
      max: 10,
    });
  }

  return client;
}
