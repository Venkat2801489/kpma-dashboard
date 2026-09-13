import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hasValidSession } from "@/lib/auth";
import { periodFromSearchParams } from "@/lib/period";
import { resolveLogoUrl } from "@/lib/drive-logo";

export async function GET(request: NextRequest) {
  if (!(await hasValidSession(request, "main"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = periodFromSearchParams(request.nextUrl.searchParams);
  const monthFilter = period.months.map((m) => ({ year: m.year, month: m.month }));

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      categories: {
        include: {
          category: true,
          payments: { where: { OR: monthFilter } },
        },
      },
    },
  });

  return NextResponse.json({ period, clients });
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  logoDriveLink: z.string().url().optional().or(z.literal("")),
  categories: z
    .array(
      z.object({
        categoryId: z.string().min(1),
        monthlyAmount: z.number().nonnegative(),
      })
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  if (!(await hasValidSession(request, "main"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid client", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, logoDriveLink, categories } = parsed.data;
  const logoUrl = resolveLogoUrl(logoDriveLink);

  const client = await prisma.client.create({
    data: {
      name,
      logoDriveLink: logoDriveLink || null,
      logoUrl,
      categories: {
        create: categories.map((c) => ({
          categoryId: c.categoryId,
          monthlyAmount: c.monthlyAmount,
        })),
      },
    },
    include: { categories: { include: { category: true } } },
  });

  return NextResponse.json(client, { status: 201 });
}
