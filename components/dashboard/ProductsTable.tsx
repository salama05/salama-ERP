"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Trash2, X, AlertTriangle, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/taxCalculator";
import { useUserRole } from "@/hooks/useUserRole";
import { FilterBar } from "@/components/FilterBar";
import { exportToExcel, type ExcelColumn } from "@/lib/exportToExcel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";
  const products = useQuery(api.products.listProducts, {});
  const role = useUserRole();
  const isOwner = role === "OWNER";

  const [filters, setFilters] = useState({
    dateFrom: null as string | null,
    dateTo: null as string | null,
    status: null as string | null,
    amountMin: null as number | null,
    amountMax: null as number | null,
  });

  // Mutations
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  // Modal states
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteProductItem, setDeleteProductItem] = useState<any>(null);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editBuyPrice, setEditBuyPrice] = useState(0);
  const [editSellPrice, setEditSellPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editMinStock, setEditMinStock] = useState(0);
  const [editTaxRate, setEditTaxRate] = useState(19);
  const [editExpiryDate, setEditExpiryDate] = useState<string | undefined>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (products === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (products === null) {
    return (
      <div className="p-8 border-2 border-dashed border-[var(--color-danger)] rounded-xl bg-[var(--color-danger)] bg-opacity-10 text-center" dir={dir}>
        <h2 className="text-xl font-semibold text-[var(--color-danger)] mb-2">{language === "ar" ? "تم رفض الوصول" : "Access Denied"}</h2>
        <p className="text-[var(--color-text-muted)]">
          {language === "ar" ? "لم نتمكن من التحقق من سياق المؤسسة الخاص بك. يرجى التأكد من تحديد مؤسسة في شريط التبديل الجانبي." : "We couldn't verify your organization context. Please ensure you have selected an organization in the sidebar switcher."}
        </p>
      </div>
    );
  }

  const filtered = products.filter(
    (product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesFilters = true;
      if (filters.status) {
        if (filters.status === "low_stock" && product.stock >= 10) matchesFilters = false;
        if (filters.status === "out_of_stock" && product.stock > 0) matchesFilters = false;
        if (filters.status === "in_stock" && product.stock < 10) matchesFilters = false;
      }
      if (filters.amountMin !== null && product.price < filters.amountMin) matchesFilters = false;
      if (filters.amountMax !== null && product.price > filters.amountMax) matchesFilters = false;

      return matchesSearch && matchesFilters;
    }
  );

  const handleOpenEdit = (product: any) => {
    setEditProduct(product);
    setEditName(product.name);
    setEditSku(product.sku || product.barcode || "");
    setEditBuyPrice(product.costPrice || 0);
    setEditSellPrice(product.price || 0);
    setEditStock(product.stock || 0);
    setEditMinStock(product.minStockLevel || 0);
    setEditTaxRate(product.taxRate || 19);
    setEditExpiryDate(product.expiryDate ? new Date(product.expiryDate).toISOString().split("T")[0] : "");
    setError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProduct({
        productId: editProduct._id,
        name: editName,
        skuOrBarcode: editSku || undefined,
        buyPrice: editBuyPrice,
        sellPrice: editSellPrice,
        initialStock: editStock,
        minStockLevel: editMinStock,
        taxRate: editTaxRate,
        expiryDate: editExpiryDate ? new Date(editExpiryDate).getTime() : undefined,
      });
      setEditProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductItem) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteProduct({
        productId: deleteProductItem._id,
      });
      setDeleteProductItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = async () => {
    const columns: ExcelColumn[] = [
      { key: 'name', header: language === 'ar' ? 'الاسم' : 'Name' },
      { key: 'sku', header: language === 'ar' ? 'الرمز' : 'SKU/Barcode' },
      { key: 'price', header: language === 'ar' ? 'سعر البيع' : 'Sell Price', formatter: (val) => formatCurrency(val, language) },
      { key: 'costPrice', header: language === 'ar' ? 'سعر الشراء' : 'Buy Price', formatter: (val) => val ? formatCurrency(val, language) : '—' },
      { key: 'stock', header: language === 'ar' ? 'المخزون' : 'Stock' },
      { key: 'minStockLevel', header: language === 'ar' ? 'الحد الأدنى' : 'Min Stock' },
      { key: 'taxRate', header: language === 'ar' ? 'ضريبة' : 'Tax Rate', formatter: (val) => `${val}%` },
      { key: 'expiryDate', header: language === 'ar' ? 'تاريخ الصلاحية' : 'Expiry Date', formatter: (val) => val ? new Date(val).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US') : '—' },
    ];

    try {
      await exportToExcel({
        data: filtered,
        columns,
        filename: language === 'ar' ? 'المنتجات' : 'products',
        sheetName: language === 'ar' ? 'المنتجات' : 'Products',
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert(language === 'ar' ? 'فشل التصدير' : 'Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t("products")}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{filtered.length} {language === "ar" ? "منتج" : "products"}</p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button
            variant="outline"
            size="lg"
            onClick={handleExportToExcel}
            className={cn("gap-2", isRTL && "flex-row-reverse")}
          >
            <Download className="h-5 w-5" />
            {language === "ar" ? "تصدير Excel" : "Export Excel"}
          </Button>
          <Link href="/products/create">
            <Button className={cn("gap-2", isRTL && "flex-row-reverse")} size="lg">
              <Plus className="h-5 w-5" />
              {t("createNew")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className={cn("flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2", isRTL && "flex-row-reverse")}>
        <Search className="h-5 w-5 text-[var(--color-text-muted)] flex-shrink-0" />
        <Input
          placeholder={t("searchByNameOrSku")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn("flex-1 bg-transparent border-0 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-0 focus-visible:ring-offset-0", isRTL && "text-right")}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <FilterBar
        showStatus
        statusOptions={[
          { value: "in_stock", label: language === "ar" ? "متوفر" : language === "fr" ? "En stock" : "In Stock" },
          { value: "low_stock", label: language === "ar" ? "مخزون منخفض" : language === "fr" ? "Stock faible" : "Low Stock" },
          { value: "out_of_stock", label: language === "ar" ? "إنتهى المخزون" : language === "fr" ? "Rupture de stock" : "Out of Stock" },
        ]}
        showAmountRange
        onFiltersChange={setFilters}
        dir={dir}
      />

      {/* Table */}
      <div dir={dir} className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-bg-hover)] border-b border-[var(--color-border)]">
              <th className={cn("px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>{t("name")}</th>
              <th className={cn("px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>{t("skuBarcode")}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{t("price")}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{t("stock")}</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{t("taxRate")}</th>
              <th className={cn("px-6 py-4 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>{language === "ar" ? "تاريخ الصلاحية" : "Expiry Date"}</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-bg-surface)]">
            {filtered.length > 0 ? (
              filtered.map((product, index) => (
                <tr key={product._id} className="hover:bg-[var(--color-bg-hover)] transition-colors duration-150 group">
                  <td className={cn("px-6 py-4 text-sm text-[var(--color-text-primary)] font-medium", isRTL ? "text-right" : "text-left")}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-dim)] border border-[var(--color-brand)]/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[var(--color-brand)]">
                          {index + 1}
                        </span>
                      </div>
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className={cn("px-6 py-4 text-xs text-[var(--color-text-muted)] font-mono", isRTL ? "text-right" : "text-left")}>{product.sku || product.barcode || "—"}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono text-[var(--color-text-primary)]">
                    {formatCurrency(product.price, language)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold">
                    <span className={cn(
                      "inline-block px-3 py-1.5 rounded-lg text-xs font-bold border",
                      product.stock < 10
                        ? "bg-[var(--color-danger-dim)] text-[var(--color-danger)] border-[var(--color-danger)]/30"
                        : product.stock < 50
                        ? "bg-[var(--color-warning-dim)] text-[var(--color-warning)] border-[var(--color-warning)]/30"
                        : "bg-[var(--color-success-dim)] text-[var(--color-success)] border-[var(--color-success)]/30"
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-brand-dim)] text-[var(--color-brand)] border-[var(--color-brand)]/30">
                      {(product.taxRate || 19).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-center">
                    {product.expiryDate ? (
                      <span className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-semibold",
                        new Date(product.expiryDate) < new Date() ? "bg-[var(--color-danger-dim)] text-[var(--color-danger)]" : "bg-[var(--color-info-dim)] text-[var(--color-info)]"
                      )}>
                        {new Date(product.expiryDate).toLocaleDateString(language === "ar" ? "ar-EG" : language === "fr" ? "fr-FR" : "en-US")}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-1 transition-opacity duration-150">
                      <Link 
                        href={product._id ? `/products/${product._id}` : "#"}
                        onClick={(e) => {
                          if (!product._id) {
                            e.preventDefault();
                            console.error("Missing ID!");
                          }
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          title={language === "ar" ? "عرض" : "View"}
                          className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {isOwner && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={language === "ar" ? "تعديل" : "Edit"}
                            className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                            onClick={() => handleOpenEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={language === "ar" ? "حذف" : "Delete"}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteProductItem(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center">
                      <Search className="h-8 w-8 text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t("noProductsFound")}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {searchTerm ? language === "ar" ? "جرب البحث بمصطلحات مختلفة" : "Try searching with different keywords" : language === "ar" ? "ابدأ بإضافة منتج جديد" : "Start by adding a new product"}
                      </p>
                    </div>
                    {!searchTerm && (
                      <Link href="/products/create">
                        <Button size="sm" className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          {t("createNew")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewProduct} onOpenChange={(open) => !open && setViewProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={cn(isRTL && "text-right")}>
              {language === "ar" ? "تفاصيل المنتج" : "Product Details"}
            </DialogTitle>
            <DialogDescription className={cn(isRTL && "text-right")}>
              {language === "ar" ? "مواصفات وبيانات المنتج الحالي" : "Specifications and parameters of the selected product"}
            </DialogDescription>
          </DialogHeader>

          {viewProduct && (
            <div className={cn("space-y-4 text-sm mt-4", isRTL && "text-right")} dir={dir}>
              <div className="grid grid-cols-3 py-2 border-b">
                <span className="text-[var(--color-text-muted)] font-medium col-span-1">{t("name")}</span>
                <span className="col-span-2 text-[var(--color-text-primary)] font-semibold">{viewProduct.name}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b">
                <span className="text-[var(--color-text-muted)] font-medium col-span-1">{t("skuBarcode")}</span>
                <span className="col-span-2 text-[var(--color-text-primary)] font-mono">{viewProduct.sku || viewProduct.barcode || "—"}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b">
                <span className="text-[var(--color-text-muted)] font-medium col-span-1">{t("sellPrice")}</span>
                <span className="col-span-2 text-[var(--color-text-primary)] font-mono font-semibold">{formatCurrency(viewProduct.price, language)}</span>
              </div>
              {isOwner && viewProduct.costPrice !== undefined && (
                <div className="grid grid-cols-3 py-2 border-b">
                  <span className="text-[var(--color-text-muted)] font-medium col-span-1">{t("buyPrice")}</span>
                  <span className="col-span-2 text-[var(--color-text-primary)] font-mono font-semibold">{formatCurrency(viewProduct.costPrice, language)}</span>
                </div>
              )}
              <div className="grid grid-cols-3 py-2 border-b">
                <span className="text-[var(--color-text-muted)] font-medium col-span-1">{t("stock")}</span>
                <span className="col-span-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-semibold",
                    viewProduct.stock < 10 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  )}>
                    {viewProduct.stock}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b">
                <span className="text-[var(--color-text-muted)] font-medium col-span-1">{t("minStockLevel")}</span>
                <span className="col-span-2 text-[var(--color-text-primary)]">{viewProduct.minStockLevel || 0}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b">
                <span className="text-[var(--color-text-muted)] font-medium col-span-1">{t("taxRate")}</span>
                <span className="col-span-2 text-[var(--color-text-primary)]">{(viewProduct.taxRate || 19)}%</span>
              </div>
              <div className="grid grid-cols-3 py-2">
                <span className="text-[var(--color-text-muted)] font-medium col-span-1">{language === "ar" ? "تاريخ انتهاء الصلاحية" : "Expiry Date"}</span>
                <span className="col-span-2 text-[var(--color-text-primary)]">
                  {viewProduct.expiryDate ? (
                    new Date(viewProduct.expiryDate).toLocaleDateString(language === "ar" ? "ar-EG" : language === "fr" ? "fr-FR" : "en-US")
                  ) : (
                    <span className="text-[var(--color-text-muted)]">—</span>
                  )}
                </span>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setViewProduct(null)}>
                  {language === "ar" ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={cn(isRTL && "text-right")}>
              {language === "ar" ? "تعديل المنتج" : "Edit Product"}
            </DialogTitle>
            <DialogDescription className={cn(isRTL && "text-right")}>
              {language === "ar" ? "تحديث معلومات وتفاصيل هذا المنتج" : "Update information and details for this product"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 mt-2" dir={dir}>
            <div className={cn("space-y-1", isRTL && "text-right")}>
              <Label htmlFor="edit-name">{t("name")} *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className={cn(isRTL && "text-right")}
              />
            </div>

            <div className={cn("space-y-1", isRTL && "text-right")}>
              <Label htmlFor="edit-sku">{t("skuBarcode")}</Label>
              <Input
                id="edit-sku"
                value={editSku}
                onChange={(e) => setEditSku(e.target.value)}
                className="text-left"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <Label htmlFor="edit-buy">{t("buyPrice")} *</Label>
                <Input
                  id="edit-buy"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editBuyPrice}
                  onChange={(e) => setEditBuyPrice(parseFloat(e.target.value) || 0)}
                  required
                  className="text-left"
                  dir="ltr"
                />
              </div>

              <div className={cn("space-y-1", isRTL && "text-right")}>
                <Label htmlFor="edit-sell">{t("sellPrice")} *</Label>
                <Input
                  id="edit-sell"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editSellPrice}
                  onChange={(e) => setEditSellPrice(parseFloat(e.target.value) || 0)}
                  required
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <Label htmlFor="edit-stock">{t("stock")} *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                  required
                  className="text-left"
                  dir="ltr"
                />
              </div>

              <div className={cn("space-y-1", isRTL && "text-right")}>
                <Label htmlFor="edit-min">{t("minStockLevel")} *</Label>
                <Input
                  id="edit-min"
                  type="number"
                  min="0"
                  value={editMinStock}
                  onChange={(e) => setEditMinStock(parseInt(e.target.value) || 0)}
                  required
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className={cn("space-y-1", isRTL && "text-right")}>
              <Label htmlFor="edit-tax">{t("taxRate")} (TVA) *</Label>
              <select
                id="edit-tax"
                value={editTaxRate}
                onChange={(e) => setEditTaxRate(parseInt(e.target.value) || 19)}
                className="w-full h-10 px-3 border border-[var(--color-border)] rounded-md bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
              >
                <option value={19}>19%</option>
                <option value={9}>9%</option>
                <option value={0}>0%</option>
              </select>
            </div>
            
            <div className={cn("space-y-1", isRTL && "text-right")}>
              <Label htmlFor="edit-expiry">{language === "ar" ? "تاريخ انتهاء الصلاحية (اختياري)" : "Expiry Date (Optional)"}</Label>
              <Input
                id="edit-expiry"
                type="date"
                value={editExpiryDate}
                onChange={(e) => setEditExpiryDate(e.target.value)}
                className="font-mono text-base"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <div className={cn("flex justify-end gap-2 pt-4", isRTL && "flex-row-reverse")}>
              <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("saving") : t("saveProduct") || "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProductItem} onOpenChange={(open) => !open && setDeleteProductItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse text-right")}>
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span>{language === "ar" ? "حذف المنتج" : "Delete Product"}</span>
            </DialogTitle>
            <DialogDescription className={cn(isRTL && "text-right")}>
              {language === "ar" ? "هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this product? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {deleteProductItem && (
            <div className="mt-4 space-y-4">
              <div className={cn("p-4 bg-gray-50 border rounded-lg", isRTL && "text-right")}>
                <p className="font-semibold text-gray-900">{deleteProductItem.name}</p>
                <p className="text-xs text-gray-500 mt-1">SKU/Barcode: {deleteProductItem.sku || deleteProductItem.barcode || "—"}</p>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}

              <div className={cn("flex justify-end gap-2 pt-2", isRTL && "flex-row-reverse")}>
                <Button type="button" variant="outline" onClick={() => setDeleteProductItem(null)} disabled={isSubmitting}>
                  {t("cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                  {isSubmitting ? t("saving") : language === "ar" ? "حذف" : "Delete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
