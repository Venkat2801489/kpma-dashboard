import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookieNameFor } from "@/lib/auth";

const bodySchema = z.object({ scope: z.enum(["main", "worker"]) });

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(cookieNameFor(parsed.data.scope));
  return response;
}
