import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { getViewerContext, requireOwnerRole } from "./lib/context";
import { requirePermission } from "./lib/auth";
import { logAudit } from "./lib/audit";
import {
  calculateInvoiceTotals,
  calculateItemTotals,
} from "./lib/taxCalculator";
import {
  checkAndValidateStock,
  decrementProductStock,
  recordStockMovement,
  InsufficientStockError,
} from "./lib/stockManagement";

export type InvoiceLineItem = {
  productId: Id<"products">;
  quantity: number;
};

export type CreateInvoiceInput = {
  customerId: Id<"customers">;
  items: InvoiceLineItem[];
  isOfficial: boolean;
  paymentMethod: "cash" | "credit" | "check";
  amountPaid?: number; // For partial payments
  notes?: string;
};

async function getNextInvoiceNumber(
  ctx: MutationCtx,
  orgId: string,
  isOfficial: boolean
): Promise<string> {
  const invoiceType = isOfficial ? "official" : "informal";

  // Get or create counter for this org and invoice type
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_org_and_type", (q) =>
      q.eq("orgId", orgId).eq("counterType", `invoice_${invoiceType}`)
    )
    .unique();

  let nextNumber: number;

  if (counter) {
    nextNumber = counter.currentNumber + 1;
    await ctx.db.patch(counter._id, { currentNumber: nextNumber });
  } else {
    nextNumber = 1;
    await ctx.db.insert("counters", {
      orgId,
      counterType: `invoice_${invoiceType}`,
      currentNumber: nextNumber,
    });
  }

  // Fetch organization settings for prefix
  const settings = await ctx.db
    .query("organization_settings")
    .withIndex("by_org", (q) => q.eq("orgId", orgId))
    .unique();

  // Generate invoice number format: FACT-2026-001 or BON-2026-001
  const basePrefix = isOfficial ? "FACT" : "BON";
  const customPrefix = settings?.invoicePrefix ? settings.invoicePrefix.replace(/-$/, '') : basePrefix;
  const year = new Date().getFullYear();
  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `${customPrefix}-${year}-${paddedNumber}`;
}

async function validateAndFetchItems(
  ctx: MutationCtx,
  orgId: string,
  items: InvoiceLineItem[]
): Promise<Map<Id<"products">, Doc<"products">>> {
  // Use stock management helper for validation
  return await checkAndValidateStock(ctx, orgId, items);
}

function calculateInvoiceSubtotal(
  items: InvoiceLineItem[],
  productMap: Map<Id<"products">, Doc<"products">>
): number {
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) throw new Error("Product not found in map");

    subtotal += item.quantity * product.price;
  }

  return Math.round(subtotal * 100) / 100;
}

function getAverageTaxRate(
  items: InvoiceLineItem[],
  productMap: Map<Id<"products">, Doc<"products">>
): number {
  let totalTaxAmount = 0;
  let totalSubtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) throw new Error("Product not found in map");

    const itemSubtotal = item.quantity * product.price;
    const taxRate = product.taxRate || 19; // Default to 19% if not set
    const taxAmount = (itemSubtotal * taxRate) / 100;

    totalSubtotal += itemSubtotal;
    totalTaxAmount += taxAmount;
  }

  // Return effective average tax rate
  return totalSubtotal > 0
    ? Math.round((totalTaxAmount / totalSubtotal) * 10000) / 100
    : 19;
}

export const createInvoice = mutation({
  args: {
    customerId: v.id("customers"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    isOfficial: v.boolean(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("credit"),
      v.literal("check")
    ),
    amountPaid: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // We still call getViewerContext for backward compatibility of personal workspaces if needed,
    // but the actual permission check happens via requirePermission.
    const { user, orgId } = await requirePermission(ctx, "invoices.create");

    // Validate customer belongs to org
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.orgId !== orgId) {
      throw new Error("Unauthorized: Customer not found or does not belong to org");
    }

    // Validate and fetch products
    const productMap = await validateAndFetchItems(ctx, orgId, args.items);

    if (args.items.length === 0) {
      throw new Error("Invoice must have at least one item");
    }

    // Calculate subtotal
    const subtotal = calculateInvoiceSubtotal(args.items, productMap);

    // Calculate average tax rate for invoice-level calculation
    const avgTaxRate = getAverageTaxRate(args.items, productMap);

    // Calculate invoice totals
    const { tvaAmount, timbreFiscal, totalAmount } = calculateInvoiceTotals(
      subtotal,
      avgTaxRate,
      args.isOfficial,
      args.paymentMethod
    );

    // Generate unique invoice number
    const invoiceNumber = await getNextInvoiceNumber(ctx, orgId, args.isOfficial);

    // Determine invoice status and remaining debt
    const amountPaid = args.amountPaid || (args.paymentMethod === "cash" ? totalAmount : 0);
    const remainingDebt = Math.max(0, totalAmount - amountPaid);
    const status: "draft" | "issued" | "paid" | "partial" | "void" =
      remainingDebt === 0 ? "paid" : remainingDebt === totalAmount ? "draft" : "partial";

    // Create invoice
    const invoiceId = await ctx.db.insert("invoices", {
      orgId,
      customerId: args.customerId,
      invoiceNumber,
      isOfficial: args.isOfficial,
      paymentMethod: args.paymentMethod,
      subtotal,
      tvaAmount,
      timbreFiscal,
      totalAmount,
      amountPaid,
      remainingDebt,
      status,
      notes: args.notes,
    });

    // Create invoice line items
    for (const item of args.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error("Product not found in map");

      const taxRate = product.taxRate || 19;
      const { itemSubtotal, itemTvaAmount, itemTotal } = calculateItemTotals(
        item.quantity,
        product.price,
        taxRate
      );

      await ctx.db.insert("invoice_items", {
        invoiceId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        taxRate,
        itemSubtotal,
        itemTvaAmount,
        itemTotal,
      });
    }

    // Update customer debt if payment method is credit or partial payment
    if (args.paymentMethod === "credit" || remainingDebt > 0) {
      const newDebt = customer.totalDebt + remainingDebt;
      await ctx.db.patch(args.customerId, {
        totalDebt: newDebt,
      });
    }

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "create",
      entityType: "invoice",
      entityId: invoiceId,
      entityLabel: invoiceNumber,
      changes: [
        { field: "totalAmount", oldValue: null, newValue: totalAmount },
        { field: "status", oldValue: null, newValue: status },
      ],
    });

    return {
      invoiceId,
      invoiceNumber,
      totalAmount,
      amountPaid,
      remainingDebt,
    };
  },
});

