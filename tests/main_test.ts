import { assertEquals } from "@std/assert";
import { verifyToken } from "../auth/jwt.ts";

function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createTestToken(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(
    `${base64UrlEncode(JSON.stringify(header))}.${
      base64UrlEncode(JSON.stringify(payload))
    }`,
  );

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${base64UrlEncode(JSON.stringify(header))}.${
    base64UrlEncode(JSON.stringify(payload))
  }.${signatureB64}`;
}

Deno.test("verifyToken should validate a valid token with custom payload", async () => {
  const secret = Deno.env.get("JWT_SECRET") ||
    "default-secret-change-in-production";
  const payload = {
    user: "test-user",
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const token = await createTestToken(payload, secret);
  const result = await verifyToken(token);

  assertEquals(result?.user, "test-user");
  assertEquals(result?.role, "admin");
  assertEquals(typeof result?.exp, "number");
});

Deno.test("verifyToken should reject an invalid token", async () => {
  const payload = await verifyToken("invalid.token.here");
  assertEquals(payload, null);
});

Deno.test("verifyToken should reject a malformed token", async () => {
  const payload = await verifyToken("not-a-jwt");
  assertEquals(payload, null);
});

Deno.test("verifyToken should reject token with wrong secret", async () => {
  const payload = {
    user: "test-user",
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const token = await createTestToken(payload, "wrong-secret");
  const result = await verifyToken(token);
  assertEquals(result, null);
});

Deno.test("verifyToken should accept flexible payload fields", async () => {
  const secret = Deno.env.get("JWT_SECRET") ||
    "default-secret-change-in-production";
  const payload = {
    custom_field: "value",
    nested: { id: 123 },
    list: [1, 2, 3],
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const token = await createTestToken(payload, secret);
  const result = await verifyToken(token);

  assertEquals(result?.custom_field, "value");
  assertEquals((result?.nested as Record<string, number>)?.id, 123);
  assertEquals(result?.list, [1, 2, 3]);
});
