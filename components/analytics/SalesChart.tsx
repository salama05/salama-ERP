"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

interface ChartData {
  date: string;
  sales: number;
  profit: number;
  invoices: number;
}

interface SalesChartProps {
  data: ChartData[];
  isLoading?: boolean;
  chartType?: "line" | "bar";
}

type TooltipEntry = {
  color?: string;
  name?: string;
  value?: number | string;
};

type SalesTooltipProps = TooltipProps<any, any> & {
  language: "fr" | "ar" | "en";
};

function SalesTooltip({ active, payload, label, language }: SalesTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-[var(--color-bg-surface)] p-3 border border-[var(--color-border)] rounded shadow-lg">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
      {(payload as TooltipEntry[]).map((entry, idx) => (
        <p key={idx} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {Number(entry.value ?? 0).toLocaleString(getLocale(language), {
            style: "currency",
            currency: "DZD",
          })}
        </p>
      ))}
    </div>
  );
}

export function SalesChart({
  data,
  isLoading,
  chartType = "line",
}: SalesChartProps) {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (isLoading || !isMounted) {
    return (
      <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
        <h3 className="text-lg font-semibold mb-4">{t("salesTrend")}</h3>
        <div className="h-64 bg-[var(--color-bg-hover)] rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
        <h3 className="text-lg font-semibold mb-4">{t("salesTrend")}</h3>
        <p className="text-[var(--color-text-muted)] text-center py-16">
          {t("noDataAvailable")}
        </p>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: new Intl.DateTimeFormat(getLocale(language), {
      month: "short",
      day: "numeric",
    }).format(new Date(item.date)),
  }));

  return (
    <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
      <h3 className="text-lg font-semibold mb-4">
        {t("salesTrend")} ({t("thisMonth")})
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === "line" ? (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={(props) => <SalesTooltip {...props} language={language} />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              dot={{ r: 4 }}
              name={`${t("sales")} (DZD)`}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              dot={{ r: 4 }}
              name={`${t("netProfit")} (DZD)`}
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={(props) => <SalesTooltip {...props} language={language} />} />
            <Legend />
            <Bar dataKey="sales" fill="#3b82f6" name={`${t("sales")} (DZD)`} />
            <Bar dataKey="profit" fill="#10b981" name={`${t("netProfit")} (DZD)`} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
