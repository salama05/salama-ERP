"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface FilterBarProps {
  showDateRange?: boolean;
  showStatus?: boolean;
  showAmountRange?: boolean;
  statusOptions?: { value: string; label: string }[];
  onFiltersChange?: (filters: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => void;
  initialFilters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  };
}

export function FilterBar({
  showDateRange = true,
  showStatus = true,
  showAmountRange = true,
  statusOptions = [],
  onFiltersChange,
  initialFilters,
}: FilterBarProps) {
  const [dateFrom, setDateFrom] = React.useState<string | undefined>(
    initialFilters?.dateFrom,
  );
  const [dateTo, setDateTo] = React.useState<string | undefined>(
    initialFilters?.dateTo,
  );
  const [status, setStatus] = React.useState<string | undefined>(
    initialFilters?.status,
  );
  const [minAmount, setMinAmount] = React.useState<number | undefined>(
    initialFilters?.minAmount,
  );
  const [maxAmount, setMaxAmount] = React.useState<number | undefined>(
    initialFilters?.maxAmount,
  );

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setStatus(undefined);
    setMinAmount(undefined);
    setMaxAmount(undefined);
    onFiltersChange?.({});
  };

  const handleFilterChange = () => {
    onFiltersChange?.({
      dateFrom,
      dateTo,
      status,
      minAmount,
      maxAmount,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)]">
      {showDateRange && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">From</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value || undefined)}
            className="w-44"
          />
          <span className="text-sm font-medium text-[var(--color-text-muted)]">To</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value || undefined)}
            className="w-44"
          />
        </div>
      )}

      {showStatus && statusOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Status</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showAmountRange && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Amount</span>
          <Input
            type="number"
            placeholder="Min"
            value={minAmount}
            onChange={(e) =>
              setMinAmount(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-28"
          />
          <span className="text-sm font-medium text-[var(--color-text-muted)]">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxAmount}
            onChange={(e) =>
              setMaxAmount(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-28"
          />
        </div>
      )}

      <Button variant="outline" onClick={handleReset} className="ml-auto">
        <X className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
