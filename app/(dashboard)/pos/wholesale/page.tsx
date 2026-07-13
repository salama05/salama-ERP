"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { CheckoutModal } from "@/components/pos/CheckoutModal";

export default function WholesalePOSPage() {
  const { dir } = useI18n();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] -m-4 md:-m-8 bg-gray-50" dir={dir}>
      {/* Product Grid Area */}
      <div className="flex-1 overflow-hidden">
        <ProductGrid mode="wholesale" />
      </div>

      {/* Cart Area */}
      <CartPanel onCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        mode="wholesale"
      />
    </div>
  );
}
