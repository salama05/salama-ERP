// Algerian Tax Calculation Helpers

export type TaxCalculationInput = {
  subtotal: number;
  taxRate: number; // 9 or 19
  isOfficial: boolean;
  paymentMethod: "cash" | "credit" | "check";
};

export type TaxCalculationResult = {
  tvaAmount: number;
  timbreFiscal: number;
  totalAmount: number;
};

export function calculateTVA(subtotal: number, taxRate: number): number {
  return Math.round((subtotal * taxRate) / 100 * 100) / 100;
}

export function calculateTimbreFiscal(
  invoiceTotal: number,
  isOfficial: boolean,
  paymentMethod: "cash" | "credit" | "check"
): number {
  if (!isOfficial || paymentMethod !== "cash") {
    return 0;
  }

  // Timbre Fiscal: 1% of invoice total, min 5 DZD, max 10,000 DZD
  const timbreRate = 0.01;
  let timbre = Math.round(invoiceTotal * timbreRate * 100) / 100;

  // Apply min/max caps
  const MIN_TIMBRE = 5;
  const MAX_TIMBRE = 10000;

  if (timbre < MIN_TIMBRE) timbre = MIN_TIMBRE;
  if (timbre > MAX_TIMBRE) timbre = MAX_TIMBRE;

  return timbre;
}

export function calculateInvoiceTotals(
  subtotal: number,
  taxRate: number,
  isOfficial: boolean,
  paymentMethod: "cash" | "credit" | "check"
): TaxCalculationResult {
  const tvaAmount = calculateTVA(subtotal, taxRate);
  const amountBeforeTimbre = subtotal + tvaAmount;
  const timbreFiscal = calculateTimbreFiscal(
    amountBeforeTimbre,
    isOfficial,
    paymentMethod
  );
  const totalAmount = amountBeforeTimbre + timbreFiscal;

  return {
    tvaAmount,
    timbreFiscal,
    totalAmount,
  };
}

export function calculateItemTotals(
  quantity: number,
  unitPrice: number,
  taxRate: number
): {
  itemSubtotal: number;
  itemTvaAmount: number;
  itemTotal: number;
} {
  const itemSubtotal = Math.round(quantity * unitPrice * 100) / 100;
  const itemTvaAmount = calculateTVA(itemSubtotal, taxRate);
  const itemTotal = itemSubtotal + itemTvaAmount;

  return {
    itemSubtotal,
    itemTvaAmount,
    itemTotal,
  };
}
