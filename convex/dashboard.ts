import { query } from "./_generated/server";
import { getViewerContext } from "./lib/context";

/**
 * Dashboard aggregate stats — returns real zeros when no data exists.
 * Used by the Overview page instead of hardcoded fake numbers.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    // Guard — return zeros if not authenticated yet
    if (orgId === "loading") {
      return {
        totalRevenue: 0,
        totalProducts: 0,
        todaySales: 0,
        lowStockAlerts: 0,
        revenueChange: 0,
        productsChange: 0,
        salesChange: 0,
      };
    }

    // Products count
    const products = await ctx.db
      .query("products")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const totalProducts = products.length;

    // Low stock alerts
    const lowStockAlerts = products.filter(
      (p) => p.minStockLevel != null && p.stock <= p.minStockLevel
    ).length;

    // Invoices: total revenue + today's sales
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const totalRevenue = invoices
      .filter((inv) => inv.status === "paid" || inv.status === "partial")
      .reduce((sum, inv) => sum + (inv.amountPaid ?? 0), 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();

    const todaySales = invoices
      .filter((inv) => inv._creationTime >= todayMs)
      .reduce((sum, inv) => sum + (inv.amountPaid ?? 0), 0);

    return {
      totalRevenue,
      totalProducts,
      todaySales,
      lowStockAlerts,
      revenueChange: 0,   // Could be wired up later with historical data
      productsChange: 0,
      salesChange: 0,
    };
  },
});
