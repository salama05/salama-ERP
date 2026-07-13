import { query } from "./_generated/server";
import { v } from "convex/values";
import { getViewerContext } from "./lib/context";
import { Doc, Id } from "./_generated/dataModel";

// Helper to get date range for filtering
function getDateRangeMs(daysBack: number): { start: number; end: number } {
  const now = Date.now();
  const start = now - daysBack * 24 * 60 * 60 * 1000;
  return { start, end: now };
}

/**
 * Helper: Fetch all invoice items and their products in bulk for a list of invoices.
 * Avoids N+1 by loading everything in parallel with Promise.all.
 */
async function fetchInvoiceItemsWithProducts(
  ctx: any,
  invoices: Doc<"invoices">[]
): Promise<
  Map<
    string,
    Array<{
      item: Doc<"invoice_items">;
      product: Doc<"products"> | null;
    }>
  >
> {
  if (invoices.length === 0) return new Map();

  // Step 1: Fetch all invoice_items for all invoices in parallel
  const allItemsPerInvoice = await Promise.all(
    invoices.map((invoice) =>
      ctx.db
        .query("invoice_items")
        .withIndex("by_invoice", (q: any) => q.eq("invoiceId", invoice._id))
        .collect()
        .then((items: Doc<"invoice_items">[]) => ({ invoiceId: String(invoice._id), items }))
    )
  );

  // Step 2: Collect all unique product IDs
  const uniqueProductIds = new Set<string>();
  for (const { items } of allItemsPerInvoice) {
    for (const item of items) {
      uniqueProductIds.add(String(item.productId));
    }
  }

  // Step 3: Fetch all products in parallel
  const productEntries = await Promise.all(
    [...uniqueProductIds].map(async (productIdStr) => {
      const product = await ctx.db.get(productIdStr as Id<"products">);
      return [productIdStr, product] as [string, Doc<"products"> | null];
    })
  );
  const productMap = new Map<string, Doc<"products"> | null>(productEntries);

  // Step 4: Build result map keyed by invoiceId
  const result = new Map<
    string,
    Array<{ item: Doc<"invoice_items">; product: Doc<"products"> | null }>
  >();

  for (const { invoiceId, items } of allItemsPerInvoice) {
    result.set(
      invoiceId,
      items.map((item: any) => ({
        item,
        product: productMap.get(String(item.productId)) ?? null,
      }))
    );
  }

  return result;
}

export const getRevenueSummary = query({
  args: {
    daysBack: v.number(), // 1 for today, 7 for last week, 30 for last month
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;
    const { start, end } = getDateRangeMs(args.daysBack);

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredInvoices = invoices.filter(
      (inv: Doc<"invoices">) =>
        inv._creationTime >= start &&
        inv._creationTime <= end &&
        inv.status !== "draft"
    );

    const totalRevenue = filteredInvoices.reduce(
      (sum: number, inv: Doc<"invoices">) => sum + inv.amountPaid,
      0
    );
    const totalTVA = filteredInvoices.reduce(
      (sum: number, inv: Doc<"invoices">) => sum + inv.tvaAmount,
      0
    );
    const totalTimbreFiscal = filteredInvoices.reduce(
      (sum: number, inv: Doc<"invoices">) => sum + inv.timbreFiscal,
      0
    );
    const invoiceCount = filteredInvoices.length;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      totalTimbreFiscal: Math.round(totalTimbreFiscal * 100) / 100,
      invoiceCount,
      period: `Last ${args.daysBack} days`,
    };
  },
});

