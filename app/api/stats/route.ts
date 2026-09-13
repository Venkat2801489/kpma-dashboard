import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hasValidSession } from "@/lib/auth";
import { currentYearMonth, trailingMonths, MONTH_NAMES } from "@/lib/period";

export async function GET(request: NextRequest) {
  if (!(await hasValidSession(request, "main"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { year, month } = currentYearMonth();
  const months = trailingMonths(year, month, 6);

  const clients = await prisma.client.findMany({
    include: {
      categories: {
        include: {
          category: true,
          payments: { where: { OR: months.map((m) => ({ year: m.year, month: m.month })) } },
        },
      },
    },
  });

  const trend = months.map((ym) => {
    let expected = 0;
    let collected = 0;
    for (const client of clients) {
      for (const cc of client.categories) {
        expected += Number(cc.monthlyAmount);
        const payment = cc.payments.find((p) => p.year === ym.year && p.month === ym.month);
        collected += payment ? Number(payment.amountPaid) : 0;
      }
    }
    return {
      label: `${MONTH_NAMES[ym.month - 1].slice(0, 3)} ${String(ym.year).slice(2)}`,
      expected,
      collected,
    };
  });

  const currentMonthFilter = { year, month };
  const byCategory = new Map<string, { name: string; icon: string; expected: number; collected: number }>();
  for (const client of clients) {
    for (const cc of client.categories) {
      const entry = byCategory.get(cc.categoryId) ?? {
        name: cc.category.name,
        icon: cc.category.icon,
        expected: 0,
        collected: 0,
      };
      entry.expected += Number(cc.monthlyAmount);
      const payment = cc.payments.find((p) => p.year === currentMonthFilter.year && p.month === currentMonthFilter.month);
      entry.collected += payment ? Number(payment.amountPaid) : 0;
      byCategory.set(cc.categoryId, entry);
    }
  }

  return NextResponse.json({
    trend,
    categories: Array.from(byCategory.values()),
  });
}
