import type { Client, ClientCategory, Payment, PaymentStatus, Period, SalaryPayment, Worker, YearMonth } from "./types";

export type LineStatus = {
  expected: number;
  collected: number;
  status: PaymentStatus;
};

function paymentFor(cc: ClientCategory, ym: YearMonth): Payment | undefined {
  return cc.payments.find((p) => p.year === ym.year && p.month === ym.month);
}

/**
 * Rolls a client-category subscription up over the whole period (a single
 * month, or a custom multi-month range) into one expected/collected/status
 * triple. For a single month this just reflects the stored payment record;
 * for a range it sums amounts and folds the per-month statuses together
 * (all paid -> paid, none paid -> unpaid, anything else -> partial).
 */
export function aggregateClientCategory(cc: ClientCategory, period: Period): LineStatus {
  const monthlyAmount = Number(cc.monthlyAmount);
  const expected = monthlyAmount * period.months.length;

  let collected = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  for (const ym of period.months) {
    const payment = paymentFor(cc, ym);
    const amount = payment ? Number(payment.amountPaid) : 0;
    collected += amount;
    const status: PaymentStatus = payment?.status ?? "UNPAID";
    if (status === "PAID") paidCount++;
    else if (status === "UNPAID") unpaidCount++;
  }

  let status: PaymentStatus;
  if (paidCount === period.months.length) status = "PAID";
  else if (unpaidCount === period.months.length) status = "UNPAID";
  else status = "PARTIAL";

  return { expected, collected, status };
}

export type ClientTotals = {
  expected: number;
  collected: number;
  pending: number;
  lines: { clientCategory: ClientCategory; line: LineStatus }[];
};

export function aggregateClient(client: Client, period: Period): ClientTotals {
  const lines = client.categories.map((cc) => ({ clientCategory: cc, line: aggregateClientCategory(cc, period) }));
  const expected = lines.reduce((sum, l) => sum + l.line.expected, 0);
  const collected = lines.reduce((sum, l) => sum + l.line.collected, 0);
  return { expected, collected, pending: expected - collected, lines };
}

export function aggregateWorker(worker: Worker, period: Period): LineStatus {
  const monthlyAmount = Number(worker.monthlySalary);
  const expected = monthlyAmount * period.months.length;

  let collected = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  for (const ym of period.months) {
    const payment: SalaryPayment | undefined = worker.payments.find(
      (p) => p.year === ym.year && p.month === ym.month
    );
    collected += payment ? Number(payment.amountPaid) : 0;
    const status: PaymentStatus = payment?.status ?? "UNPAID";
    if (status === "PAID") paidCount++;
    else if (status === "UNPAID") unpaidCount++;
  }

  let status: PaymentStatus;
  if (paidCount === period.months.length) status = "PAID";
  else if (unpaidCount === period.months.length) status = "UNPAID";
  else status = "PARTIAL";

  return { expected, collected, status };
}

export function computePayrollStats(workers: Worker[], period: Period): DashboardStats {
  let totalExpected = 0;
  let totalCollected = 0;
  let paidCount = 0;
  let unpaidCount = 0;
  let partialCount = 0;

  for (const worker of workers) {
    const line = aggregateWorker(worker, period);
    totalExpected += line.expected;
    totalCollected += line.collected;
    if (line.status === "PAID") paidCount++;
    else if (line.status === "UNPAID") unpaidCount++;
    else partialCount++;
  }

  const totalPending = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  return { totalExpected, totalCollected, totalPending, paidCount, unpaidCount, partialCount, collectionRate };
}

export type DashboardStats = {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
  collectionRate: number;
};

export function computeStats(clients: Client[], period: Period): DashboardStats {
  let totalExpected = 0;
  let totalCollected = 0;
  let paidCount = 0;
  let unpaidCount = 0;
  let partialCount = 0;

  for (const client of clients) {
    for (const cc of client.categories) {
      const line = aggregateClientCategory(cc, period);
      totalExpected += line.expected;
      totalCollected += line.collected;
      if (line.status === "PAID") paidCount++;
      else if (line.status === "UNPAID") unpaidCount++;
      else partialCount++;
    }
  }

  const totalPending = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  return { totalExpected, totalCollected, totalPending, paidCount, unpaidCount, partialCount, collectionRate };
}
