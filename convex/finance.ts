import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getViewerContext, requireOwnerRole } from "./lib/context";

export const createExpense = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await requireOwnerRole(ctx);
    const { orgId } = viewer;

    const expenseId = await ctx.db.insert("expenses", {
      orgId,
      amount: args.amount,
      category: args.category,
      description: args.description,
      date: args.date,
    });

    return { expenseId };
  },
});

export const listExpenses = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    return await ctx.db
      .query("expenses")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

export const getLedger = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    // 1. Fetch Invoices (Income)
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    // 2. Fetch Purchases (Expenses/Outflow)
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    // 3. Fetch General Expenses (Expenses/Outflow)
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    type LedgerEntry = {
      id: string;
      date: string;
      type: "income" | "expense";
      source: "invoice" | "purchase" | "general_expense";
      referenceNumber: string;
      description: string;
      amount: number;
    };

    const ledger: LedgerEntry[] = [];

    // Map Invoices (only count if they have been paid at least partially)
    invoices.forEach((inv) => {
      if (inv.amountPaid > 0) {
        ledger.push({
          id: inv._id,
          date: inv._creationTime ? new Date(inv._creationTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          type: "income",
          source: "invoice",
          referenceNumber: inv.invoiceNumber,
          description: `Invoice payment received`,
          amount: inv.amountPaid,
        });
      }
    });

    // Map Purchases (only count if we paid something)
    purchases.forEach((p) => {
      const paid = p.amountPaid || 0;
      if (paid > 0) {
        ledger.push({
          id: p._id,
          date: p._creationTime ? new Date(p._creationTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          type: "expense",
          source: "purchase",
          referenceNumber: p.purchaseNumber,
          description: `Purchase order payment`,
          amount: paid,
        });
      }
    });

    // Map General Expenses
    expenses.forEach((e) => {
      ledger.push({
        id: e._id,
        date: e.date,
        type: "expense",
        source: "general_expense",
        referenceNumber: `EXP-${e.category.substring(0, 3).toUpperCase()}`,
        description: e.description || `Expense: ${e.category}`,
        amount: e.amount,
      });
    });

    // Sort by date descending
    return ledger.sort((a, b) => b.date.localeCompare(a.date));
  },
});
