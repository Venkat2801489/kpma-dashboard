import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hasValidSession } from "@/lib/auth";
import { periodFromSearchParams } from "@/lib/period";

export async function GET(request: NextRequest) {
  if (!(await hasValidSession(request, "worker"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = periodFromSearchParams(request.nextUrl.searchParams);
  const monthFilter = period.months.map((m) => ({ year: m.year, month: m.month }));

  const workers = await prisma.worker.findMany({
    orderBy: { name: "asc" },
    include: { payments: { where: { OR: monthFilter } } },
  });

  return NextResponse.json({ period, workers });
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(80).optional().or(z.literal("")),
  monthlySalary: z.number().nonnegative(),
});

export async function POST(request: NextRequest) {
  if (!(await hasValidSession(request, "worker"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid worker" }, { status: 400 });
  }

  const worker = await prisma.worker.create({
    data: {
      name: parsed.data.name,
      role: parsed.data.role || null,
      monthlySalary: parsed.data.monthlySalary,
    },
  });

  return NextResponse.json(worker, { status: 201 });
}
