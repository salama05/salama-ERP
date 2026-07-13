"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartStore } from "@/store/useCartStore";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { useState } from "react";
import { Search, Package, AlertCircle } from "lucide-react";

export function ProductGrid({ mode: _mode }: { mode: "retail" | "wholesale" }) {
  const { t, dir, language } = useI18n();
  const products = useQuery(api.products.listProducts, { includeCostPrice: false });
  const addItem = useCartStore((state) => state.addItem);
  const [search, setSearch] = useState("");

  void _mode;

  const isRTL = dir === "rtl";

  if (products === undefined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-secondary h-full animate-fade-in">
        <div className="skeleton w-full max-w-md h-10 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-[60vh]">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="skeleton h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.barcode && p.barcode.includes(search))
  );

  return (
    <div className="flex-1 flex flex-col h-full p-6 overflow-hidden animate-fade-in">
      {/* Search Input Bar */}
      <div className="relative mb-6">
        <Search className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-text-muted h-5 w-5`} />
        <input
          type="text"
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-3 bg-bg-elevated border border-border rounded-xl focus:ring-2 focus:ring-brand/20 transition-all text-text-primary placeholder:text-text-muted`}
        />
      </div>

      {/* Product List Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8">
          <Package className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-body font-medium">{t("productNotFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1 stagger-children">
          {filteredProducts.map((product) => {
            const displayPrice = product.price;
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product._id}
                onClick={() => {
                  if (isOutOfStock) return;
                  addItem({
                    productId: product._id,
                    name: product.name,
                    price: displayPrice,
                    quantity: 1,
                    taxRate: product.taxRate,
                  });
                }}
                className={`group p-4 bg-bg-elevated border border-border-subtle rounded-xl transition-all select-none flex flex-col justify-between min-h-[140px] ${
                  isOutOfStock 
                    ? "opacity-45 cursor-not-allowed bg-bg-surface/50" 
                    : "cursor-pointer hover:border-brand/40 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                }`}
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-text-primary text-body leading-tight line-clamp-2 group-hover:text-brand transition-colors" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="text-xs text-text-muted truncate">
                    {product.barcode ? `#${product.barcode}` : t("noSku")}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4 pt-2 border-t border-border/20">
                  <span className="text-price text-brand font-bold text-lg">
                    {formatCurrency(displayPrice, language)}
                  </span>
                  
                  {isOutOfStock ? (
                    <span className="badge badge-danger text-[10px]">
                      <AlertCircle className="h-3 w-3" />
                      {t("outOfStock")}
                    </span>
                  ) : (
                    <span className={`badge text-[10px] ${product.stock < 5 ? "badge-warning" : "badge-neutral"}`}>
                      {t("stock")}: {product.stock}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
