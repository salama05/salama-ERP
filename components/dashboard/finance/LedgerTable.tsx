"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/taxCalculator";
import { cn } from "@/lib/utils";

export function LedgerTable() {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";
  const ledger = useQuery(api.finance.getLedger) || [];

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "invoice":
        return t("invoice") || "فاتورة مبيعات";
      case "purchase":
        return t("purchase") || "فاتورة شراء";
      case "general_expense":
        return t("expense") || "مصروف عام";
      default:
        return source;
    }
  };

  return (
    <div className="space-y-4" dir={dir}>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] text-start">
        {t("ledgerTitle") || "السجل المحاسبي العام"}
      </h2>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-[var(--color-bg-hover)] border-b">
            <tr>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>
                {t("date") || "التاريخ"}
              </th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>
                {t("reference") || "المرجع"}
              </th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>
                {t("type") || "النوع"}
              </th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>
                {t("description") || "الوصف"}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                {t("amount") || "القيمة"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ledger.length > 0 ? (
              ledger.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--color-bg-hover)]">
                  <td className={cn("px-4 py-3 text-sm", isRTL ? "text-right" : "text-left")}>
                    {item.date}
                  </td>
                  <td className={cn("px-4 py-3 text-sm font-medium", isRTL ? "text-right" : "text-left")}>
                    {item.referenceNumber}
                  </td>
                  <td className={cn("px-4 py-3 text-sm", isRTL ? "text-right" : "text-left")}>
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        item.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {item.type === "income" ? (t("income") || "إيراد") : (t("expense") || "مصروف")}
                    </span>
                  </td>
                  <td className={cn("px-4 py-3 text-sm text-[var(--color-text-secondary)]", isRTL ? "text-right" : "text-left")}>
                    {item.description}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-sm text-right font-semibold",
                      item.type === "income" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {item.type === "income" ? "+" : "-"} {formatCurrency(item.amount, language)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  {t("noLedgerEntries") || "لا توجد قيود في السجل المحاسبي"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
