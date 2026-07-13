"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, ListCollapse } from "lucide-react";
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

  // Calculate stats dynamically from the ledger
  const totalIncome = ledger
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = ledger
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Title & Actions */}
      <div className={cn("flex items-center justify-between pb-4 border-b", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {t("financeTitle") || "المالية"}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {t("financeDesc") || "إدارة الحسابات العامة، المصاريف، والسجل المحاسبي"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("addExpense") || "إضافة مصروف"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-4 py-2 font-medium border-b-2 transition-colors",
            activeTab === "overview"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          {t("overview") || "نظرة عامة"}
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "px-4 py-2 font-medium border-b-2 transition-colors",
            activeTab === "ledger"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          {t("viewLedger") || "السجل المحاسبي"}
        </button>
      </div>

      {/* Content */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Income Card */}
            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("totalIncome") || "إجمالي الإيرادات"}</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalIncome, language)}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("totalExpenses") || "إجمالي المصاريف"}</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(totalExpense, language)}
                </h3>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>

            {/* Net Profit Card */}
            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("netProfit") || "صافي الأرباح"}</p>
                <h3
                  className={cn(
                    "text-2xl font-bold mt-1",
                    netProfit >= 0 ? "text-indigo-600" : "text-red-600"
                  )}
                >
                  {formatCurrency(netProfit, language)}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Quick Ledger Preview */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("recentTransactions") || "العمليات الأخيرة"}</h3>
              <button
                onClick={() => setActiveTab("ledger")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {t("viewAll") || "عرض الكل"}
              </button>
            </div>
            <LedgerTable />
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
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
