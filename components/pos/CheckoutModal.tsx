"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartStore } from "@/store/useCartStore";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
        className={cn(
          "border rounded-xl max-w-md w-full animate-scale-in p-6",
          "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
        )}
      >
        <DialogHeader className="border-b border-gray-200 dark:border-slate-700 pb-3">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t("checkout")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
              {t("customer")}
            </label>
            <select 
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="" className="bg-white dark:bg-slate-800">{t("selectCustomer")}</option>
              {customers.map(c => (
                <option key={c._id} value={c._id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
              {t("paymentMethod")}
            </label>
            <div className={cn("flex gap-2.5", isRTL && "flex-row-reverse")}>
              {(["cash", "credit", "check"] as const).map(method => {
                const isActive = paymentMethod === method;
                return (
                  <Button
                    key={method}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "flex-1 h-11 text-sm font-semibold rounded-xl transition-all",
                      isActive 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                        : "border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    )}
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
              className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-900 transition-all cursor-pointer"
            />
            <label htmlFor="isOfficial" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer">
              {t("officialInvoice")}
            </label>
          </div>

          {/* Pricing Summary */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-bold">{t("totalToPay")}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl">
                {formatCurrency(total, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className={cn("flex justify-end gap-3 mt-2 border-t border-gray-200 dark:border-slate-700 pt-4", isRTL && "flex-row-reverse")}>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl h-11 px-5"
          >
            {t("cancel")}
          </Button>
          
          <Button 
            onClick={handleCheckout} 
            disabled={isSubmitting || !customerId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 font-bold disabled:opacity-50 transition-all"
          >
            {isSubmitting ? t("processing") : t("confirmPayment")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
