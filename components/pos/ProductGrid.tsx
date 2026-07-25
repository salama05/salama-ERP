"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartStore } from "@/store/useCartStore";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { useState } from "react";
import { Search, Package, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGrid({ mode: _mode }: { mode: "retail" | "wholesale" }) {
  const { t, dir, language } = useI18n();
  const products = useQuery(api.products.listProducts, { includeCostPrice: false });
  const addItem = useCartStore((state) => state.addItem);
  const [search, setSearch] = useState("");

  void _mode;

  const isRTL = dir === "rtl";

  if (products === undefined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400 h-full animate-fade-in">
        <div className="w-full max-w-md h-10 mb-6 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-[60vh]">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-32 w-full bg-gray-200 dark:bg-slate-800 animate-pulse rounded-xl" />
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
    <div className="flex-1 flex flex-col h-full p-4 sm:p-6 overflow-hidden animate-fade-in">
      {/* Search Input Bar */}
      <div className="relative mb-6">
        <Search className={cn(
          "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500",
          isRTL ? "right-3.5" : "left-3.5"
        )} />
        <input
          type="text"
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full py-3 border rounded-xl transition-all text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none",
            "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
            isRTL ? "pr-11 pl-4" : "pl-11 pr-4"
          )}
        />
      </div>

      {/* Product List Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8">
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("productNotFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1">
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
                className={cn(
                  "group p-4 rounded-xl border transition-all select-none flex flex-col justify-between min-h-[140px]",
                  "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700",
                  isOutOfStock 
                    ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-800/40" 
                    : "cursor-pointer hover:border-indigo-500/50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                )}
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                    {product.barcode ? `#${product.barcode}` : t("noSku")}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4 pt-2 border-t border-gray-100 dark:border-slate-700/60">
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-base sm:text-lg">
                    {formatCurrency(displayPrice, language)}
                  </span>
                  
                  {isOutOfStock ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t("outOfStock")}
                    </span>
                  ) : (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold",
                      product.stock < 5 
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    )}>
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
