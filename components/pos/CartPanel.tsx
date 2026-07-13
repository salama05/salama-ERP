"use client";

import { useCartStore } from "@/store/useCartStore";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const { t, dir, language } = useI18n();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const isRTL = dir === "rtl";

  return (
    <div className={`w-full md:w-96 bg-bg-elevated ${isRTL ? "border-r" : "border-l"} border-border flex flex-col h-full shadow-md z-10 animate-fade-in`}>
      {/* Panel Header */}
      <div className="p-4 border-b border-border bg-bg-surface flex justify-between items-center">
        <h2 className="font-bold text-text-primary text-heading-sm flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-brand" />
          {t("cart")}
        </h2>
        {items.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearCart} 
            className="text-danger hover:text-danger/80 hover:bg-danger/10 text-xs px-2.5 h-8 font-semibold"
          >
            {t("clear")}
          </Button>
        )}
      </div>

      {/* Cart Items Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted py-12">
            <ShoppingCart className="h-14 w-14 mb-3 opacity-20 text-brand" />
            <p className="text-body font-medium">{t("cartEmpty")}</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="flex justify-between items-start border-b border-border-subtle pb-4 last:border-0 last:pb-0 animate-fade-up">
              <div className="flex-1 min-w-0 pr-3">
                <h4 className="font-bold text-text-primary text-sm leading-snug truncate" title={item.name}>
                  {item.name}
                </h4>
                <div className="text-price text-brand font-semibold mt-1">
                  {formatCurrency(item.price, language)}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2.5">
                <div className="flex items-center gap-1.5 bg-bg-surface border border-border/50 rounded-lg p-1">
                  <button
                    onClick={() => item.quantity > 1 ? updateQuantity(item.productId, item.quantity - 1) : removeItem(item.productId)}
                    className="p-1 hover:bg-bg-elevated text-text-secondary hover:text-text-primary rounded-md transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-text-primary text-price">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-bg-elevated text-text-secondary hover:text-text-primary rounded-md transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-text-muted hover:text-danger p-1 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Action */}
      <div className="p-4 bg-bg-surface border-t border-border mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-text-secondary text-body font-medium">{t("total")}</span>
          <span className="text-price text-text-primary font-extrabold text-xl">
            {formatCurrency(total, language)}
          </span>
        </div>
        <Button 
          className="w-full h-12 text-md font-bold bg-brand hover:bg-brand-light text-white shadow-glow hover:shadow-lg transition-all" 
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          {t("checkout")}
        </Button>
      </div>
    </div>
  );
}
