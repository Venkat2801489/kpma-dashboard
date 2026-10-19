import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { periodDateRange, periodFromSearchParams } from "@/lib/period";
import { expenseData, expenseSchema } from "@/lib/expense";

// The notetaker dashboard is intentionally open — no session check on these routes.

export async function GET(request: NextRequest) {
  const period = periodFromSearchParams(request.nextUrl.searchParams);

  const expenses = await prisma.expense.findMany({
    where: { spentOn: periodDateRange(period) },
    orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ period, expenses });
}

export async function POST(request: NextRequest) {
  const parsed = expenseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: expenseData(parsed.data),
  });

  return NextResponse.json(expense, { status: 201 });
}