export const getNetProfit = query({
  args: {
    daysBack: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;
    const { start, end } = getDateRangeMs(args.daysBack);

    // Fetch invoices
    const allInvoices: Doc<"invoices">[] = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredInvoices = allInvoices.filter(
      (inv) =>
        inv._creationTime >= start &&
        inv._creationTime <= end &&
        inv.status !== "draft"
    );

    // Bulk-fetch all items + products — no N+1
    const invoiceItemsMap = await fetchInvoiceItemsWithProducts(ctx, filteredInvoices);

    let totalRevenue = 0;
    let totalCogs = 0;

    for (const invoice of filteredInvoices) {
      totalRevenue += invoice.amountPaid;
      const entries = invoiceItemsMap.get(String(invoice._id)) ?? [];
      for (const { item, product } of entries) {
        const costPrice = product?.costPrice ?? 0;
        totalCogs += costPrice * item.quantity;
      }
    }

    // Fetch purchase costs in the period
    const allPurchases: Doc<"purchases">[] = await ctx.db
      .query("purchases")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredPurchases = allPurchases.filter(
      (purchase) =>
        purchase._creationTime >= start &&
        purchase._creationTime <= end &&
        purchase.status !== "draft"
    );

    const totalPurchaseCosts = filteredPurchases.reduce(
      (sum, purchase) => sum + purchase.totalCost,
      0
    );

    const totalProfit = totalRevenue - totalCogs - totalPurchaseCosts;

    return {
      netProfit: Math.round(totalProfit * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCogs: Math.round(totalCogs * 100) / 100,
      totalPurchaseCosts: Math.round(totalPurchaseCosts * 100) / 100,
      period: `Last ${args.daysBack} days`,
    };
  },
});

export const getTaxLiability = query({
  args: {
    daysBack: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;
    const { start, end } = getDateRangeMs(args.daysBack);

    const invoices: Doc<"invoices">[] = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredInvoices = invoices.filter(
      (inv) =>
        inv._creationTime >= start &&
        inv._creationTime <= end &&
        inv.status !== "draft"
    );

    const totalTVA = filteredInvoices.reduce(
      (sum, inv) => sum + inv.tvaAmount,
      0
    );
    const totalTimbreFiscal = filteredInvoices.reduce(
      (sum, inv) => sum + inv.timbreFiscal,
      0
    );
    const totalTaxLiability = totalTVA + totalTimbreFiscal;

    return {
      totalTVA: Math.round(totalTVA * 100) / 100,
      totalTimbreFiscal: Math.round(totalTimbreFiscal * 100) / 100,
      totalTaxLiability: Math.round(totalTaxLiability * 100) / 100,
      period: `Last ${args.daysBack} days`,
    };
  },
});

export const getTopSellingProducts = query({
  args: {
    daysBack: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;
    const { start, end } = getDateRangeMs(args.daysBack);

    const allInvoices: Doc<"invoices">[] = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredInvoices = allInvoices.filter(
      (inv) =>
        inv._creationTime >= start &&
        inv._creationTime <= end &&
        inv.status !== "draft"
    );

    // Bulk-fetch all items + products — no N+1
    const invoiceItemsMap = await fetchInvoiceItemsWithProducts(ctx, filteredInvoices);

    const productSales: Record<
      string,
      { id: string; quantity: number; revenue: number; name: string }
    > = {};

    for (const invoice of filteredInvoices) {
      const entries = invoiceItemsMap.get(String(invoice._id)) ?? [];
      for (const { item, product } of entries) {
        if (!product) continue;
        const productId = String(item.productId);
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            quantity: 0,
            revenue: 0,
            name: product.name,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.itemTotal;
      }
    }

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, args.limit);
  },
});

export const getDebtOverview = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const customers: Doc<"customers">[] = await ctx.db
      .query("customers")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
    const debtorsCount = customers.filter((c) => c.totalDebt > 0).length;
    const averageDebt = debtorsCount > 0 ? totalDebt / debtorsCount : 0;

    return {
      totalDebt: Math.round(totalDebt * 100) / 100,
      debtorsCount,
      averageDebt: Math.round(averageDebt * 100) / 100,
    };
  },
});

export const getTopDebtors = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const customers: Doc<"customers">[] = await ctx.db
      .query("customers")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    return customers
      .filter((c) => c.totalDebt > 0)
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, args.limit)
      .map((c) => ({
        id: String(c._id),
        name: c.name,
        debt: Math.round(c.totalDebt * 100) / 100,
        phone: c.phone,
      }));
  },
});

export const getLowStockProducts = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const products: Doc<"products">[] = await ctx.db
      .query("products")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    return products
      .filter((p) => {
        const minLevel = p.minStockLevel ?? 10;
        return p.stock <= minLevel;
      })
      .sort((a, b) => a.stock - b.stock)
      .map((p) => ({
        id: String(p._id),
        name: p.name,
        stock: p.stock,
        minLevel: p.minStockLevel ?? 10,
        price: p.price,
        sku: p.sku,
      }));
  },
});

