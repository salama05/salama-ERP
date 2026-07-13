"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Eye, Download } from "lucide-react";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { FilterBar } from "@/components/FilterBar";
import { exportToExcel, type ExcelColumn } from "@/lib/exportToExcel";

export function PurchasesList() {
  const purchases = useQuery(api.purchases.listPurchases) || [];
  const { t, language, dir } = useI18n();

  const [filters, setFilters] = useState({
    dateFrom: null as string | null,
    dateTo: null as string | null,
    status: null as string | null,
    amountMin: null as number | null,
    amountMax: null as number | null,
  });

  const filteredPurchases = purchases.filter((purchase) => {
    if (filters.dateFrom && new Date(purchase._creationTime) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(purchase._creationTime) > new Date(filters.dateTo)) return false;
    if (filters.status && purchase.status !== filters.status) return false;
    if (filters.amountMin !== null && purchase.totalCost < filters.amountMin) return false;
    if (filters.amountMax !== null && purchase.totalCost > filters.amountMax) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":     return "badge badge-success";
      case "received": return "badge badge-info";
      case "draft":    return "badge badge-neutral";
      default:         return "badge badge-neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return t("paid");
      case "received":
        return t("received");
      case "draft":
        return t("draft");
      default:
        return status;
    }
  };

  const handleExportToExcel = async () => {
    const columns: ExcelColumn[] = [
      { key: 'purchaseNumber', header: language === 'ar' ? 'رقم الشراء' : 'Purchase Number' },
      { key: 'supplierName', header: language === 'ar' ? 'المورد' : 'Supplier' },
      { key: 'productNames', header: language === 'ar' ? 'المنتجات' : 'Products', formatter: (val) => Array.isArray(val) ? val.join(', ') : val },
      { key: 'totalCost', header: language === 'ar' ? 'الإجمالي' : 'Total Cost', formatter: (val) => formatCurrency(val, language) },
      { key: 'amountPaid', header: language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid', formatter: (val) => formatCurrency(val || 0, language) },
      { key: 'status', header: language === 'ar' ? 'الحالة' : 'Status', formatter: (val) => getStatusLabel(val) },
      { key: '_creationTime', header: language === 'ar' ? 'التاريخ' : 'Date', formatter: (val) => new Date(val).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US') },
    ];

    try {
      await exportToExcel({
        data: filteredPurchases,
        columns,
        filename: language === 'ar' ? 'المشتريات' : 'purchases',
        sheetName: language === 'ar' ? 'المشتريات' : 'Purchases',
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert(language === 'ar' ? 'فشل التصدير' : 'Export failed');
    }
  };

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("purchases")}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportToExcel} className="gap-2">
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير Excel" : "Export Excel"}
          </Button>
          <Link href="/purchases/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("newSupply")}
            </Button>
          </Link>
        </div>
      </div>

      <FilterBar
        showDateRange
        showStatus
        statusOptions={[
          { value: "paid", label: t("paid") },
          { value: "received", label: t("received") },
          { value: "draft", label: t("draft") },
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

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-[var(--color-bg-hover)] border-b">
            <tr>
              <th className={`px-4 py-3 text-sm font-semibold ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t("invoiceNumber")}</th>
              <th className={`px-4 py-3 text-sm font-semibold ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t("supplier")}</th>
              <th className={`px-4 py-3 text-sm font-semibold ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t("product") || "المنتج"}</th>
              <th className={`px-4 py-3 text-sm font-semibold ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>{t("total")}</th>
              <th className={`px-4 py-3 text-sm font-semibold ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>{t("amount")}</th>
              <th className={`px-4 py-3 text-sm font-semibold ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t("status")}</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <tr key={purchase._id} className="hover:bg-[var(--color-bg-hover)]">
                  <td className="px-4 py-3 text-sm font-medium">{purchase.purchaseNumber}</td>
                  <td className="px-4 py-3 text-sm">{purchase.supplierName || t("unknown")}</td>
                  <td className="px-4 py-3 text-sm">
                    {purchase.productNames && purchase.productNames.length > 0 
                      ? purchase.productNames.slice(0, 3).join(language === 'ar' ? '، ' : ', ') + (purchase.productNames.length > 3 ? ` ${language === 'ar' ? '...' : '...'}` : '')
                      : <span className="text-[var(--color-text-muted)] italic">{t("noProductsFound") || "لا توجد منتجات"}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-end">
                    {formatCurrency(purchase.totalCost, language)}
                  </td>
                  <td className="px-4 py-3 text-sm text-end">
                    {formatCurrency(purchase.amountPaid || 0, language)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={getStatusColor(purchase.status)}>
                      {getStatusLabel(purchase.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <Link 
                      href={purchase._id ? `/purchases/${purchase._id}` : "#"}
                      onClick={(e) => {
                        if (!purchase._id) {
                          e.preventDefault();
                          console.error("Missing Purchase ID!");
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
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  {t("noPurchases")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
