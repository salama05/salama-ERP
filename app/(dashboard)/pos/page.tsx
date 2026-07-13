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
      <div className="p-4 rounded-full bg-brand/10 border border-brand/20 shadow-glow mb-6 animate-scale-in">
        <ShoppingCart className="h-12 w-12 text-brand" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-heading-xl mb-3">
        <span className="gradient-text">{t("posTitle")}</span>
      </h1>
      <p className="text-text-secondary text-body max-w-md mb-8">
        {t("posDesc")}
      </p>

      <div className="divider w-full max-w-2xl opacity-50" />

      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl stagger-children mt-6",
        isRTL ? "text-right" : "text-left"
      )}>
        <Link 
          href="/pos/retail" 
          className="card hover-lift p-6 bg-bg-elevated border border-border-subtle cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-lg bg-info-dim flex items-center justify-center border border-info/20 mb-4">
              <Store className="h-6 w-6 text-info" />
            </div>
            <h3 className="text-heading-md text-text-primary mb-2 font-bold">{t("retailMode")}</h3>
            <p className="text-text-muted text-body-sm leading-relaxed">{t("retailModeDesc")}</p>
          </div>
        </Link>

        <Link 
          href="/pos/wholesale" 
          className="card hover-lift p-6 bg-bg-elevated border border-border-subtle cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-lg bg-brand-dim flex items-center justify-center border border-brand/20 mb-4">
              <Landmark className="h-6 w-6 text-brand" />
            </div>
            <h3 className="text-heading-md text-text-primary mb-2 font-bold">{t("wholesaleMode")}</h3>
            <p className="text-text-muted text-body-sm leading-relaxed">{t("wholesaleModeDesc")}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
