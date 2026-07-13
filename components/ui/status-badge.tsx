import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Circle,
  Loader2,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "neutral"
  | "pending"
  | "draft";

export type BadgeSize = "sm" | "md" | "lg";

interface StatusBadgeProps {
  variant:    BadgeVariant;
  label:      string;
  icon?:      boolean;
  size?:      BadgeSize;
  className?: string;
  dot?:       boolean;
}

/* ─── Icon Map ───────────────────────────────────────────────────────────── */
const ICONS: Record<BadgeVariant, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertCircle,
  danger:  XCircle,
  info:    Circle,
  brand:   Circle,
  neutral: Circle,
  pending: Clock,
  draft:   Loader2,
};

/* ─── Semantic CSS class map ─────────────────────────────────────────────── */
const VARIANT_CLASS: Record<BadgeVariant, string> = {
  success: "badge-success",
  warning: "badge-warning",
  danger:  "badge-danger",
  info:    "badge-info",
  brand:   "badge-brand",
  neutral: "badge-neutral",
  pending: "badge-warning",
  draft:   "badge-neutral",
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: "text-[11px] px-2.5 py-1 gap-1",
  md: "",                                 // uses .badge defaults
  lg: "text-sm px-3.5 py-1.5 gap-1.5",
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export function StatusBadge({
  variant,
  label,
  icon    = true,
  dot     = false,
  size    = "md",
  className,
}: StatusBadgeProps) {
  const Icon = ICONS[variant];

  return (
    <span
      className={cn(
        "badge",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className
      )}
    >
      {dot && (
        <span
          className="inline-block rounded-full flex-shrink-0"
          style={{
            width:  "6px",
            height: "6px",
            background: "currentColor",
          }}
        />
      )}
      {icon && !dot && (
        <Icon
          className={cn(
            "flex-shrink-0",
            size === "sm" ? "h-2.5 w-2.5" : size === "lg" ? "h-4 w-4" : "h-3 w-3",
            variant === "draft" && "animate-spin"
          )}
          strokeWidth={2.5}
        />
      )}
      {label}
    </span>
  );
}

/* ─── Preset shorthand helpers ───────────────────────────────────────────── */
export const InvoiceStatusBadge = ({
  status,
  language = "fr",
  ...props
}: {
  status:    "paid" | "partial" | "unpaid" | "draft";
  language?: "fr" | "ar" | "en";
} & Partial<StatusBadgeProps>) => {
  const MAP: Record<typeof status, { variant: BadgeVariant; fr: string; ar: string; en: string }> = {
    paid:    { variant: "success", fr: "Payée",          ar: "مدفوعة",     en: "Paid" },
    partial: { variant: "warning", fr: "Partielle",      ar: "جزئية",      en: "Partial" },
    unpaid:  { variant: "danger",  fr: "Non payée",      ar: "غير مدفوعة", en: "Unpaid" },
    draft:   { variant: "draft",   fr: "Brouillon",      ar: "مسودة",      en: "Draft" },
  };
  const cfg = MAP[status] ?? MAP.draft;
  // Resolve the correct label for the active language
  const label = language === "ar" ? cfg.ar : language === "en" ? cfg.en : cfg.fr;
  return (
    <StatusBadge
      variant={cfg.variant}
      label={label}
      {...props}
    />
  );
};

export const StockBadge = ({
  qty,
  min,
  language = "fr",
}: {
  qty:       number;
  min:       number;
  language?: "fr" | "ar" | "en";
}) => {
  if (qty <= 0) {
    return (
      <StatusBadge
        variant="danger"
        label={language === "ar" ? "نفذ المخزون" : language === "fr" ? "Rupture" : "Out of stock"}
        dot
      />
    );
  }
  if (qty <= min) {
    return (
      <StatusBadge
        variant="warning"
        label={language === "ar" ? "مخزون منخفض" : language === "fr" ? "Stock bas" : "Low stock"}
        dot
      />
    );
  }
  return (
    <StatusBadge
      variant="success"
      label={language === "ar" ? "متوفر" : language === "fr" ? "En stock" : "In stock"}
      dot
    />
  );
};
