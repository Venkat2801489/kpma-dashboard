import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expenseData, expenseSchema } from "@/lib/expense";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = expenseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: expenseData(parsed.data),
  });
  return NextResponse.json(expense);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
