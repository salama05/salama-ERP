"use client";

import { useCartStore } from "@/store/useCartStore";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const { t, dir, language } = useI18n();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const isRTL = dir === "rtl";

  return (
    <div className={cn(
      "w-full md:w-96 flex flex-col h-full shadow-lg z-10 transition-colors duration-200",
      "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700",
      isRTL ? "md:border-r border-t md:border-t-0" : "md:border-l border-t md:border-t-0"
    )}>
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 flex justify-between items-center">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          {t("cart")}
        </h2>
        {items.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearCart} 
            className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs px-2.5 h-8 font-semibold"
          >
            {t("clear")}
          </Button>
        )}
      </div>

      {/* Cart Items Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-gray-100 dark:divide-slate-700/60">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-12">
            <ShoppingCart className="h-14 w-14 mb-3 opacity-25 text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("cartEmpty")}</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="flex justify-between items-start pt-3 first:pt-0">
              <div className="flex-1 min-w-0 pr-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate" title={item.name}>
                  {item.name}
                </h4>
                <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-1">
                  {formatCurrency(item.price, language)}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => item.quantity > 1 ? updateQuantity(item.productId, item.quantity - 1) : removeItem(item.productId)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Action */}
      <div className="p-4 bg-gray-50/80 dark:bg-slate-900/80 border-t border-gray-200 dark:border-slate-700 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-600 dark:text-slate-300 text-sm font-bold">{t("total")}</span>
          <span className="text-slate-900 dark:text-slate-100 font-extrabold text-xl sm:text-2xl">
            {formatCurrency(total, language)}
          </span>
        </div>
        <Button 
          className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all rounded-xl" 
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          {t("checkout")}
        </Button>
      </div>
    </div>
  );
}
