import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Video Editing", slug: "video-editing", icon: "video" },
  { name: "SMM/SMO", slug: "smm-smo", icon: "smm" },
  { name: "SEO", slug: "seo", icon: "seo" },
  { name: "AI", slug: "ai", icon: "ai" },
  { name: "Website Development", slug: "website-development", icon: "web" },
];

function trailingMonths(count: number) {
  const now = new Date();
  const months: { year: number; month: number }[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  cursor.setMonth(cursor.getMonth() - (count - 1));
  for (let i = 0; i < count; i++) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

async function main() {
  console.log("Seeding categories…");
  const categories = new Map<string, string>();
  for (const c of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories.set(c.slug, category.id);
  }

  const months = trailingMonths(4); // previous 3 months + current
  const currentIdx = months.length - 1;

  type ClientSeed = {
    name: string;
    services: { slug: string; amount: number }[];
    // pattern per month index: P = paid, U = unpaid, X = partial
    pattern: string;
  };

  const clients: ClientSeed[] = [
    {
      name: "Sunrise Bakery Co.",
      services: [
        { slug: "seo", amount: 15000 },
        { slug: "smm-smo", amount: 12000 },
      ],
      pattern: "PPPP",
    },
    {
      name: "Voltage Fitness",
      services: [{ slug: "smm-smo", amount: 18000 }],
      pattern: "PPPU",
    },
    {
      name: "Nimbus Cloud Kitchens",
      services: [
        { slug: "seo", amount: 20000 },
        { slug: "website-development", amount: 5000 },
      ],
      pattern: "PPXU",
    },
    {
      name: "Everest Realty",
      services: [{ slug: "seo", amount: 25000 }],
      pattern: "PXPP",
    },
    {
      name: "Pixelworks Studio",
      services: [{ slug: "video-editing", amount: 22000 }],
      pattern: "UUUU",
    },
    {
      name: "Kavya Ayurveda",
      services: [
        { slug: "smm-smo", amount: 10000 },
        { slug: "ai", amount: 8000 },
      ],
      pattern: "PPPX",
    },
    {
      name: "Orbit Automobiles",
      services: [
        { slug: "website-development", amount: 30000 },
        { slug: "seo", amount: 15000 },
      ],
      pattern: "PPPP",
    },
  ];

  console.log("Seeding clients…");
  for (const c of clients) {
    const existing = await prisma.client.findFirst({ where: { name: c.name } });
    if (existing) continue;

    const client = await prisma.client.create({ data: { name: c.name } });

    for (const service of c.services) {
      const clientCategory = await prisma.clientCategory.create({
        data: {
          clientId: client.id,
          categoryId: categories.get(service.slug)!,
          monthlyAmount: service.amount,
        },
      });

      for (let i = 0; i < months.length; i++) {
        const code = c.pattern[i] ?? "U";
        const { year, month } = months[i];
        const status = code === "P" ? "PAID" : code === "X" ? "PARTIAL" : "UNPAID";
        const amountPaid = code === "P" ? service.amount : code === "X" ? Math.round(service.amount * 0.5) : 0;
        await prisma.payment.create({
          data: {
            clientCategoryId: clientCategory.id,
            year,
            month,
            status,
            amountPaid,
            paidDate: status !== "UNPAID" ? new Date(year, month - 1, 5) : null,
          },
        });
      }
    }
  }

  console.log("Seeding workers…");
  const workers: { name: string; role: string; salary: number; pattern: string }[] = [
    { name: "Arjun Mehta", role: "Video Editor", salary: 28000, pattern: "PPPP" },
    { name: "Divya Rao", role: "Social Media Executive", salary: 24000, pattern: "PPPX" },
  ];

  for (const w of workers) {
    const existing = await prisma.worker.findFirst({ where: { name: w.name } });
    if (existing) continue;

    const worker = await prisma.worker.create({
      data: { name: w.name, role: w.role, monthlySalary: w.salary },
    });

    for (let i = 0; i < months.length; i++) {
      const code = w.pattern[i] ?? "U";
      const { year, month } = months[i];
      const status = code === "P" ? "PAID" : code === "X" ? "PARTIAL" : "UNPAID";
      const amountPaid = code === "P" ? w.salary : code === "X" ? Math.round(w.salary * 0.5) : 0;
      await prisma.salaryPayment.create({
        data: {
          workerId: worker.id,
          year,
          month,
          status,
          amountPaid,
          paidDate: status !== "UNPAID" ? new Date(year, month - 1, 1) : null,
        },
      });
    }
  }

  console.log(`Done. Current month index used for the dashboard's default view: ${currentIdx}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
