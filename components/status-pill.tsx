import type { PaymentStatus } from "@/lib/types";

const styles: Record<PaymentStatus, string> = {
  PAID: "bg-paid-bg text-paid",
  PARTIAL: "bg-partial-bg text-partial",
  UNPAID: "bg-unpaid-bg text-unpaid",
};

const labels: Record<PaymentStatus, string> = {
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
};

export function StatusPill({
  status,
  onClick,
  disabled,
  title,
}: {
  status: PaymentStatus;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const classes = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]} ${
    onClick && !disabled ? "cursor-pointer hover:brightness-95 dark:hover:brightness-110" : disabled ? "cursor-not-allowed opacity-70" : ""
  }`;

  if (!onClick) {
    return <span className={classes}>{labels[status]}</span>;
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes} title={title}>
      {labels[status]}
    </button>
  );
}
