import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface PageHeaderProps {
  /** Primary page title */
  title:        string;
  /** Optional subtitle / description */
  description?: string;
  /** Breadcrumb items (rendered left-to-right / right-to-left automatically) */
  breadcrumbs?: { label: string; href?: string }[];
  /** Slot for primary CTA button(s) rendered on the trailing end */
  actions?:     ReactNode;
  /** Optional stat chips rendered below the title */
  stats?:       { label: string; value: string | number; highlight?: boolean }[];
  /** Passed by the i18n hook: "ltr" | "rtl" */
  dir?:         "ltr" | "rtl";
  /** Extra wrapper className */
  className?:   string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  stats,
  dir       = "ltr",
  className,
}: PageHeaderProps) {
  const isRTL = dir === "rtl";

  return (
    <header
      className={cn(
        "mb-7 animate-fade-up",
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="breadcrumb"
          className={cn(
            "flex items-center gap-1.5 mb-3",
            isRTL && "flex-row-reverse justify-end"
          )}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-xs font-medium transition-colors duration-150"
                  style={{
                    color:          "var(--color-text-muted)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = "var(--color-text-primary)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = "var(--color-text-muted)")
                  }
                >
                  {crumb.label}
                </a>
              ) : (
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {crumb.label}
                </span>
              )}
              {i < breadcrumbs.length - 1 && (
                <svg
                  viewBox="0 0 6 10"
                  className={cn("h-2.5 w-1.5 flex-shrink-0", isRTL && "rotate-180")}
                  style={{ color: "var(--color-text-disabled)" }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1l4 4-4 4" />
                </svg>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div
        className={cn(
          "flex items-start justify-between gap-4",
          isRTL && "flex-row-reverse"
        )}
      >
        {/* Left / Leading: title + description */}
        <div className={cn("min-w-0", isRTL && "text-right")}>
          <h1
            className="text-heading-xl truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="mt-1 text-body-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Right / Trailing: actions */}
        {actions && (
          <div
            className={cn(
              "flex items-center gap-2 flex-shrink-0",
              isRTL && "flex-row-reverse"
            )}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Stat chips */}
      {stats && stats.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 mt-4",
            isRTL && "flex-row-reverse"
          )}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background:  s.highlight ? "var(--color-brand-dim)" : "var(--color-bg-surface)",
                border:      `1px solid ${s.highlight ? "color-mix(in srgb, var(--color-brand) 30%, transparent)" : "var(--color-border-subtle)"}`,
              }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                {s.label}
              </span>
              <span
                className="text-xs font-bold text-price"
                style={{
                  /* brand (#4F46E5) on brand-dim (#EEF2FF) → 5.5:1 ✅ WCAG AA */
                  color: s.highlight ? "var(--color-brand)" : "var(--color-text-primary)",
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal rule */}
      <div className="divider" style={{ marginTop: "var(--space-5)" }} />
    </header>
  );
}
