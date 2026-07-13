"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface ActionItem {
  label:     string;
  icon?:     React.ElementType;
  onClick:   () => void;
  variant?:  "default" | "danger";
  disabled?: boolean;
  separator?: boolean; // renders a divider BEFORE this item
}

interface ActionsMenuProps {
  items:      ActionItem[];
  /** Used to flip the dropdown to the correct side for RTL */
  dir?:       "ltr" | "rtl";
  /** Aria-label for the trigger button */
  label?:     string;
  /** Use a custom trigger instead of the default ⋯ button */
  trigger?:   ReactNode;
  className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function ActionsMenu({
  items,
  dir     = "ltr",
  label   = "Actions",
  trigger,
  className,
}: ActionsMenuProps) {
  const isRTL          = dir === "rtl";
  const [open, setOpen] = useState(false);
  const menuRef         = useRef<HTMLDivElement>(null);
  const btnRef          = useRef<HTMLButtonElement>(null);

  /* Close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={menuRef} className={cn("relative inline-block", className)}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setOpen((p) => !p)} style={{ cursor: "pointer" }}>
          {trigger}
        </div>
      ) : (
        <button
          ref={btnRef}
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((p) => !p)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            "transition-all duration-150 focus-visible:outline-none",
            open ? "shadow-sm" : "opacity-0 group-hover:opacity-100"
          )}
          style={
            open
              ? {
                  background:  "var(--color-brand-dim)",
                  color:       "var(--color-brand-light)",
                  border:      "1px solid color-mix(in srgb, var(--color-brand) 30%, transparent)",
                }
              : {
                  background:  "var(--color-bg-surface)",
                  border:      "1px solid var(--color-border)",
                  color:       "var(--color-text-muted)",
                }
          }
          onMouseEnter={(e) => {
            if (!open) {
              const el = e.currentTarget;
              el.style.background = "var(--color-bg-overlay)";
              el.style.color      = "var(--color-text-primary)";
              el.style.opacity    = "1";
            }
          }}
          onMouseLeave={(e) => {
            if (!open) {
              const el = e.currentTarget;
              el.style.background = "var(--color-bg-surface)";
              el.style.color      = "var(--color-text-muted)";
            }
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}

      {/* Dropdown Panel */}
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="animate-scale-in"
          style={{
            position:      "absolute",
            top:           "calc(100% + 6px)",
            ...(isRTL ? { left: 0 } : { right: 0 }),
            zIndex:        50,
            minWidth:      "180px",
            background:    "var(--color-bg-elevated)",
            border:        "1px solid var(--color-border)",
            borderRadius:  "var(--radius-md)",
            boxShadow:     "var(--shadow-lg)",
            padding:       "5px",
            transformOrigin: isRTL ? "top left" : "top right",
          }}
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            const isDanger = item.variant === "danger";

            return (
              <div key={i}>
                {/* Separator */}
                {item.separator && i > 0 && (
                  <div
                    style={{
                      height:     "1px",
                      background: "var(--color-border-subtle)",
                      margin:     "4px 0",
                    }}
                  />
                )}

                {/* Menu item */}
                <button
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                    "transition-all duration-100",
                    item.disabled && "pointer-events-none opacity-40",
                    isRTL && "flex-row-reverse"
                  )}
                  style={{ color: isDanger ? "var(--color-danger)" : "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = isDanger
                      ? "var(--color-danger-dim)"
                      : "var(--color-bg-surface)";
                    el.style.color = isDanger
                      ? "var(--color-danger)"
                      : "var(--color-text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "";
                    el.style.color = isDanger
                      ? "var(--color-danger)"
                      : "var(--color-text-secondary)";
                  }}
                >
                  {Icon && (
                    <Icon
                      className="h-3.5 w-3.5 flex-shrink-0"
                      strokeWidth={2}
                    />
                  )}
                  <span className="text-start flex-1">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
