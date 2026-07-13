import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission, requireUser } from "./lib/auth";

export const getOrganizationSettings = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    // Any authenticated, active user in the org can read the settings
    const { orgId } = await requirePermission(ctx, "settings.manage");
    void orgId; // orgId is pulled from identity; args.orgId is the explicit org to query

    const settings = await ctx.db
      .query("organization_settings")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .unique();

    return settings;
  },
});

export const updateOrganizationSettings = mutation({
  args: {
    orgId: v.string(),
    store_name: v.string(),
    logo: v.optional(v.string()),
    phone: v.string(),
    email: v.union(v.string(), v.literal("")),
    nif: v.string(),
    rc: v.string(),
    nis: v.string(),
    n_art: v.string(),
    company_type: v.string(),
    business_activity: v.object({
      ar: v.string(),
      fr: v.string(),
      en: v.string(),
    }),
    company_address: v.object({
      ar: v.string(),
      fr: v.string(),
      en: v.string(),
    }),
    defaultCurrency: v.string(),
    isMultiCurrencyEnabled: v.boolean(),
    defaultTvaRate: v.number(),
    invoicePrefix: v.string(),
  },
  handler: async (ctx, args) => {
    // Requires settings.manage permission (admin, OWNER, or custom role with permission)
    const { user } = await requirePermission(ctx, "settings.manage");

    const existingSettings = await ctx.db
      .query("organization_settings")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .unique();

    const settingsData = {
      store_name: args.store_name,
      logo: args.logo,
      phone: args.phone,
      email: args.email,
      nif: args.nif,
      rc: args.rc,
      nis: args.nis,
      n_art: args.n_art,
      company_type: args.company_type,
      business_activity: args.business_activity,
      company_address: args.company_address,
      defaultCurrency: args.defaultCurrency,
      isMultiCurrencyEnabled: args.isMultiCurrencyEnabled,
      defaultTvaRate: args.defaultTvaRate,
      invoicePrefix: args.invoicePrefix,
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, settingsData);
    } else {
      await ctx.db.insert("organization_settings", {
        orgId: args.orgId,
        ...settingsData,
      });
    }

    // Audit log
    await ctx.db.insert("audit_logs", {
      orgId: args.orgId,
      userId: user.tokenIdentifier,
      userName: user.name ?? user.email ?? "Unknown User",
      action: "update",
      entityType: "organization_settings",
      entityId: args.orgId,
      entityLabel: "Organization Settings",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

