// Frontend mirror of Convex tax calculations for real-time preview

export type TaxPreview = {
  subtotal: number;
  tvaAmount: number;
  timbreFiscal: number;
  totalAmount: number;
  averageTaxRate: number;
};

export function calculateTVA(subtotal: number, taxRate: number): number {
  return Math.round((subtotal * taxRate) / 100 * 100) / 100;
}

export function calculateTimbreFiscal(
  invoiceTotal: number,
  isOfficial: boolean,
  paymentMethod: string
): number {
  if (!isOfficial || paymentMethod !== "cash") {
    return 0;
  }

  const timbreRate = 0.01;
  let timbre = Math.round(invoiceTotal * timbreRate * 100) / 100;

  const MIN_TIMBRE = 5;
  const MAX_TIMBRE = 10000;

  if (timbre < MIN_TIMBRE) timbre = MIN_TIMBRE;
  if (timbre > MAX_TIMBRE) timbre = MAX_TIMBRE;

  return timbre;
}

export function calculateTaxPreview(
  items: Array<{ quantity: number; unitPrice: number; taxRate: number }>,
  isOfficial: boolean,
  paymentMethod: string
): TaxPreview {
  let subtotal = 0;
  let totalTaxAmount = 0;

  // Calculate item subtotals and taxes
  for (const item of items) {
    const itemSubtotal = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const itemTax = calculateTVA(itemSubtotal, item.taxRate);

    subtotal += itemSubtotal;
    totalTaxAmount += itemTax;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  totalTaxAmount = Math.round(totalTaxAmount * 100) / 100;

  const amountBeforeTimbre = subtotal + totalTaxAmount;
  const timbreFiscal = calculateTimbreFiscal(
    amountBeforeTimbre,
    isOfficial,
    paymentMethod
  );
  const totalAmount = amountBeforeTimbre + timbreFiscal;

  const averageTaxRate =
    subtotal > 0 ? (totalTaxAmount / subtotal) * 100 : 0;

  return {
    subtotal,
    tvaAmount: totalTaxAmount,
    timbreFiscal,
    totalAmount: Math.round(totalAmount * 100) / 100,
    averageTaxRate: Math.round(averageTaxRate * 100) / 100,
  };
}

import { type Language } from "./i18n";

/**
 * Standardized currency formatting utility
 * Handles Arabic, French, and English number formatting consistently
 */
export function formatCurrency(value: number, language?: Language): string {
  if (language === "ar") {
    return `${new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} د.ج`;
  }
  return new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(value);
}

/**
 * Standardized number formatting utility
 * Handles Arabic, French, and English number formatting consistently
 * @param value - The number to format
 * @param language - The language code ('ar', 'fr', 'en')
 * @param minimumFractionDigits - Minimum decimal places (default: 0)
 * @param maximumFractionDigits - Maximum decimal places (default: 2)
 */
export function formatNumber(
  value: number, 
  language?: Language,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string {
  const locale = language === "ar" ? "fr-DZ" : language === "fr" ? "fr-FR" : "en-US";
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Format percentage with locale-aware decimal separators
 */
export function formatPercentage(value: number, language?: Language): string {
  const locale = language === "ar" ? "fr-DZ" : language === "fr" ? "fr-FR" : "en-US";
  
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}
