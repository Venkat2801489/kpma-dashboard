import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hasValidSession } from "@/lib/auth";
import { monthStartDate } from "@/lib/period";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: z.string().max(80).optional().or(z.literal("")),
  monthlySalary: z.number().nonnegative().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidSession(request, "worker"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.role !== undefined) data.role = parsed.data.role || null;
  if (parsed.data.monthlySalary !== undefined) data.monthlySalary = parsed.data.monthlySalary;

  const worker = await prisma.worker.update({ where: { id }, data });
  return NextResponse.json(worker);
}

const removeSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

/**
 * Removes the worker from `?year=&month=` onward. Nothing is erased: earlier
 * months keep showing the worker and its payment history.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidSession(request, "worker"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = removeSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "A year and month are required" }, { status: 400 });
  }

  await prisma.worker.update({ where: { id }, data: { removedFrom: monthStartDate(parsed.data) } });
  return NextResponse.json({ ok: true });
}