// Query to list all invoices for the organization
export const listInvoices = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .take(100);

    // Fetch customer names for each invoice
    const invoicesWithCustomers = await Promise.all(
      invoices.map(async (invoice) => {
        const customer = await ctx.db.get(invoice.customerId);
        return {
          ...invoice,
          customerName: customer?.name || "Unknown",
        };
      })
    );

    return invoicesWithCustomers;
  },
});

// Query to get a single invoice
export const getInvoice = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice || invoice.orgId !== orgId) {
      throw new Error("Invoice not found or unauthorized");
    }

    // Fetch related customer and items
    const customer = await ctx.db.get(invoice.customerId);
    const items = await ctx.db
      .query("invoice_items")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", invoice._id))
      .collect();

    // Fetch product details for each item
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          productName: product?.name || "Unknown",
        };
      })
    );

    return {
      ...invoice,
      customer,
      items: itemsWithProducts,
    };
  },
});

// Mutation to delete an invoice (OWNER only)
export const deleteInvoice = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const viewer = await requireOwnerRole(ctx);
    const { orgId } = viewer;

    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice || invoice.orgId !== orgId) {
      throw new Error("Invoice not found or unauthorized");
    }

    if (invoice.isOfficial) {
      throw new Error("Official invoices cannot be deleted. Please void them instead.");
    }

    // Get invoice items to reverse stock
    const items = await ctx.db
      .query("invoice_items")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", invoice._id))
      .collect();

    // Reverse stock for each item
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
        });

        // Record stock reversal
        await recordStockMovement(
          ctx,
          orgId,
          item.productId,
          "ADJUSTMENT",
          item.quantity,
          undefined,
          `Stock restored from deleted invoice ${invoice.invoiceNumber}`
        );
      }

      // Delete invoice item
      await ctx.db.delete(item._id);
    }

    // Reverse customer debt if applicable
    if (invoice.remainingDebt > 0 && invoice.customerId) {
      const customer = await ctx.db.get(invoice.customerId);
      if (customer) {
        await ctx.db.patch(invoice.customerId, {
          totalDebt: Math.max(0, customer.totalDebt - invoice.remainingDebt),
        });
      }
    }

    // Delete the invoice
    await ctx.db.delete(invoice._id);

    return {
      success: true,
      invoiceNumber: invoice.invoiceNumber,
      restoredStock: items.length,
    };
  },
});

// Mutation to void an invoice (requires invoices.void permission)
export const voidInvoice = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "invoices.void");

    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice || invoice.orgId !== orgId) {
      throw new Error("Invoice not found or unauthorized");
    }

    if (invoice.status === "void") {
      throw new Error("Invoice is already voided");
    }

    // Get invoice items to reverse stock
    const items = await ctx.db
      .query("invoice_items")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", invoice._id))
      .collect();

    // Reverse stock for each item
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
        });

        // Record stock reversal
        await recordStockMovement(
          ctx,
          orgId,
          item.productId,
          "ADJUSTMENT",
          item.quantity,
          invoice._id,
          `Stock restored from voided invoice ${invoice.invoiceNumber}`
        );
      }
    }

    // Reverse customer debt if applicable
    if (invoice.remainingDebt > 0 && invoice.customerId) {
      const customer = await ctx.db.get(invoice.customerId);
      if (customer) {
        await ctx.db.patch(invoice.customerId, {
          totalDebt: Math.max(0, customer.totalDebt - invoice.remainingDebt),
        });
      }
    }

    const oldStatus = invoice.status;
    const oldDebt = invoice.remainingDebt;

    // Void the invoice
    await ctx.db.patch(invoice._id, {
      status: "void",
      remainingDebt: 0,
      amountPaid: 0,
    });

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "void",
      entityType: "Invoice",
      entityId: invoice._id,
      entityLabel: invoice.invoiceNumber,
      changes: [
        { field: "status", oldValue: oldStatus, newValue: "void" },
        { field: "debtAdjusted", oldValue: oldDebt, newValue: 0 }
      ],
    });

    return {
      success: true,
      invoiceNumber: invoice.invoiceNumber,
      restoredStock: items.length,
    };
  },
});
