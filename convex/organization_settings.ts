import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get organization settings for the current organization
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const orgId = identity.orgId || (identity as any).org_id || identity.subject;

    const settings = await ctx.db
      .query("organization_settings")
      .withIndex("by_org")
      .filter((q) => q.eq("orgId", orgId))
      .first();

    return settings || null;
  },
});

/**
 * Update organization settings
 */
export const update = mutation({
  args: {
    defaultCurrency: v.optional(v.string()),
    isMultiCurrencyEnabled: v.optional(v.boolean()),
    defaultTvaRate: v.optional(v.number()),
    invoicePrefix: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const orgId = identity.orgId || (identity as any).org_id || identity.subject;

    const existing = await ctx.db
      .query("organization_settings")
      .withIndex("by_org")
      .filter((q) => q.eq("orgId", orgId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("organization_settings", {
        orgId,
        store_name: "Default Store",
        logo: undefined,
        phone: "",
        email: "",
        nif: "",
        rc: "",
        nis: "",
        n_art: "",
        company_type: "",
        business_activity: { ar: "", fr: "", en: "" },
        company_address: { ar: "", fr: "", en: "" },
        defaultCurrency: args.defaultCurrency || "DZD",
        isMultiCurrencyEnabled: args.isMultiCurrencyEnabled || false,
        defaultTvaRate: args.defaultTvaRate || 19,
        invoicePrefix: args.invoicePrefix || "FACT-2026-",
      });
    }
  },
});
