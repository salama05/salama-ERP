import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getViewerContext, requireOwnerRole } from "./lib/context";

export const listCustomers = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    return await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .take(100);
  },
});

export const getCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.orgId !== orgId) {
      throw new Error("Customer not found or unauthorized");
    }

    return customer;
  },
});

export const createCustomer = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    creditLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireOwnerRole(ctx);
    const { orgId } = viewer;

    const customerId = await ctx.db.insert("customers", {
      orgId,
      name: args.name.trim(),
      email: args.email?.trim(),
      phone: args.phone?.trim(),
      address: args.address?.trim(),
      nif: undefined,
      rc: undefined,
      totalDebt: 0,
      creditLimit: args.creditLimit,
      status: "active",
    });

    return { customerId };
  },
});