export const getSalesTrendData = query({
  args: {
    daysBack: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;
    const { start, end } = getDateRangeMs(args.daysBack);

    const allInvoices: Doc<"invoices">[] = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredInvoices = allInvoices.filter(
      (inv) =>
        inv._creationTime >= start &&
        inv._creationTime <= end &&
        inv.status !== "draft"
    );

    // Bulk-fetch all items + products — no N+1
    const invoiceItemsMap = await fetchInvoiceItemsWithProducts(ctx, filteredInvoices);

    const dailyData: Record<
      string,
      { date: string; sales: number; profit: number; invoices: number }
    > = {};

    for (const invoice of filteredInvoices) {
      const date = new Date(invoice._creationTime);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, sales: 0, profit: 0, invoices: 0 };
      }

      dailyData[dateKey].sales += invoice.amountPaid;
      dailyData[dateKey].invoices += 1;

      const entries = invoiceItemsMap.get(String(invoice._id)) ?? [];
      for (const { item, product } of entries) {
        const costPrice = product?.costPrice ?? 0;
        const profit = (item.unitPrice - costPrice) * item.quantity;
        dailyData[dateKey].profit += profit;
      }
    }

    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => ({
        ...d,
        sales: Math.round(d.sales * 100) / 100,
        profit: Math.round(d.profit * 100) / 100,
      }));
  },
});

/**
 * getDashboardMetrics — Fetches all dashboard KPIs in a single query.
 * Replaced the broken ctx.runQuery pattern with direct logic calls.
 */
export const getDashboardMetrics = query({
  args: {
    daysBack: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;
    const { start, end } = getDateRangeMs(args.daysBack);

    // --- Invoices ---
    const allInvoices: Doc<"invoices">[] = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredInvoices = allInvoices.filter(
      (inv) =>
        inv._creationTime >= start &&
        inv._creationTime <= end &&
        inv.status !== "draft"
    );

    // Revenue summary
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalTVA = filteredInvoices.reduce((sum, inv) => sum + inv.tvaAmount, 0);
    const totalTimbreFiscal = filteredInvoices.reduce((sum, inv) => sum + inv.timbreFiscal, 0);
    const invoiceCount = filteredInvoices.length;

    // --- Bulk fetch items + products once ---
    const invoiceItemsMap = await fetchInvoiceItemsWithProducts(ctx, filteredInvoices);

    // Net profit COGS
    let totalCogs = 0;
    for (const invoice of filteredInvoices) {
      const entries = invoiceItemsMap.get(String(invoice._id)) ?? [];
      for (const { item, product } of entries) {
        totalCogs += (product?.costPrice ?? 0) * item.quantity;
      }
    }

    // --- Purchases ---
    const allPurchases: Doc<"purchases">[] = await ctx.db
      .query("purchases")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const filteredPurchases = allPurchases.filter(
      (p) =>
        p._creationTime >= start &&
        p._creationTime <= end &&
        p.status !== "draft"
    );
    const totalPurchaseCosts = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const netProfit = totalRevenue - totalCogs - totalPurchaseCosts;

    // --- Debt overview ---
    const customers: Doc<"customers">[] = await ctx.db
      .query("customers")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
    const debtorsCount = customers.filter((c) => c.totalDebt > 0).length;

    // --- Low stock ---
    const products: Doc<"products">[] = await ctx.db
      .query("products")
      .withIndex("by_org", (q: any) => q.eq("orgId", orgId))
      .collect();

    const lowStockCount = products.filter((p) => p.stock <= (p.minStockLevel ?? 10)).length;

    return {
      revenue: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTVA: Math.round(totalTVA * 100) / 100,
        totalTimbreFiscal: Math.round(totalTimbreFiscal * 100) / 100,
        invoiceCount,
        period: `Last ${args.daysBack} days`,
      },
      profit: {
        netProfit: Math.round(netProfit * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCogs: Math.round(totalCogs * 100) / 100,
        totalPurchaseCosts: Math.round(totalPurchaseCosts * 100) / 100,
        period: `Last ${args.daysBack} days`,
      },
      debt: {
        totalDebt: Math.round(totalDebt * 100) / 100,
        debtorsCount,
        averageDebt: Math.round((debtorsCount > 0 ? totalDebt / debtorsCount : 0) * 100) / 100,
      },
      lowStockCount,
    };
  },
});
