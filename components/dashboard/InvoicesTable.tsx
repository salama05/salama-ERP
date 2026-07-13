"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Eye, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { FilterBar } from "@/components/FilterBar";
import { formatCurrency } from "@/lib/taxCalculator";
import { exportToExcel, type ExcelColumn } from "@/lib/exportToExcel";

export function InvoicesTable() {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";
  const invoices = useQuery(api.invoices.listInvoices) || [];

  const [filters, setFilters] = useState({
    dateFrom: null as string | null,
    dateTo: null as string | null,
    status: null as string | null,
    amountMin: null as number | null,
    amountMax: null as number | null,
  });

  const filteredInvoices = invoices.filter((invoice) => {
    if (filters.dateFrom && new Date(invoice._creationTime) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(invoice._creationTime) > new Date(filters.dateTo)) return false;
    if (filters.status && invoice.status !== filters.status) return false;
    if (filters.amountMin !== null && invoice.totalAmount < filters.amountMin) return false;
    if (filters.amountMax !== null && invoice.totalAmount > filters.amountMax) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":    return "badge badge-success";
      case "partial": return "badge badge-warning";
      case "unpaid":  return "badge badge-danger";
      case "draft":   return "badge badge-neutral";
      default:        return "badge badge-neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return t("paidStatus");
      case "partial":
        return t("partialStatus");
      case "draft":
        return t("draftStatus");
      default:
        return status === "unpaid" ? (language === "ar" ? "غير مدفوع" : "Unpaid") : status;
    }
  };

  const handleExportToExcel = async () => {
    const columns: ExcelColumn[] = [
      { key: 'invoiceNumber', header: language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number' },
      { key: 'customerName', header: language === 'ar' ? 'العميل' : 'Customer' },
      { key: 'isOfficial', header: language === 'ar' ? 'النوع' : 'Type', formatter: (val) => val ? (language === 'ar' ? 'رسمية' : 'Official') : (language === 'ar' ? 'تسليم' : 'Delivery') },
      { key: 'totalAmount', header: language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount', formatter: (val) => formatCurrency(val, language) },
      { key: 'amountPaid', header: language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid', formatter: (val) => formatCurrency(val, language) },
      { key: 'remainingDebt', header: language === 'ar' ? 'المتبقي' : 'Remaining Debt', formatter: (val) => formatCurrency(val, language) },
      { key: 'status', header: language === 'ar' ? 'الحالة' : 'Status', formatter: (val) => getStatusLabel(val) },
      { key: '_creationTime', header: language === 'ar' ? 'التاريخ' : 'Date', formatter: (val) => new Date(val).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US') },
    ];

    try {
      await exportToExcel({
        data: filteredInvoices,
        columns,
        filename: language === 'ar' ? 'الفواتير' : 'invoices',
        sheetName: language === 'ar' ? 'الفواتير' : 'Invoices',
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert(language === 'ar' ? 'فشل التصدير' : 'Export failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("invoices")}</h1>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline" onClick={handleExportToExcel} className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير Excel" : "Export Excel"}
          </Button>
          <Link href="/invoices/create">
            <Button className={cn("gap-2", isRTL && "flex-row-reverse")}>
              <Plus className="h-4 w-4" />
              {t("createNew")}
            </Button>
          </Link>
        </div>
      </div>

      <FilterBar
        showDateRange
        showStatus
        statusOptions={[
          { value: "paid", label: t("paidStatus") },
          { value: "partial", label: t("partialStatus") },
          { value: "unpaid", label: language === "ar" ? "غير مدفوع" : "Unpaid" },
          { value: "draft", label: t("draftStatus") },
        ]}
        showAmountRange
        onFiltersChange={(newFilters) => setFilters({
          dateFrom: newFilters.dateFrom || null,
          dateTo: newFilters.dateTo || null,
          status: newFilters.status || null,
          amountMin: newFilters.minAmount || null,
          amountMax: newFilters.maxAmount || null,
        })}
      />

      <div dir={dir} className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-[var(--color-bg-hover)] border-b">
            <tr>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("invoiceNumber")}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("customers")}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("type")}</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">{t("amount")}</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">{t("paid")}</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">{t("debt")}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("status")}</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-[var(--color-bg-hover)]">
                  <td className={cn("px-4 py-3 text-sm font-medium", isRTL ? "text-right" : "text-left")}>{invoice.invoiceNumber}</td>
                  <td className={cn("px-4 py-3 text-sm", isRTL ? "text-right" : "text-left")}>{invoice.customerName || "Unknown"}</td>
                  <td className={cn("px-4 py-3 text-sm", isRTL ? "text-right" : "text-left")}>
                    {invoice.isOfficial ? t("official") : t("informal")}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(invoice.totalAmount, language)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(invoice.amountPaid, language)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: "var(--color-danger)", fontWeight: 600 }}>
                    {formatCurrency(invoice.remainingDebt, language)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <Link 
                      href={invoice._id ? `/invoices/${invoice._id}` : "#"}
                      onClick={(e) => {
                        if (!invoice._id) {
                          e.preventDefault();
                          console.error("Missing Invoice ID!");
                        }
                      }}
                    >
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" />
                        {t("view")}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  {t("noInvoicesFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
