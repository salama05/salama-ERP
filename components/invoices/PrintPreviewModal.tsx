"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceTemplate, type InvoiceTemplateData } from "./InvoiceTemplate";
import { formatNumber } from "@/lib/taxCalculator";
import { Printer, Download, FileText, Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface PrintPreviewModalProps {
  invoiceId: Id<"invoices">;
  children?: React.ReactNode;
  triggerText?: string;
}

// ─── Build InvoiceTemplateData from a Convex invoice record ───────────────
function buildTemplateData(invoice: NonNullable<ReturnType<typeof useQuery<typeof api.invoices.getInvoice>>>): InvoiceTemplateData {
  return {
    invoiceNumber: invoice.invoiceNumber,
    isOfficial: invoice.isOfficial,
    paymentMethod: invoice.paymentMethod,
    status: invoice.status,
    creationTime: invoice._creationTime,
    customer: invoice.customer
      ? {
          name: invoice.customer.name,
          email: invoice.customer.email,
          phone: invoice.customer.phone,
          address: invoice.customer.address,
          nif: invoice.customer.nif,
          rc: invoice.customer.rc,
        }
      : null,
    items: invoice.items.map((item) => ({
      productName: item.productName,
      description: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      itemSubtotal: item.itemSubtotal,
      itemTvaAmount: item.itemTvaAmount,
      itemTotal: item.itemTotal,
    })),
    subtotal: invoice.subtotal,
    tvaAmount: invoice.tvaAmount,
    timbreFiscal: invoice.timbreFiscal,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid,
    remainingDebt: invoice.remainingDebt,
    notes: invoice.notes,
  };
}

// ─── Off-screen container that renders InvoiceTemplate ────────────────────
// Mounted via portal so it inherits all CSS but stays invisible to the user.
function OffscreenInvoice({
  data,
  containerRef,
}: {
  data: InvoiceTemplateData;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "-99999px",
        width: "794px",   // A4 at 96 dpi
        zIndex: -1,
        pointerEvents: "none",
        background: "#ffffff",
      }}
    >
      <div ref={containerRef}>
        <InvoiceTemplate data={data} printMode />
      </div>
    </div>,
    document.body
  );
}

// ─── Core capture function ─────────────────────────────────────────────────
async function captureAndExport(
  el: HTMLDivElement,
  invoiceNumber: string,
  mode: "download" | "print"
): Promise<void> {
  // Lazy-import heavy libs so they don't bloat the initial bundle
  const [html2canvasModule, jsPDFModule] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const html2canvas = html2canvasModule.default;
  const jsPDF = jsPDFModule.default;

  const canvas = await html2canvas(el, {
    scale: 2,           // 2× for crisp retina output
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    // Ensure the full element is captured even if scrolled
    scrollX: 0,
    scrollY: 0,
    windowWidth: 794,
  });

  const imgData = canvas.toDataURL("image/png", 1.0);

  // A4 dimensions in mm
  const A4_W = 210;
  const A4_H = 297;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pxToMm = A4_W / canvas.width;
  const originalImgHeightMm = canvas.height * pxToMm;

  // 1. Fits in one page
  if (originalImgHeightMm <= A4_H) {
    pdf.addImage(imgData, "PNG", 0, 0, A4_W, originalImgHeightMm);
  } 
  // 2. Minor overflow (up to 25%) -> shrink to fit exactly 1 page
  else if (originalImgHeightMm <= A4_H * 1.25) {
    const scaleFactor = A4_H / originalImgHeightMm; // will be between 0.8 and 1.0
    const newWidth = A4_W * scaleFactor;
    const newHeight = A4_H; // exactly one page height
    const xOffset = (A4_W - newWidth) / 2; // Center horizontally
    
    pdf.addImage(imgData, "PNG", xOffset, 0, newWidth, newHeight);
  } 
  // 3. Major overflow (> 25%) -> slice across multiple pages
  else {
    let posY = 0;
    let remaining = originalImgHeightMm;

    while (remaining > 0) {
      const sliceH = Math.min(remaining, A4_H);
      pdf.addImage(imgData, "PNG", 0, posY, A4_W, originalImgHeightMm);
      remaining -= sliceH;
      if (remaining > 0) {
        pdf.addPage();
        posY -= A4_H;
      }
    }
  }

  if (mode === "download") {
    pdf.save(`${invoiceNumber}.pdf`);
  } else {
    // Open in a new tab and trigger the browser print dialog
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.addEventListener("load", () => win.print(), { once: true });
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

// ─── Modal Component ───────────────────────────────────────────────────────
export function PrintPreviewModal({
  invoiceId,
  children,
  triggerText = "Print / Preview",
}: PrintPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const offscreenRef = useRef<HTMLDivElement>(null);

  const invoice = useQuery(api.invoices.getInvoice, { invoiceId });

  if (!invoice) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  const templateData = buildTemplateData(invoice);

  // Give the off-screen element 300 ms to paint before capturing
  const waitForPaint = () =>
    new Promise<void>((resolve) => setTimeout(resolve, 300));

  const handleDownload = async () => {
    if (!offscreenRef.current) return;
    setIsDownloading(true);
    try {
      await waitForPaint();
      await captureAndExport(offscreenRef.current, invoice.invoiceNumber, "download");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Échec de la génération du PDF. Veuillez réessayer.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!offscreenRef.current) return;
    setIsPrinting(true);
    try {
      await waitForPaint();
      await captureAndExport(offscreenRef.current, invoice.invoiceNumber, "print");
    } catch (err) {
      console.error("Print failed:", err);
      alert("Échec de l'impression. Veuillez réessayer.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      {/* Off-screen InvoiceTemplate rendered at all times when modal is open */}
      {isOpen && (
        <OffscreenInvoice data={templateData} containerRef={offscreenRef} />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children ? (
            <div onClick={() => setIsOpen(true)}>{children}</div>
          ) : (
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              {triggerText}
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Imprimer &amp; Télécharger</DialogTitle>
            <DialogDescription>Facture : {invoice.invoiceNumber}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Invoice summary */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Numéro</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montant TTC</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatNumber(invoice.totalAmount, "fr", 0, 2)}{" "}
                  DA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-semibold text-slate-900">
                  {invoice.isOfficial ? "Facture Officielle" : "Bon de Livraison"}
                </span>
              </div>
            </div>

            {/* Info note */}
            <p className="text-xs text-slate-400 leading-relaxed">
              Le PDF sera généré à partir de la mise en page affichée à l'écran —
              ce que vous voyez est ce qui sera imprimé.
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleDownload}
                disabled={isDownloading || isPrinting}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération du PDF…
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger PDF
                  </>
                )}
              </Button>

              <Button
                onClick={handlePrint}
                disabled={isPrinting || isDownloading}
                variant="outline"
                className="w-full"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Préparation…
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
