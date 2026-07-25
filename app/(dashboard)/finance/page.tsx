"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AddExpenseModal } from "@/components/dashboard/finance/AddExpenseModal";
import { LedgerTable } from "@/components/dashboard/finance/LedgerTable";
import { formatCurrency } from "@/lib/taxCalculator";

export default function FinancePage() {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "ledger">("overview");

  const ledger = useQuery(api.finance.getLedger) || [];

  const totalIncome = ledger
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = ledger
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6" dir={dir}>
      {/* ─── Title & Actions ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center justify-between pb-4 border-b border-[var(--color-border)]",
          isRTL && "flex-row-reverse"
        )}
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {t("financeTitle") || "المالية"}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {t("financeDesc") || "إدارة الحسابات العامة، المصاريف، والسجل المحاسبي"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 bg-[var(--color-success)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("addExpense") || "إضافة مصروف"}
          </button>
        </div>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-4 py-2 font-medium border-b-2 transition-colors",
            activeTab === "overview"
              ? "border-[var(--color-success)] text-[var(--color-success)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          )}
        >
          {t("overview") || "نظرة عامة"}
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "px-4 py-2 font-medium border-b-2 transition-colors",
            activeTab === "ledger"
              ? "border-[var(--color-success)] text-[var(--color-success)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          )}
        >
          {t("viewLedger") || "السجل المحاسبي"}
        </button>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Income */}
            <div className="surface-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  {t("totalIncome") || "إجمالي الإيرادات"}
                </p>
                <h3 className="text-2xl font-bold text-[var(--color-success)] mt-1">
                  {formatCurrency(totalIncome, language)}
                </h3>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: "var(--color-success-dim)" }}
              >
                <TrendingUp className="h-6 w-6" style={{ color: "var(--color-success)" }} />
              </div>
            </div>

            {/* Expenses */}
            <div className="surface-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  {t("totalExpenses") || "إجمالي المصاريف"}
                </p>
                <h3 className="text-2xl font-bold text-[var(--color-danger)] mt-1">
                  {formatCurrency(totalExpense, language)}
                </h3>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: "var(--color-danger-dim)" }}
              >
                <TrendingDown className="h-6 w-6" style={{ color: "var(--color-danger)" }} />
              </div>
            </div>

            {/* Net Profit */}
            <div className="surface-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  {t("netProfit") || "صافي الأرباح"}
                </p>
                <h3
                  className="text-2xl font-bold mt-1"
                  style={{
                    color: netProfit >= 0 ? "var(--color-brand)" : "var(--color-danger)",
                  }}
                >
                  {formatCurrency(netProfit, language)}
                </h3>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: "var(--color-brand-dim)" }}
              >
                <DollarSign className="h-6 w-6" style={{ color: "var(--color-brand)" }} />
              </div>
            </div>
          </div>

          {/* Ledger Preview */}
          <div className="surface-panel p-6 space-y-4">
            <div
              className={cn(
                "flex items-center justify-between",
                isRTL && "flex-row-reverse"
              )}
            >
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {t("recentTransactions") || "العمليات الأخيرة"}
              </h3>
              <button
                onClick={() => setActiveTab("ledger")}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-success)" }}
              >
                {t("viewAll") || "عرض الكل"}
              </button>
            </div>
            <LedgerTable />
          </div>
        </div>
      ) : (
        <div className="surface-panel p-6">
          <LedgerTable />
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
    </div>
  );
}
