"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useI18n } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { PageHeader }      from "@/components/ui/page-header";
import { DataTable, AvatarCell, PriceCell } from "@/components/ui/data-table";
import { StatusBadge }     from "@/components/ui/status-badge";
import { ActionsMenu }     from "@/components/ui/actions-menu";
import { Button }          from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash2, PhoneCall } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/taxCalculator";
import { FilterBar } from "@/components/FilterBar";

/* ─── Component ──────────────────────────────────────────────────────────── */
export function CustomersTable() {
  const { t, dir, language } = useI18n();
  const isRTL    = dir === "rtl";
  const customers = useQuery(api.customers.listCustomers) ?? [];

  const [debtFilter, setDebtFilter] = useState<string | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    if (!debtFilter) return true;
    const hasDebt = (customer.totalDebt ?? 0) > 0;
    return debtFilter === "indebted" ? hasDebt : !hasDebt;
  });

  /* ─── Column definitions ──────────────────────────────────────────────── */
  const columns = [
    {
      key:      "name",
      header:   t("name"),
      sortable: true,
      cell: (row: (typeof filteredCustomers)[0]) => (
        <AvatarCell
          name={row.name}
          subtitle={row.email ?? undefined}
          dir={dir}
        />
      ),
    },
    {
      key:           "phone",
      header:        t("phone"),
      hideOnMobile:  true,
      cell: (row: (typeof filteredCustomers)[0]) => (
        <span className="text-mono" style={{ color: "var(--color-text-muted)" }}>
          {row.phone ?? "—"}
        </span>
      ),
    },
    {
      key:           "address",
      header:        t("address"),
      hideOnMobile:  true,
      cell: (row: (typeof filteredCustomers)[0]) => (
        <span
          className="text-sm"
          style={{
            color:       "var(--color-text-muted)",
            maxWidth:    "200px",
            display:     "block",
            overflow:    "hidden",
            textOverflow:"ellipsis",
            whiteSpace:  "nowrap",
          }}
        >
          {row.address ? row.address.slice(0, 38) + (row.address.length > 38 ? "…" : "") : "—"}
        </span>
      ),
    },
    {
      key:    "totalDebt",
      header: t("totalBalance"),
      align:  "end" as const,
      cell: (row: (typeof filteredCustomers)[0]) =>
        (row.totalDebt ?? 0) > 0 ? (
          <PriceCell
            amount={row.totalDebt}
            currency="DZD"
            locale={getLocale(language)}
            highlight="danger"
          />
        ) : (
          <StatusBadge variant="success" label={t("settled")} dot size="sm" />
        ),
    },
    {
      key:    "status",
      header: t("status"),
      align:  "center" as const,
      cell: (row: (typeof filteredCustomers)[0]) =>
        (row.totalDebt ?? 0) > 0 ? (
          <StatusBadge
            variant="danger"
            label={language === "ar" ? "مديون" : language === "fr" ? "Débiteur" : "Debtor"}
            dot
            size="sm"
          />
        ) : (
          <StatusBadge
            variant="success"
            label={language === "ar" ? "مسدد" : language === "fr" ? "Soldé" : "Settled"}
            dot
            size="sm"
          />
        ),
    },
    {
      key:    "actions",
      header: t("actions"),
      align:  "center" as const,
      width:  "60px",
      cell: (row: (typeof filteredCustomers)[0]) => (
        <ActionsMenu
          dir={dir}
          items={[
            {
              label:   t("view"),
              icon:    Eye,
              onClick: () => {
                if (row._id) window.location.href = `/customers/${row._id}`;
              },
            },
            {
              label:   language === "ar" ? "تعديل" : language === "fr" ? "Modifier" : "Edit",
              icon:    Pencil,
              onClick: () => {
                if (row._id) window.location.href = `/customers/${row._id}/edit`;
              },
            },
            {
              label:   language === "ar" ? "اتصال" : language === "fr" ? "Appeler" : "Call",
              icon:    PhoneCall,
              onClick: () => {
                if (row.phone) window.open(`tel:${row.phone}`);
              },
              disabled: !row.phone,
            },
            {
              label:    language === "ar" ? "حذف" : language === "fr" ? "Supprimer" : "Delete",
              icon:     Trash2,
              variant:  "danger",
              separator: true,
              onClick:  () => {
                /* TODO: confirm + delete mutation */
                console.warn("Delete customer:", row._id);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title={t("customers")}
        description={
          language === "ar"
            ? `${filteredCustomers.length} زبون مسجّل`
            : `${filteredCustomers.length} client${filteredCustomers.length > 1 ? "s" : ""} enregistré${filteredCustomers.length > 1 ? "s" : ""}`
        }
        dir={dir}
        stats={[
          {
            label: language === "ar" ? "إجمالي الديون" : language === "fr" ? "Total dettes" : "Total debt",
            value: formatCurrency(
              customers.reduce((s, c) => s + (c.totalDebt ?? 0), 0),
              language
            ),
            highlight: true,
          },
          {
            label: language === "ar" ? "مديونون" : language === "fr" ? "Débiteurs" : "Debtors",
            value: customers.filter((c) => (c.totalDebt ?? 0) > 0).length,
          },
        ]}
        actions={
          <Link href="/customers/create">
            <Button
              size="default"
              className={isRTL ? "flex-row-reverse" : ""}
            >
              <Plus className="h-4 w-4" />
              {t("createNew")}
            </Button>
          </Link>
        }
      />

      <FilterBar
        showStatus
        statusOptions={[
          { value: "indebted", label: language === "ar" ? "مديونون" : language === "fr" ? "Débiteurs" : "Debtors" },
          { value: "settled", label: language === "ar" ? "مسددون" : language === "fr" ? "Soldés" : "Settled" },
        ]}
        onFiltersChange={(newFilters) => setDebtFilter(newFilters.status)}
        dir={dir}
      />

      {/* Data Table */}
      <DataTable
        data={filteredCustomers}
        columns={columns}
        rowKey={(r) => r._id}
        searchable
        searchPlaceholder={t("searchCustomers")}
        dir={dir}
        language={language}
        emptyTitle={t("noCustomersFound")}
        emptyDesc={
          language === "ar"
            ? "ابدأ بإضافة أول زبون لك"
            : "Commencez par créer votre premier client"
        }
        emptyAction={{
          label: t("createNew"),
          href:  "/customers/create",
        }}
      />
    </>
  );
}
