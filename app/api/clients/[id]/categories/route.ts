import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hasValidSession } from "@/lib/auth";

const schema = z.object({
  categoryId: z.string().min(1),
  monthlyAmount: z.number().nonnegative(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidSession(request, "main"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  try {
    const clientCategory = await prisma.clientCategory.create({
      data: { clientId: id, categoryId: parsed.data.categoryId, monthlyAmount: parsed.data.monthlyAmount },
      include: { category: true },
    });
    return NextResponse.json(clientCategory, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Client is already billed under that category" }, { status: 409 });
  }
}
