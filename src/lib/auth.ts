export const AUTH_COOKIE = "yaorganize-auth";
const SESSION_DATA = "yaorganize-session";

function getPassword(): string {
  return process.env.APP_PASSWORD?.trim() || "";
}

async function signSession(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_DATA));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isAuthConfigured(): boolean {
  return getPassword().length > 0;
}

export async function createSessionToken(): Promise<string | null> {
  const password = getPassword();
  if (!password) return null;
  return signSession(password);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const expected = await createSessionToken();
  if (!expected || !token) return false;
  if (token.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyPassword(input: string): boolean {
  const expected = getPassword();
  if (!expected || !input) return false;
  if (input.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
