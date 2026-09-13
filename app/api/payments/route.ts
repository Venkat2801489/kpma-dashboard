import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hasValidSession } from "@/lib/auth";

const schema = z.object({
  clientCategoryId: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  status: z.enum(["PAID", "UNPAID", "PARTIAL"]),
  amountPaid: z.number().nonnegative(),
  paidDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function PUT(request: NextRequest) {
  if (!(await hasValidSession(request, "main"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment", details: parsed.error.flatten() }, { status: 400 });
  }

  const { clientCategoryId, year, month, status, amountPaid, paidDate, notes } = parsed.data;

  const payment = await prisma.payment.upsert({
    where: { clientCategoryId_year_month: { clientCategoryId, year, month } },
    create: {
      clientCategoryId,
      year,
      month,
      status,
      amountPaid,
      paidDate: paidDate ? new Date(paidDate) : null,
      notes,
    },
    update: {
      status,
      amountPaid,
      paidDate: paidDate ? new Date(paidDate) : null,
      notes,
    },
  });

  return NextResponse.json(payment);
}
