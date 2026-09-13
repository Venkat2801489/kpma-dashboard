import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookieNameFor, createSessionToken, verifyCredentials, SESSION_MAX_AGE } from "@/lib/auth";

const bodySchema = z.object({
  scope: z.enum(["main", "worker"]),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { scope, username, password } = parsed.data;

  let ok: boolean;
  let token: string;
  try {
    ok = await verifyCredentials(scope, username, password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    token = await createSessionToken(scope);
  } catch (err) {
    console.error("Auth configuration error:", err);
    return NextResponse.json(
      { error: "Server is missing auth configuration (check SESSION_SECRET and *_AUTH_* env vars)" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieNameFor(scope), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
