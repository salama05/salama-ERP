"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type DateRangeType = "today" | "week" | "month" | "custom";

interface DateRangePickerProps {
  onRangeChange: (daysBack: number, rangeType: DateRangeType) => void;
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [activeRange, setActiveRange] = useState<DateRangeType>("month");
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const ranges: Array<{
    label: string;
    value: DateRangeType;
    daysBack: number;
  }> = [
    { label: t("today"), value: "today", daysBack: 1 },
    { label: t("last7Days"), value: "week", daysBack: 7 },
    { label: t("thisMonth"), value: "month", daysBack: 30 },
  ];

  const handleRangeClick = (range: (typeof ranges)[0]) => {
    setActiveRange(range.value);
    onRangeChange(range.daysBack, range.value);
  };

  return (
    <div className={cn("flex items-center gap-2 p-3 bg-[var(--color-bg-hover)] rounded-lg border border-[var(--color-border)]", isRTL && "flex-row-reverse text-right") }>
      <Calendar className="h-4 w-4 text-[var(--color-text-secondary)]" />
      <div className={cn("flex gap-2", isRTL && "flex-row-reverse") }>
        {ranges.map((range) => (
          <Button
            key={range.value}
            size="sm"
            variant={activeRange === range.value ? "default" : "outline"}
            onClick={() => handleRangeClick(range)}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
