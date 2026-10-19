import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  kind: z.enum(["EQUIPMENT", "EXPENSE"]),
  amount: z.number().positive().max(1_000_000_000),
  spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

/** Prisma write payload — `spentOn` is a calendar date, stored at UTC midnight. */
export function expenseData(input: ExpenseInput) {
  return {
    title: input.title,
    kind: input.kind,
    amount: input.amount,
    spentOn: new Date(`${input.spentOn}T00:00:00.000Z`),
    notes: input.notes || null,
  };
}
