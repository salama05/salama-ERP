"use client";

import React, { useState, useEffect } from "react";
import { formatNumber, formatCurrency } from "@/lib/taxCalculator";
import { formatAmountInWords } from "@/lib/arabicUtils";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface InvoiceTemplateData {
  invoiceNumber: string;
  isOfficial: boolean;
  paymentMethod: "cash" | "credit" | "check";
  status: "draft" | "issued" | "paid" | "partial" | "void";
  creationTime: number; // _creationTime from Convex

  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    nif?: string | null;
    rc?: string | null;
  } | null;

  items: Array<{
    productName?: string | null;
    description?: string | null;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    itemSubtotal: number;
    itemTvaAmount: number;
    itemTotal: number;
  }>;

  subtotal: number;
  tvaAmount: number;
  timbreFiscal: number;
  totalAmount: number;
  amountPaid: number;
  remainingDebt: number;
  notes?: string | null;
}

// ─── Fallback Constant Company Info ───────────────────────────────────────────
const COMPANY_FALLBACK = {
  name: "Salama ERP",
  activity: "Commerce de gros et de détail",
  address: "Cité Exemple, Commune, Wilaya, Algérie",
  phone: "+213 XX XX XX XX",
  email: "contact@salamaerp.com",
  nif: "00 000 000 000 000 00",
  nis: "000 000 000 000 000",
  rc: "00/00-0000000X00",
  n_art: "00000000000",
  logo: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    cash: "Espèces",
    credit: "Crédit",
    check: "Chèque",
  };
  return map[method] ?? method;
}

function statusConfig(status: string): {
  label: string;
  bg: string;
  text: string;
  dot: string;
} {
  const map: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    draft: {
      label: "Brouillon",
      bg: "rgba(100,116,139,0.12)",
      text: "#475569",
      dot: "#94a3b8",
    },
    issued: {
      label: "Émise",
      bg: "rgba(59,130,246,0.10)",
      text: "#1d4ed8",
      dot: "#3b82f6",
    },
    paid: {
      label: "Payée",
      bg: "rgba(16,185,129,0.10)",
      text: "#065f46",
      dot: "#10b981",
    },
    partial: {
      label: "Partielle",
      bg: "rgba(245,158,11,0.10)",
      text: "#92400e",
      dot: "#f59e0b",
    },
    void: {
      label: "Annulée",
      bg: "rgba(239,68,68,0.10)",
      text: "#b91c1c",
      dot: "#ef4444",
    },
  };
  return (
    map[status] ?? {
      label: status,
      bg: "rgba(100,116,139,0.12)",
      text: "#475569",
      dot: "#94a3b8",
    }
  );
}

// ─── Geometric Logo Mark (SVG) ────────────────────────────────────────────────
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Outer hexagon ring */}
      <path
        d="M20 3L35.6 12V28L20 37L4.4 28V12L20 3Z"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.2"
      />
      {/* Inner diamond */}
      <path
        d="M20 10L28 20L20 30L12 20L20 10Z"
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />
      {/* Center dot accent (emerald) */}
      <circle cx="20" cy="20" r="3.5" fill="#6ee7b7" />
      {/* Top line accent */}
      <line x1="20" y1="10" x2="20" y2="13" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Section Label Component ──────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#94a3b8",
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface InvoiceTemplateProps {
  data: InvoiceTemplateData;
  /** Set to true when rendering for print (removes UI chrome) */
  printMode?: boolean;
}

