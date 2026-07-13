"use client";

import { use, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Printer, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvoiceTemplate } from "@/components/invoices/InvoiceTemplate";
import { PrintPreviewModal } from "@/components/invoices/PrintPreviewModal";

interface InvoiceDetailsProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailsPage({ params }: InvoiceDetailsProps) {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const printRef = useRef<HTMLDivElement>(null);

  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id as Id<"invoices">;

  const data = useQuery(api.invoices.getInvoice, { invoiceId });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (data === undefined) {
    return (
      <div className="flex h-[60vh] items-center justify-center" dir={dir}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-transparent" />
          <p className="text-sm text-gray-500">Chargement de la facture…</p>
        </div>
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────────────────────
  if (data === null) {
    return (
      <div
        className="flex h-[60vh] flex-col items-center justify-center gap-4 text-red-500"
        dir={dir}
      >
        <h2 className="text-3xl font-bold">404</h2>
        <p className="text-gray-600">{t("notFound") || "Facture introuvable."}</p>
        <Link href="/invoices">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back") || "Retour"}
          </Button>
        </Link>
      </div>
    );
  }

  // ── Browser print helper ──────────────────────────────────────────────────
  const handleBrowserPrint = () => {
    window.print();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6" dir={dir}>
      {/* ─ Top Bar ───────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""} no-print`}
      >
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Link
            href="/invoices"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors"
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.invoiceNumber}</h1>
            <p className="text-sm text-gray-500">
              {data.isOfficial ? "Facture Officielle" : "Bon de Livraison"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBrowserPrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>

          <PrintPreviewModal
            invoiceId={invoiceId}
            triggerText="Télécharger PDF"
          >
            <Button size="sm" className="gap-2 bg-slate-800 hover:bg-slate-700 text-white">
              <Download className="h-4 w-4" />
              Télécharger PDF
            </Button>
          </PrintPreviewModal>
        </div>
      </div>

      {/* ─ Invoice Template ──────────────────────────────────────────────── */}
      <div ref={printRef}>
        <InvoiceTemplate
          data={{
            invoiceNumber: data.invoiceNumber,
            isOfficial: data.isOfficial,
            paymentMethod: data.paymentMethod,
            status: data.status,
            creationTime: data._creationTime,
            customer: data.customer
              ? {
                  name: data.customer.name,
                  email: data.customer.email,
                  phone: data.customer.phone,
                  address: data.customer.address,
                  nif: data.customer.nif,
                  rc: data.customer.rc,
                }
              : null,
            items: data.items.map((item) => ({
              productName: item.productName,
              description: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              itemSubtotal: item.itemSubtotal,
              itemTvaAmount: item.itemTvaAmount,
              itemTotal: item.itemTotal,
            })),
            subtotal: data.subtotal,
            tvaAmount: data.tvaAmount,
            timbreFiscal: data.timbreFiscal,
            totalAmount: data.totalAmount,
            amountPaid: data.amountPaid,
            remainingDebt: data.remainingDebt,
            notes: data.notes,
          }}
        />
      </div>

      {/* ─ Print Styles (injected into page) ─────────────────────────────── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
