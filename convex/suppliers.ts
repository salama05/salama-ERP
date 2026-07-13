import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getViewerContext, requireOwnerRole } from "./lib/context";

export const listSuppliers = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    return await ctx.db
      .query("suppliers")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();
  },
});

export const getSupplier = query({
  args: { supplierId: v.id("suppliers") },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const supplier = await ctx.db.get(args.supplierId);
    if (!supplier || supplier.orgId !== orgId) {
      throw new Error("Supplier not found or unauthorized");
    }

    return supplier;
  },
});

export const createSupplier = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    nif: v.optional(v.string()),
    rc: v.optional(v.string()),
    address: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireOwnerRole(ctx);
    const { orgId } = viewer;

    const supplierId = await ctx.db.insert("suppliers", {
      orgId,
      name: args.name,
      phone: args.phone,
      email: args.email,
      nif: args.nif,
      rc: args.rc,
      address: args.address,
      paymentTerms: args.paymentTerms,
      status: "active",
    });

    return { supplierId };
  },
});

export const updateSupplier = mutation({
  args: {
    supplierId: v.id("suppliers"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    nif: v.optional(v.string()),
    rc: v.optional(v.string()),
    address: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const viewer = await requireOwnerRole(ctx);
    const { orgId } = viewer;

    const supplier = await ctx.db.get(args.supplierId);
    if (!supplier || supplier.orgId !== orgId) {
      throw new Error("Supplier not found or unauthorized");
    }

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.email !== undefined) updates.email = args.email;
    if (args.nif !== undefined) updates.nif = args.nif;
    if (args.rc !== undefined) updates.rc = args.rc;
    if (args.address !== undefined) updates.address = args.address;
    if (args.paymentTerms !== undefined) updates.paymentTerms = args.paymentTerms;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.supplierId, updates);
    return { success: true };
  },
});
