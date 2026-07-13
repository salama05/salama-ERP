"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CustomerDetailsProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailsPage({ params }: CustomerDetailsProps) {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  // Unwrap params safely for Next.js 15+
  const resolvedParams = use(params);
  const customerId = resolvedParams.id as Id<"customers">;

  // Fetch data
  const customer = useQuery(api.customers.getCustomer, { customerId });

  // Safe Hydration & Loading States
  if (customer === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center" dir={dir}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand)] border-t-transparent"></div>
      </div>
    );
  }

  if (customer === null) {
    return (
      <div
        className="flex h-[50vh] flex-col items-center justify-center gap-4 text-[var(--color-danger)]"
        dir={dir}
      >
        <h2 className="text-2xl font-bold">404</h2>
        <p>{t("customerNotFound") || "Customer not found."}</p>
        <Link href="/customers">
          <Button variant="outline">{t("back") || "Back"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={dir}>
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Link
          href="/customers"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className={`h-6 w-6 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-info-dim)] p-3 rounded-full text-[var(--color-info)]">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {customer.name}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {customer.status === "active"
                ? t("active") || "Active"
                : t("inactive") || "Inactive"}
            </p>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-xl border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">
              {t("email") || "Email"}
            </label>
            <p className="mt-1 text-[var(--color-text-primary)] font-medium">
              {customer.email || "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">
              {t("phone") || "Phone"}
            </label>
            <p
              className="mt-1 text-[var(--color-text-primary)] font-medium"
              dir="ltr"
            >
              {customer.phone || "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[var(--color-text-muted)]">
              {t("address") || "Address"}
            </label>
            <p className="mt-1 text-[var(--color-text-primary)] font-medium">
              {customer.address || "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">
              {t("totalDebt") || "Total Debt"}
            </label>
            <p className="mt-1 text-[var(--color-danger)] font-bold">
              {customer.totalDebt} DA
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">
              {t("creditLimit") || "Credit Limit"}
            </label>
            <p className="mt-1 text-[var(--color-text-primary)] font-medium">
              {customer.creditLimit ? `${customer.creditLimit} DA` : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
