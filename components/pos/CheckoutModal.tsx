"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartStore } from "@/store/useCartStore";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "retail" | "wholesale";
}

export function CheckoutModal({ isOpen, onClose, mode }: CheckoutModalProps) {
  const { t, dir, language } = useI18n();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  
  const customers = useQuery(api.customers.listCustomers) || [];
  const createInvoice = useMutation(api.invoices.createInvoice);

  const [customerId, setCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "check">("cash");
  const [isOfficial, setIsOfficial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!customerId) return alert(t("selectCustomer"));
    
    try {
      setIsSubmitting(true);
      
      await createInvoice({
        customerId: customerId as any,
        isOfficial,
        paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
      
      clearCart();
      onClose();
    } catch (error) {
      console.error(error);
      alert(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRTL = dir === "rtl";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        dir={dir} 
        className="bg-bg-elevated border border-border text-text-primary rounded-xl max-w-md w-full animate-scale-in"
      >
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-heading-md font-bold text-text-primary">
            {t("checkout")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="form-label font-semibold">{t("customer")}</label>
            <select 
              className="w-full bg-bg-surface border border-border rounded-xl p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/35 transition-all"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="" className="bg-bg-elevated">{t("selectCustomer")}</option>
              {customers.map(c => (
                <option key={c._id} value={c._id} className="bg-bg-elevated text-text-primary">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="form-label font-semibold">{t("paymentMethod")}</label>
            <div className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} gap-2.5`}>
              {(["cash", "credit", "check"] as const).map(method => {
                const isActive = paymentMethod === method;
                return (
                  <Button
                    key={method}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 h-11 text-sm font-semibold rounded-xl transition-all ${
                      isActive 
                        ? "bg-brand text-white shadow-md border-brand" 
                        : "border-border text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                    }`}
                  >
                    {t(method)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Official Invoice Toggle Checkbox */}
          <div className="flex items-center gap-3 py-1.5 px-1">
            <input 
              type="checkbox" 
              id="isOfficial" 
              checked={isOfficial} 
              onChange={(e) => setIsOfficial(e.target.checked)} 
              className="h-5 w-5 rounded-md border-border text-brand focus:ring-brand bg-bg-surface transition-all cursor-pointer accent-brand"
            />
            <label htmlFor="isOfficial" className="text-sm font-medium text-text-secondary select-none cursor-pointer">
              {t("officialInvoice")}
            </label>
          </div>

          {/* Pricing Summary */}
          <div className="pt-4 border-t border-border/40 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-body font-bold">{t("totalToPay")}</span>
              <span className="text-price text-brand font-extrabold text-2xl">
                {formatCurrency(total, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} justify-end gap-3 mt-2 border-t border-border/40 pt-4`}>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-border text-text-secondary hover:bg-bg-surface hover:text-text-primary rounded-xl h-11 px-5"
          >
            {t("cancel")}
          </Button>
          
          <Button 
            onClick={handleCheckout} 
            disabled={isSubmitting || !customerId}
            className="bg-brand hover:bg-brand-light text-white rounded-xl h-11 px-6 font-bold shadow-glow hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {isSubmitting ? t("processing") : t("confirmPayment")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
