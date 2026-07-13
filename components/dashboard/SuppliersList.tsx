"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { FilterBar } from "@/components/FilterBar";
import { exportToExcel, type ExcelColumn } from "@/lib/exportToExcel";

export function SuppliersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";
  const suppliers = useQuery(api.suppliers.listSuppliers) || [];

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filtered = suppliers.filter(
    (supplier) =>
      (supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.phone && supplier.phone.includes(searchTerm)) ||
        (supplier.nif && supplier.nif.includes(searchTerm))) &&
      (!statusFilter || supplier.status === statusFilter)
  );

  const handleExportToExcel = async () => {
    const columns: ExcelColumn[] = [
      { key: 'name', header: language === 'ar' ? 'الاسم' : 'Name' },
      { key: 'email', header: language === 'ar' ? 'البريد الإلكتروني' : 'Email' },
      { key: 'phone', header: language === 'ar' ? 'الهاتف' : 'Phone' },
      { key: 'nif', header: language === 'ar' ? 'الرقم الجبائي' : 'NIF' },
      { key: 'rc', header: language === 'ar' ? 'السجل التجاري' : 'RC' },
      { key: 'address', header: language === 'ar' ? 'العنوان' : 'Address' },
      { key: 'status', header: language === 'ar' ? 'الحالة' : 'Status', formatter: (val) => val === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive') },
      { key: '_creationTime', header: language === 'ar' ? 'تاريخ الإنشاء' : 'Created', formatter: (val) => new Date(val).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US') },
    ];

    try {
      await exportToExcel({
        data: filtered,
        columns,
        filename: language === 'ar' ? 'الموردين' : 'suppliers',
        sheetName: language === 'ar' ? 'الموردين' : 'Suppliers',
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert(language === 'ar' ? 'فشل التصدير' : 'Export failed');
    }
  };

  return (
    <div className="space-y-4" dir={dir}>
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("suppliers")}</h1>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline" onClick={handleExportToExcel} className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير Excel" : "Export Excel"}
          </Button>
          <Link href="/suppliers/create">
            <Button className={cn("gap-2", isRTL && "flex-row-reverse")}>
              <Plus className="h-4 w-4" />
              {t("addNewSupplier")}
            </Button>
          </Link>
        </div>
      </div>

      <div className={cn("flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2", isRTL && "flex-row-reverse")}>
        <Search className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
        <Input
          placeholder={language === "ar" ? "ابحث بالاسم، البريد، الهاتف أو الرقم الجبائي..." : "Rechercher par nom, email, téléphone ou NIF..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn("flex-1 bg-transparent border-0 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-0 focus-visible:ring-offset-0", isRTL && "text-right")}
        />
      </div>

      <FilterBar
        showStatus
        statusOptions={[
          { value: "active", label: language === "ar" ? "نشط" : language === "en" ? "Active" : "Actif" },
          { value: "inactive", label: language === "ar" ? "غير نشط" : language === "en" ? "Inactive" : "Inactif" },
        ]}
        onFiltersChange={(newFilters) => setStatusFilter(newFilters.status || null)}
      />

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-[var(--color-bg-hover)] border-b">
            <tr className={isRTL ? "flex-row-reverse" : ""}>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("name")}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("email")}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("phone")}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("fiscalId")}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t("status")}</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length > 0 ? (
              filtered.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-[var(--color-bg-hover)]">
                  <td className={cn("px-4 py-3 text-sm font-medium", isRTL ? "text-right" : "text-left")}>{supplier.name}</td>
                  <td className={cn("px-4 py-3 text-sm text-[var(--color-text-secondary)]", isRTL ? "text-right" : "text-left")}>{supplier.email || "—"}</td>
                  <td className={cn("px-4 py-3 text-sm text-[var(--color-text-secondary)]", isRTL ? "text-right" : "text-left")}>{supplier.phone || "—"}</td>
                  <td className={cn("px-4 py-3 text-sm text-[var(--color-text-secondary)]", isRTL ? "text-right" : "text-left")}>{supplier.nif || "—"}</td>
                  <td className={cn("px-4 py-3 text-sm", isRTL ? "text-right" : "text-left")}>
                    <span
                      className={
                        supplier.status === "active"
                          ? "badge badge-success"
                          : "badge badge-neutral"
                      }
                    >
                      {supplier.status === "active"
                        ? (language === "ar" ? "نشط" : language === "en" ? "Active" : "Actif")
                        : (language === "ar" ? "غير نشط" : language === "en" ? "Inactive" : "Inactif")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <Link 
                      href={supplier._id ? `/suppliers/${supplier._id}` : "#"}
                      onClick={(e) => {
                        if (!supplier._id) {
                          e.preventDefault();
                          console.error("Missing Supplier ID!");
                        }
                      }}
                    >
                      <Button variant="ghost" size="sm">
                        {t("view")}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  {t("noSuppliersFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
