"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ShoppingCart, Store, Landmark } from "lucide-react";

export default function POSPage() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[65vh] text-center px-4 animate-fade-up",
        isRTL && "text-right"
      )}
      dir={dir}
    >
      {/* Icon */}
      <div
        className="p-4 rounded-full mb-6 animate-scale-in"
        style={{
          backgroundColor: "var(--color-brand-dim)",
          border: "1px solid color-mix(in srgb, var(--color-brand) 25%, transparent)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <ShoppingCart
          className="h-12 w-12"
          style={{ color: "var(--color-brand)" }}
        />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">
        <span className="gradient-text">{t("posTitle")}</span>
      </h1>
      <p className="text-[var(--color-text-secondary)] text-sm max-w-md mb-8 leading-relaxed">
        {t("posDesc")}
      </p>

      <div className="divider w-full max-w-2xl opacity-50" />

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl stagger-children mt-6",
          isRTL ? "text-right" : "text-left"
        )}
      >
        {/* Retail */}
        <Link
          href="/pos/retail"
          className="card hover-lift p-6 cursor-pointer flex flex-col justify-between"
          style={{ background: "var(--color-bg-elevated)" }}
        >
          <div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{
                backgroundColor: "var(--color-info-dim)",
                border: "1px solid color-mix(in srgb, var(--color-info) 25%, transparent)",
              }}
            >
              <Store className="h-6 w-6" style={{ color: "var(--color-info)" }} />
            </div>
            <h3 className="text-[var(--color-text-primary)] mb-2 font-bold text-lg">
              {t("retailMode")}
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              {t("retailModeDesc")}
            </p>
          </div>
        </Link>

        {/* Wholesale */}
        <Link
          href="/pos/wholesale"
          className="card hover-lift p-6 cursor-pointer flex flex-col justify-between"
          style={{ background: "var(--color-bg-elevated)" }}
        >
          <div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{
                backgroundColor: "var(--color-brand-dim)",
                border: "1px solid color-mix(in srgb, var(--color-brand) 25%, transparent)",
              }}
            >
              <Landmark className="h-6 w-6" style={{ color: "var(--color-brand)" }} />
            </div>
            <h3 className="text-[var(--color-text-primary)] mb-2 font-bold text-lg">
              {t("wholesaleMode")}
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              {t("wholesaleModeDesc")}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
