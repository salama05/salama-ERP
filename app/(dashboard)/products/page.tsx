"use client";

import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { useI18n } from "@/lib/i18n";

export default function ProductsPage() {
  const { t } = useI18n();
  
  return (
    <div className="space-y-6">
      <div className="surface-panel overflow-hidden p-0">
        <ProductsTable />
      </div>
    </div>
  );
}