export function InvoiceTemplate({ data, printMode = false }: InvoiceTemplateProps) {
  const invoiceDate = formatDate(data.creationTime);
  const badge = statusConfig(data.status);
  const customer = data.customer;

  // State to hold dynamic merchant settings loaded from localStorage
  const [store, setStore] = useState(COMPANY_FALLBACK);

  const loadSettings = () => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("merchant_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStore({
            name: parsed.store_name || COMPANY_FALLBACK.name,
            activity:
              parsed.business_activity?.fr ||
              parsed.business_activity?.ar ||
              COMPANY_FALLBACK.activity,
            address:
              parsed.company_address?.fr ||
              parsed.company_address?.ar ||
              COMPANY_FALLBACK.address,
            phone: parsed.phone || COMPANY_FALLBACK.phone,
            email: parsed.email || COMPANY_FALLBACK.email,
            nif: parsed.nif || COMPANY_FALLBACK.nif,
            nis: parsed.nis || COMPANY_FALLBACK.nis,
            rc: parsed.rc || COMPANY_FALLBACK.rc,
            n_art: parsed.n_art || COMPANY_FALLBACK.n_art,
            logo: parsed.logo || "",
          });
        } catch (e) {
          console.error("Failed to parse merchant settings in InvoiceTemplate", e);
        }
      }
    }
  };

  useEffect(() => {
    loadSettings();
    if (typeof window !== "undefined") {
      window.addEventListener("merchant_settings_changed", loadSettings);
      return () => {
        window.removeEventListener("merchant_settings_changed", loadSettings);
      };
    }
  }, []);

  // ── Color tokens (inline for print stability) ────────────────────────────
  const C = {
    navy: "#0f1f3d",       // deep primary
    navyMid: "#162040",    // gradient midpoint
    navySoft: "#1e2d4f",   // gradient end
    emerald: "#10b981",    // accent
    emeraldSoft: "rgba(16,185,129,0.08)",
    bodyText: "#1e293b",   // near-black body
    label: "#64748b",      // secondary label
    border: "#e2e8f0",     // soft neutral border
    stripAlt: "#f8fafc",   // table alt row
    bg: "#ffffff",
    pageBg: "#f1f5f9",
  };

  const containerStyle: React.CSSProperties = {
    background: C.bg,
    fontFamily: "'Inter', 'IBM Plex Sans Arabic', 'Tajawal', Arial, sans-serif",
    color: C.bodyText,
    direction: "ltr",
    ...(printMode
      ? {}
      : {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px -10px rgba(0,0,0,0.15)",
        }),
  };

  return (
    <div id="invoice-print-area" style={containerStyle}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 55%, ${C.navySoft} 100%)`,
          padding: "36px 40px 30px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background texture rings */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        {/* Accent bar — left edge */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            background: `linear-gradient(180deg, ${C.emerald} 0%, rgba(16,185,129,0.3) 100%)`,
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>

          {/* ── Company block (Left) ── */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <LogoMark size={42} />
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  {store.name}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>
                  {store.activity}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: C.emerald, fontSize: "11px" }}>◉</span>
                {store.address}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: C.emerald, fontSize: "11px" }}>◉</span>
                {store.phone}&nbsp;&nbsp;·&nbsp;&nbsp;{store.email}
              </div>
            </div>
          </div>

          {/* ── Invoice title block (Right) ── */}
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", minWidth: "200px" }}>
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                style={{ height: "44px", maxWidth: "180px", objectFit: "contain", borderRadius: "6px", background: "rgba(255,255,255,0.08)", padding: "4px 8px" }}
              />
            ) : null}
            <div style={{ fontSize: "34px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {data.isOfficial ? "FACTURE" : "BON DE LIVRAISON"}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono', 'Courier New', monospace", letterSpacing: "0.06em" }}>
              {data.invoiceNumber}
            </div>
            {/* Status badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: badge.bg,
                color: badge.text,
                borderRadius: "999px",
                padding: "4px 12px 4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                backdropFilter: "blur(8px)",
                border: `1px solid ${badge.dot}30`,
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: badge.dot, display: "inline-block", flexShrink: 0 }} />
              {badge.label}
            </div>
          </div>
        </div>
      </div>

      {/* ══ FISCAL INFO STRIP ════════════════════════════════════════════════════ */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 40px",
          display: "flex",
          flexWrap: "wrap",
          gap: "0 32px",
        }}
      >
        {[
          { label: "NIF", value: store.nif },
          { label: "NIS", value: store.nis },
          { label: "N° RC", value: store.rc },
          { label: "Article", value: store.n_art },
        ].map(({ label, value }) => (
          <div key={label} style={{ fontSize: "11px", color: C.label, padding: "2px 0" }}>
            <span style={{ fontWeight: 700, color: C.bodyText, marginRight: "4px", letterSpacing: "0.03em" }}>{label}:</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ══ META & CUSTOMER ROW ═══════════════════════════════════════════════════ */}
      <div style={{ padding: "32px 40px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Invoice Meta (Left) */}
        <div>
          <SectionLabel>Détails de la facture</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Numéro de facture", value: data.invoiceNumber, mono: true, bold: true },
              { label: "Date d'émission", value: invoiceDate },
              { label: "Mode de règlement", value: paymentMethodLabel(data.paymentMethod) },
              { label: "Type", value: data.isOfficial ? "Facture Officielle" : "Bon de Livraison" },
            ].map(({ label, value, mono, bold }) => (
              <div key={label} style={{ display: "flex", alignItems: "baseline", gap: "8px", fontSize: "13px" }}>
                <span style={{ color: C.label, fontWeight: 400, width: "150px", flexShrink: 0 }}>{label}</span>
                <span
                  style={{
                    color: C.bodyText,
                    fontWeight: bold ? 700 : 500,
                    fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
                    letterSpacing: mono ? "0.05em" : undefined,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Block (Right) */}
        <div
          style={{
            background: "#f8fafc",
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "18px 20px",
            borderLeft: `3px solid ${C.emerald}`,
          }}
        >
          <SectionLabel>Facturé à</SectionLabel>
          {customer ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: C.bodyText, marginBottom: "4px" }}>{customer.name}</div>
              {customer.address && (
                <div style={{ color: C.label, display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ color: C.emerald, fontSize: "11px", marginTop: "2px" }}>◉</span>
                  {customer.address}
                </div>
              )}
              {customer.phone && (
                <div style={{ color: C.label, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: C.emerald, fontSize: "11px" }}>◉</span>
                  {customer.phone}
                </div>
              )}
              {customer.email && (
                <div style={{ color: C.label, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: C.emerald, fontSize: "11px" }}>◉</span>
                  {customer.email}
                </div>
              )}
              {(customer.nif || customer.rc) && (
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "10px",
                    borderTop: `1px solid ${C.border}`,
                    display: "flex",
                    gap: "16px",
                    fontSize: "11px",
                    color: C.label,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {customer.nif && (
                    <span><strong style={{ color: C.bodyText }}>NIF:</strong> {customer.nif}</span>
                  )}
                  {customer.rc && (
                    <span><strong style={{ color: C.bodyText }}>RC:</strong> {customer.rc}</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>Client non spécifié</div>
          )}
        </div>
      </div>

      {/* ══ ITEMS TABLE ══════════════════════════════════════════════════════════ */}
      <div style={{ padding: "0 40px 32px" }}>
        <SectionLabel>Articles & Prestations</SectionLabel>
        <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.border}` }}>
          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: `linear-gradient(90deg, ${C.navy}f5 0%, ${C.navySoft}f5 100%)`,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase", width: "38%" }}>
                  Désignation / Description
                </th>
                <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600, fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase" }}>Qté</th>
                <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600, fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase" }}>P.U H.T (DA)</th>
                <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600, fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase" }}>TVA %</th>
                <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600, fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase" }}>Montant TVA</th>
                <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600, fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase" }}>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "#94a3b8", fontStyle: "italic" }}>
                    Aucun article
                  </td>
                </tr>
              ) : (
                data.items.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: idx % 2 === 0 ? "#ffffff" : C.stripAlt,
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: C.bodyText }}>
                      {item.description || item.productName || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: C.label, fontFamily: "monospace" }}>
                      {formatNumber(item.quantity, "fr", 0, 0)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: C.label, fontFamily: "monospace" }}>
                      {formatNumber(item.unitPrice, "fr", 0, 2)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: C.label }}>
                      {item.taxRate}%
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: C.label, fontFamily: "monospace" }}>
                      {formatNumber(item.itemTvaAmount, "fr", 0, 2)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: C.bodyText, fontFamily: "monospace" }}>
                      {formatNumber(item.itemTotal, "fr", 0, 2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ TOTALS + TVA DETAIL ══════════════════════════════════════════════════ */}
      <div style={{ padding: "0 40px 32px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* TVA Recap */}
        <div style={{ flex: 1, minWidth: "260px" }}>
          <SectionLabel>Récapitulatif TVA</SectionLabel>
          <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                background: "#f1f5f9",
                padding: "9px 16px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.label,
              }}
            >
              <span>Taux</span>
              <span style={{ textAlign: "right" }}>Base H.T</span>
              <span style={{ textAlign: "right" }}>Montant TVA</span>
            </div>
            {Array.from(
              data.items.reduce((acc, item) => {
                const key = item.taxRate;
                const existing = acc.get(key) ?? { base: 0, tva: 0 };
                acc.set(key, {
                  base: existing.base + item.itemSubtotal,
                  tva: existing.tva + item.itemTvaAmount,
                });
                return acc;
              }, new Map<number, { base: number; tva: number }>()).entries()
            ).map(([rate, vals]) => (
              <div
                key={rate}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "9px 16px",
                  borderTop: `1px solid ${C.border}`,
                  fontSize: "12px",
                  color: C.label,
                  fontFamily: "monospace",
                }}
              >
                <span style={{ fontWeight: 600, color: C.bodyText, fontFamily: "inherit" }}>{rate}%</span>
                <span style={{ textAlign: "right" }}>{formatNumber(vals.base, "fr", 0, 2)}</span>
                <span style={{ textAlign: "right" }}>{formatNumber(vals.tva, "fr", 0, 2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div style={{ width: "300px" }}>
          <SectionLabel>Montants</SectionLabel>
          <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.border}` }}>
            {/* Sous-total */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 18px", fontSize: "13px", color: C.label, borderBottom: `1px solid ${C.border}` }}>
              <span>Sous-total H.T</span>
              <span style={{ fontFamily: "monospace", fontWeight: 500, color: C.bodyText }}>
                {formatNumber(data.subtotal, "fr", 0, 2)} DA
              </span>
            </div>
            {/* TVA */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 18px", fontSize: "13px", color: C.label, borderBottom: `1px solid ${C.border}` }}>
              <span>TVA</span>
              <span style={{ fontFamily: "monospace", fontWeight: 500, color: C.bodyText }}>
                {formatNumber(data.tvaAmount, "fr", 0, 2)} DA
              </span>
            </div>
            {/* Timbre Fiscal */}
            {data.isOfficial && data.paymentMethod === "cash" && data.timbreFiscal > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 18px", fontSize: "13px", color: C.label, borderBottom: `1px solid ${C.border}` }}>
                <span>Timbre Fiscal (1%)</span>
                <span style={{ fontFamily: "monospace", fontWeight: 500, color: C.bodyText }}>
                  {formatNumber(data.timbreFiscal, "fr", 0, 2)} DA
                </span>
              </div>
            )}
            {/* Grand Total — accent treatment */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 18px",
                background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navySoft} 100%)`,
                color: "#ffffff",
                borderRadius: "0 0 10px 10px",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "0.04em" }}>TOTAL TTC</span>
              <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "20px", letterSpacing: "-0.01em" }}>
                {formatNumber(data.totalAmount, "fr", 0, 2)}
                <span style={{ fontSize: "13px", fontWeight: 400, marginLeft: "4px", opacity: 0.7 }}>DA</span>
              </span>
            </div>
            {/* Montant payé */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 18px",
                background: C.emeraldSoft,
                fontSize: "13px",
                color: "#065f46",
                borderTop: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <span style={{ fontWeight: 500 }}>Montant payé</span>
              <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                {formatNumber(data.amountPaid, "fr", 0, 2)} DA
              </span>
            </div>
            {/* Reste dû */}
            {data.remainingDebt > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 18px",
                  background: "rgba(239,68,68,0.07)",
                  fontSize: "13px",
                  color: "#991b1b",
                  borderTop: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <span style={{ fontWeight: 500 }}>Reste dû</span>
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                  {formatNumber(data.remainingDebt, "fr", 0, 2)} DA
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ AMOUNT IN WORDS ═══════════════════════════════════════════════════════ */}
      <div style={{ padding: "0 40px 28px" }}>
        <div
          style={{
            background: "linear-gradient(90deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.02) 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderLeft: `3px solid ${C.emerald}`,
            borderRadius: "8px",
            padding: "12px 18px",
            fontSize: "12.5px",
            color: "#064e3b",
          }}
        >
          <span style={{ fontWeight: 700, marginRight: "6px" }}>Arrêté la présente facture à la somme de :</span>
          <span style={{ fontStyle: "italic" }}>
            {formatAmountInWords(data.totalAmount, "Dinars Algériens")}
          </span>
        </div>
      </div>

      {/* ══ NOTES ═════════════════════════════════════════════════════════════════ */}
      {data.notes && (
        <div style={{ padding: "0 40px 28px" }}>
          <div
            style={{
              background: "#f8fafc",
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              padding: "12px 18px",
              fontSize: "13px",
              color: C.label,
            }}
          >
            <span style={{ fontWeight: 700, color: C.bodyText, marginRight: "6px" }}>Notes :</span>
            {data.notes}
          </div>
        </div>
      )}

      {/* ══ SIGNATURE SECTION ═════════════════════════════════════════════════════ */}
      <div style={{ padding: "0 40px 36px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Seller */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "20px",
            borderTop: `3px solid ${C.emerald}`,
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "16px" }}>
            Cachet et Signature du Vendeur
          </div>
          <div style={{ height: "70px", display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", borderBottom: "1px dashed #cbd5e1" }} />
          </div>
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#94a3b8", textAlign: "center" }}>{store.name}</div>
        </div>

        {/* Client */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "20px",
            borderTop: `3px solid ${C.border}`,
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "16px" }}>
            Cachet et Signature du Client
          </div>
          <div style={{ height: "70px", display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", borderBottom: "1px dashed #cbd5e1" }} />
          </div>
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#94a3b8", textAlign: "center" }}>{customer?.name ?? "Client"}</div>
        </div>
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: C.navy,
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
          {store.name} &nbsp;·&nbsp; {store.address}
        </div>
        <div style={{ display: "flex", gap: "20px", fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span><strong style={{ color: "rgba(255,255,255,0.45)" }}>NIF</strong>&nbsp;{store.nif}</span>
          <span><strong style={{ color: "rgba(255,255,255,0.45)" }}>NIS</strong>&nbsp;{store.nis}</span>
          <span><strong style={{ color: "rgba(255,255,255,0.45)" }}>RC</strong>&nbsp;{store.rc}</span>
        </div>
      </div>
      {/* Legal micro-note */}
      <div
        style={{
          background: "#0a1628",
          padding: "7px 40px",
          fontSize: "9.5px",
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.06em",
          textAlign: "center",
        }}
      >
        Document généré électroniquement — Valeur légale conformément à la législation algérienne
      </div>
    </div>
  );
}
