"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductDetailsProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  
  // Unwrap params safely for Next.js 15+
  const resolvedParams = use(params);
  const productId = resolvedParams.id as Id<"products">;

  // Fetch data
  const product = useQuery(api.products.getProduct, { productId });

  // Safe Hydration & Loading States
  if (product === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center" dir={dir}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-red-500" dir={dir}>
        <h2 className="text-2xl font-bold">404</h2>
        <p>{t("productNotFound")}</p>
        <Link href="/products">
          <Button variant="outline">{t("back")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={dir}>
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/products" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className={`h-6 w-6 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">{product.sku || t("noSku")}</p>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">{t("description")}</label>
            <p className="mt-1 text-gray-900 font-medium">{product.description || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">{t("price")}</label>
            <p className="mt-1 text-blue-600 font-bold">{product.price} DA</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">{t("costPrice")}</label>
            <p className="mt-1 text-gray-900 font-medium">{product.costPrice ? `${product.costPrice} DA` : "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">{t("stock")}</label>
            <p className={`mt-1 font-bold ${product.stock <= (product.minStockLevel || 0) ? 'text-red-600' : 'text-green-600'}`}>
              {product.stock}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">{t("barcode")}</label>
            <p className="mt-1 text-gray-900 font-medium">{product.barcode || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
