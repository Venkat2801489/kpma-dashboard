export type PaymentStatus = "PAID" | "UNPAID" | "PARTIAL";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  clientCategoryId: string;
  year: number;
  month: number;
  status: PaymentStatus;
  amountPaid: string;
  paidDate: string | null;
  notes: string | null;
};

export type ClientCategory = {
  id: string;
  clientId: string;
  categoryId: string;
  monthlyAmount: string;
  category: Category;
  payments: Payment[];
};

export type Client = {
  id: string;
  name: string;
  logoDriveLink: string | null;
  logoUrl: string | null;
  notes: string | null;
  createdAt: string;
  categories: ClientCategory[];
};

export type SalaryPayment = {
  id: string;
  workerId: string;
  year: number;
  month: number;
  status: PaymentStatus;
  amountPaid: string;
  paidDate: string | null;
  notes: string | null;
};

export type Worker = {
  id: string;
  name: string;
  role: string | null;
  monthlySalary: string;
  createdAt: string;
  payments: SalaryPayment[];
};

export type PaymentLike = {
  status: PaymentStatus;
  amountPaid: string;
  paidDate: string | null;
  notes: string | null;
};

export type YearMonth = { year: number; month: number };
export type Period = { months: YearMonth[]; label: string };
