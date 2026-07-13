"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PurchaseItem {
  productId: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string; // Date string like "2025-03-18"
}

export function PurchaseForm() {
  const router = useRouter();
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";

  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [status, setStatus] = useState<"draft" | "received" | "paid">("received");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "check">("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suppliers = useQuery(api.suppliers.listSuppliers, {}) || [];
  const products = useQuery(api.products.listProducts, {}) || [];
  const createPurchase = useMutation(api.purchases.createPurchase);

  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        unitCost: 0,
        expiryDate: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert(language === "ar" ? "يرجى اختيار المورد" : "Veuillez sélectionner un fournisseur");
      return;
    }
    if (items.length === 0) {
      alert(language === "ar" ? "يرجى إضافة عنصر واحد على الأقل" : "Veuillez ajouter au moins un article");
      return;
    }
    if (items.some((item) => !item.productId || item.quantity <= 0 || item.unitCost <= 0)) {
      alert(language === "ar" ? "يرجى ملء جميع تفاصيل العناصر" : "Veuillez remplir tous les détails des articles");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPurchase({
        supplierId: supplierId as any,
        items: items.map((item) => ({
          productId: item.productId as any,
          quantity: item.quantity,
          unitCost: item.unitCost,
          expiryDate: item.expiryDate ? new Date(item.expiryDate).getTime() : undefined,
        })),
        status,
        paymentMethod,
        amountPaid: amountPaid || undefined,
        notes: notes || undefined,
      });
      router.push("/purchases");
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert(language === "ar" ? "فشل في تسجيل عملية الشراء" : "Échec de l'enregistrement de l'achat");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={dir}>
      {/* Supplier Selection */}
      <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <h2 className={cn("text-lg font-semibold mb-4", isRTL ? "text-right" : "text-left")}>
          {t("supplierInfo")}
        </h2>
        <div className={isRTL ? "text-right" : "text-left"}>
          <Label htmlFor="supplier">{t("supplier")}</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t("selectSupplier")} />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier._id} value={String(supplier._id)}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchase Items */}
      <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
          <h2 className="text-lg font-semibold">{t("items")}</h2>
          <Button
            type="button"
            onClick={handleAddItem}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("addItem")}
          </Button>
        </div>

        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className={cn("flex gap-4 items-end pb-4 border-b last:border-b-0", isRTL && "flex-row-reverse")}>
                <div className="flex-1">
                  <Label htmlFor={`product-${index}`} className={cn("text-sm block", isRTL ? "text-right" : "text-left")}>
                    {t("product")}
                  </Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => handleItemChange(index, "productId", value)}
                  >
                    <SelectTrigger className="mt-1" id={`product-${index}`}>
                      <SelectValue placeholder={t("selectProduct")} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={String(product._id)}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Label htmlFor={`quantity-${index}`} className={cn("text-sm block", isRTL ? "text-right" : "text-left")}>
                    {t("qty")}
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", Number(e.target.value))
                    }
                    className="mt-1 text-left"
                    dir="ltr"
                  />
                </div>

                <div className="w-32">
                  <Label htmlFor={`cost-${index}`} className={cn("text-sm block", isRTL ? "text-right" : "text-left")}>
                    {t("purchasePriceUnit")}
                  </Label>
                  <Input
                    id={`cost-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitCost}
                    onChange={(e) =>
                      handleItemChange(index, "unitCost", Number(e.target.value))
                    }
                    className="mt-1 text-left"
                    dir="ltr"
                  />
                </div>
                
                <div className="w-36">
                  <Label htmlFor={`expiry-${index}`} className={cn("text-sm block", isRTL ? "text-right" : "text-left")}>
                    {language === "ar" ? "تاريخ الصلاحية" : "Expiry Date"}
                  </Label>
                  <Input
                    id={`expiry-${index}`}
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) =>
                      handleItemChange(index, "expiryDate", e.target.value)
                    }
                    className="mt-1 text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="w-32">
                  <Label className={cn("text-sm text-[var(--color-text-secondary)] block", isRTL ? "text-right" : "text-left")}>
                    {t("total")}
                  </Label>
                  <div className="mt-1 p-2 bg-[var(--color-bg-hover)] rounded border text-sm font-medium text-left" dir="ltr">
                    {formatCurrency(item.quantity * item.unitCost, language)}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className={cn("text-gray-500 text-sm py-4", isRTL ? "text-right" : "text-left")}>
              {t("noItemsAdded")}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className={cn("mt-6 pt-4 border-t flex", isRTL ? "justify-start text-left" : "justify-end text-right")}>
            <div className="text-right" dir="ltr">
              <p className="text-sm text-[var(--color-text-secondary)]">{t("totalOrderCost")}:</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalCost, language)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)] space-y-4">
        <h2 className={cn("text-lg font-semibold", isRTL ? "text-right" : "text-left")}>
          {t("paymentInfo")}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className={isRTL ? "text-right" : "text-left"}>
            <Label htmlFor="status">{t("status")}</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className="mt-2" id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t("draft")}</SelectItem>
                <SelectItem value="received">{t("received")}</SelectItem>
                <SelectItem value="paid">{t("paid")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={isRTL ? "text-right" : "text-left"}>
            <Label htmlFor="method">{t("paymentMethod")}</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger className="mt-2" id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t("cash")}</SelectItem>
                <SelectItem value="credit">{t("credit")}</SelectItem>
                <SelectItem value="check">{t("check")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={isRTL ? "text-right" : "text-left"}>
          <Label htmlFor="amountPaid">{t("amountPaid")}</Label>
          <Input
            id="amountPaid"
            type="number"
            min="0"
            step="0.01"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            className="mt-2 text-left"
            dir="ltr"
            placeholder="0.00"
          />
        </div>

        <div className={isRTL ? "text-right" : "text-left"}>
          <Label htmlFor="notes">{t("notes")}</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder={language === "ar" ? "ملاحظات إضافية..." : "Notes supplémentaires..."}
          />
        </div>
      </div>

      {/* Actions */}
      <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={isRTL ? "mr-auto" : "ml-auto"}
        >
          {isSubmitting ? t("saving") : t("savePurchaseOrder")}
        </Button>
      </div>
    </form>
  );
}
