"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SupplierDetailsProps {
  params: Promise<{ id: string }>;
}

export default function SupplierDetailsPage({ params }: SupplierDetailsProps) {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";
  
  const resolvedParams = use(params);
  const supplierId = resolvedParams.id as Id<"suppliers">;

  const data = useQuery(api.suppliers.getSupplier, { supplierId });

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
        <Link href="/suppliers">
          <Button variant="outline">{t("back") || "Back"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={dir}>
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/suppliers" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className={`h-6 w-6 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t("phone")}</p>
            <p className="font-medium">{data.phone || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("email")}</p>
            <p className="font-medium">{data.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("fiscalId")}</p>
            <p className="font-medium">{data.nif || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t("status")}</p>
            <p className="font-medium">
              {data.status === "active" 
                ? (language === "ar" ? "نشط" : "Actif")
                : (language === "ar" ? "غير نشط" : "Inactif")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
