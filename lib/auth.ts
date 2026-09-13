import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

export type AuthScope = "main" | "worker";

const SESSION_COOKIE: Record<AuthScope, string> = {
  main: "main_session",
  worker: "worker_session",
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

function scopeEnv(scope: AuthScope) {
  const prefix = scope === "main" ? "MAIN_AUTH" : "WORKER_AUTH";
  const user = process.env[`${prefix}_USER`];
  const passHash = process.env[`${prefix}_PASS_HASH`];
  if (!user || !passHash) {
    throw new Error(`${prefix}_USER / ${prefix}_PASS_HASH are not configured`);
  }
  return { user, passHash };
}

export function cookieNameFor(scope: AuthScope) {
  return SESSION_COOKIE[scope];
}

export async function verifyCredentials(
  scope: AuthScope,
  username: string,
  password: string
): Promise<boolean> {
  const { user, passHash } = scopeEnv(scope);
  if (username !== user) return false;
  return bcrypt.compare(password, passHash);
}

export async function createSessionToken(scope: AuthScope): Promise<string> {
  return new SignJWT({ scope })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
  expectedScope: AuthScope
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.scope === expectedScope;
  } catch {
    return false;
  }
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** Guards an API route handler — returns true only if a valid session for `scope` is present. */
export async function hasValidSession(request: NextRequest, scope: AuthScope): Promise<boolean> {
  const token = request.cookies.get(cookieNameFor(scope))?.value;
  if (!token) return false;
  return verifySessionToken(token, scope);
}
