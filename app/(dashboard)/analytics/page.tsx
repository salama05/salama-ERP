"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useQueries } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoleGate } from "@/components/auth/RoleGate";
import { MetricCard } from "@/components/analytics/MetricCard";
import {
  DateRangePicker,
  DateRangeType,
} from "@/components/analytics/DateRangePicker";
import { SalesChart } from "@/components/analytics/SalesChart";
import { StockAlertList } from "@/components/analytics/StockAlertList";
import { DebtLeaderboard } from "@/components/analytics/DebtLeaderboard";
import { TopProducts } from "@/components/analytics/TopProducts";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/taxCalculator";

type AnalyticsData = {
  revenueSummary: any;
  netProfit: any;
  taxLiability: any;
  trendData: any;
  topProducts: any;
  debtOverview: any;
  topDebtors: any;
  lowStockProducts: any;
};

export default function AnalyticsDashboardPage() {
  return (
    <RoleGate allowedRoles={["OWNER"]}>
      <AnalyticsDashboardContent />
    </RoleGate>
  );
}

function AnalyticsDashboardContent() {
  const [daysBack, setDaysBack] = useState(30);
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";

  const handleDateRangeChange = useCallback(
    (days: number, rangeType: DateRangeType) => {
      setDaysBack(days);
    },
    [],
  );

  // Fetch all analytics data
  const queries = useMemo(
    () => ({
      revenueSummary: {
        query: api.analytics.getRevenueSummary,
        args: { daysBack },
      },
      netProfit: {
        query: api.analytics.getNetProfit,
        args: { daysBack },
      },
      taxLiability: {
        query: api.analytics.getTaxLiability,
        args: { daysBack },
      },
      trendData: {
        query: api.analytics.getSalesTrendData,
        args: { daysBack },
      },
      topProducts: {
        query: api.analytics.getTopSellingProducts,
        args: { daysBack, limit: 5 },
      },
      debtOverview: {
        query: api.analytics.getDebtOverview,
        args: {},
      },
      topDebtors: {
        query: api.analytics.getTopDebtors,
        args: { limit: 5 },
      },
      lowStockProducts: {
        query: api.analytics.getLowStockProducts,
        args: {},
      },
    }),
    [daysBack],
  );

  const results = useQueries(queries);

  const isLoading = Object.values(results).some((q) => q === undefined);

  const revenueSummary = results.revenueSummary;
  const netProfit = results.netProfit;
  const taxLiability = results.taxLiability;
  const trendData = results.trendData || [];
  const topProducts = results.topProducts || [];
  const debtOverview = results.debtOverview;
  const topDebtors = results.topDebtors || [];
  const lowStockProducts = results.lowStockProducts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-primary)] to-[var(--color-bg-primary)] p-8">
      <div className="max-w-7xl mx-auto space-y-8" dir={dir}>
        {/* Header */}
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="mb-2 text-4xl font-bold text-[var(--color-text-primary)]">
            {t("analyticsDashboard")}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {t("monitorBusinessPerformance")}
          </p>
        </div>

        {/* Date Range Picker */}
        <div className={isRTL ? "flex flex-row-reverse" : "flex flex-row"}>
          <DateRangePicker onRangeChange={handleDateRangeChange} />
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t("totalSales")}
            value={revenueSummary?.totalRevenue || 0}
            subtitle={`${revenueSummary?.invoiceCount || 0} ${t("invoices")}`}
            icon={<DollarSign className="h-6 w-6 text-[var(--color-info)]" />}
            format="currency"
          />

          <MetricCard
            title={t("netProfit")}
            value={netProfit?.netProfit || 0}
            subtitle={t("afterCostOfGoods")}
            icon={
              <TrendingUp className="h-6 w-6 text-[var(--color-success)]" />
            }
            format="currency"
          />

          <MetricCard
            title={t("outstandingDebt")}
            value={debtOverview?.totalDebt || 0}
            subtitle={`${t("fromCustomers")} ${debtOverview?.debtorsCount || 0} ${t("customers")}`}
            icon={<Users className="h-6 w-6 text-[var(--color-warning)]" />}
            format="currency"
          />

          <MetricCard
            title={t("lowStockItems")}
            value={lowStockProducts?.length || 0}
            subtitle={t("belowMinimumLevel")}
            icon={
              <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" />
            }
            format="number"
          />
        </div>

        {/* Tax Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title={t("totalTVACollected")}
            value={taxLiability?.totalTVA || 0}
            subtitle={t("algerianVat")}
            icon={
              <BarChart3 className="h-6 w-6 text-[var(--color-secondary)]" />
            }
            format="currency"
          />

          <MetricCard
            title={t("taxLiability")}
            value={taxLiability?.totalTaxLiability || 0}
            subtitle={`${t("tvaAndTimbre")} : ${formatCurrency(taxLiability?.totalTimbreFiscal || 0, language)}`}
            icon={<BarChart3 className="h-6 w-6 text-[var(--color-brand)]" />}
            format="currency"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesChart data={trendData} isLoading={isLoading} />
          </div>
          <TopProducts items={topProducts} isLoading={isLoading} />
        </div>

        {/* Alerts and Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockAlertList items={lowStockProducts} isLoading={isLoading} />
          <DebtLeaderboard
            items={topDebtors}
            totalDebt={debtOverview?.totalDebt}
            isLoading={isLoading}
          />
        </div>

        {/* Additional Metrics */}
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">{t("summary")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("averageProfitMargin")}
              </p>
              <p className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">
                {revenueSummary && netProfit
                  ? (
                      (netProfit.netProfit / revenueSummary.totalRevenue) *
                        100 || 0
                    ).toFixed(1) + "%"
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("averageTransactionValue")}
              </p>
              <p className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">
                {revenueSummary && revenueSummary.invoiceCount > 0
                  ? formatCurrency(revenueSummary.totalRevenue / revenueSummary.invoiceCount, language)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("creditUtilization")}
              </p>
              <p className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">
                {debtOverview && revenueSummary
                  ? (
                      (debtOverview.totalDebt / revenueSummary.totalRevenue) *
                      100
                    ).toFixed(1) + "%"
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
