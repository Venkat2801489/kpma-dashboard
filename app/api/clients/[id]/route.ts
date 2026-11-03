import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hasValidSession } from "@/lib/auth";
import { monthStartDate } from "@/lib/period";
import { resolveLogoUrl } from "@/lib/drive-logo";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  logoDriveLink: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidSession(request, "main"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.logoDriveLink !== undefined) {
    data.logoDriveLink = parsed.data.logoDriveLink || null;
    data.logoUrl = resolveLogoUrl(parsed.data.logoDriveLink);
  }

  const client = await prisma.client.update({ where: { id }, data });
  return NextResponse.json(client);
}

const removeSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

/**
 * Removes the client from `?year=&month=` onward. Nothing is erased: earlier
 * months keep showing the client and its payment history.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidSession(request, "main"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = removeSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "A year and month are required" }, { status: 400 });
  }

  await prisma.client.update({ where: { id }, data: { removedFrom: monthStartDate(parsed.data) } });
  return NextResponse.json({ ok: true });
}
