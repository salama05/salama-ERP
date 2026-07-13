"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/taxCalculator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PurchaseDetailsProps {
  params: Promise<{ id: string }>;
}

export default function PurchaseDetailsPage({ params }: PurchaseDetailsProps) {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";
  
  const resolvedParams = use(params);
  const purchaseId = resolvedParams.id as Id<"purchases">;

  const data = useQuery(api.purchases.getPurchase, { purchaseId });

  if (data === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center" dir={dir}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-red-500" dir={dir}>
        <h2 className="text-2xl font-bold">404</h2>
        <p>{t("notFound") || "Record not found."}</p>
        <Link href="/purchases">
          <Button variant="outline">{t("back") || "Back"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={dir}>
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/purchases" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className={`h-6 w-6 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{data.purchaseNumber}</h1>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t("supplier")}</p>
            <p className="font-medium">{data.supplier?.name || t("unknown")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("status")}</p>
            <p className="font-medium">{data.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("total")}</p>
            <p className="font-medium">
              {formatCurrency(data.totalCost, language)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("amount")}</p>
            <p className="font-medium">
              {formatCurrency(data.amountPaid || 0, language)}
            </p>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{t("items") || "العناصر"}</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}>
                  {t("product") || "المنتج"}
                </th>
                <th className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isRTL ? "text-left" : "text-right"}`}>
                  {t("qty") || "الكمية"}
                </th>
                <th className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isRTL ? "text-left" : "text-right"}`}>
                  {t("purchasePriceUnit") || "سعر الشراء"}
                </th>
                <th className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isRTL ? "text-right" : "text-left"}`}>
                  {language === "ar" ? "تاريخ الصلاحية" : "Expiry Date"}
                </th>
                <th className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isRTL ? "text-left" : "text-right"}`}>
                  {t("total") || "المجموع"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items && data.items.length > 0 ? (
                data.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-end font-mono">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-end font-mono">
                      {formatCurrency(item.unitCost, language)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isRTL ? "text-right" : "text-left"} ${item.expiryDate && Date.now() > item.expiryDate ? "text-red-600" : "text-gray-900"}`}>
                      {item.expiryDate 
                        ? new Date(item.expiryDate).toLocaleDateString(language === "ar" ? "ar-EG" : language === "fr" ? "fr-FR" : "en-US")
                        : <span className="text-gray-400 italic">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-end font-mono">
                      {formatCurrency(item.itemTotal, language)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                    {t("noProductsFound") || "لا توجد منتجات"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
