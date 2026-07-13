"use client";

import { PurchaseForm } from "@/components/dashboard/PurchaseForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CreatePurchasePage() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  return (
    <div dir={dir} className="min-h-screen bg-[var(--color-bg-primary)] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/purchases">
            <Button variant="outline" className="mb-4 flex items-center gap-2">
              {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {t("backToPurchases")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("recordNewPurchase")}</h1>
          <p className="text-gray-600 mt-2">{t("purchaseFormDesc")}</p>
        </div>
        <PurchaseForm />
      </div>
    </div>
  );
}
