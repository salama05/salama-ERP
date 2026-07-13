import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getViewerContext } from "./lib/context";
import { requirePermission } from "./lib/auth";
import { logAudit } from "./lib/audit";

export const listProducts = query({
  args: {
    includeCostPrice: v.optional(v.boolean()), // For OWNER only
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId, role } = viewer;

    const products = await ctx.db
      .query("products")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .take(100);

    // If STAFF is requesting, hide cost price
    if (role === "STAFF") {
      return products.map((p) => ({
        ...p,
        costPrice: undefined, // Hide from STAFF
      }));
    }

    return products;
  },
});

export const getProduct = query({
  args: {
    productId: v.id("products"),
    includeCostPrice: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId, role } = viewer;

    const product = await ctx.db.get(args.productId);
    if (!product || product.orgId !== orgId) {
      throw new Error("Product not found or unauthorized");
    }

    // If STAFF is requesting, hide cost price
    if (role === "STAFF") {
      return {
        ...product,
        costPrice: undefined, // Hide from STAFF
      };
    }

    return product;
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    skuOrBarcode: v.optional(v.string()),
    buyPrice: v.number(),
    sellPrice: v.number(),
    initialStock: v.number(),
    minStockLevel: v.number(),
    taxRate: v.optional(v.number()),
    expiryDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "products.create");

    const normalizedSku = args.skuOrBarcode?.trim();

    const productId = await ctx.db.insert("products", {
      orgId,
      name: args.name.trim(),
      description: undefined,
      price: args.sellPrice,
      costPrice: args.buyPrice,
      sku: normalizedSku,
      barcode: normalizedSku,
      stock: args.initialStock,
      minStockLevel: args.minStockLevel,
      taxRate: args.taxRate,
      images: undefined,
      metadata: undefined,
      expiryDate: args.expiryDate,
    });

    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "create",
      entityType: "Product",
      entityId: productId,
      entityLabel: args.name.trim(),
      changes: [
        { field: "price", oldValue: null, newValue: args.sellPrice },
        { field: "costPrice", oldValue: null, newValue: args.buyPrice },
        { field: "stock", oldValue: null, newValue: args.initialStock },
      ],
    });

    return { productId };
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    skuOrBarcode: v.optional(v.string()),
    buyPrice: v.number(),
    sellPrice: v.number(),
    initialStock: v.number(),
    minStockLevel: v.number(),
    taxRate: v.optional(v.number()),
    expiryDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "products.editPrice");

    const product = await ctx.db.get(args.productId);
    if (!product || product.orgId !== orgId) {
      throw new Error("Product not found or unauthorized");
    }

    const normalizedSku = args.skuOrBarcode?.trim();

    const oldPrice = product.price;
    const oldCostPrice = product.costPrice;

    await ctx.db.patch(args.productId, {
      name: args.name.trim(),
      price: args.sellPrice,
      costPrice: args.buyPrice,
      sku: normalizedSku,
      barcode: normalizedSku,
      stock: args.initialStock,
      minStockLevel: args.minStockLevel,
      taxRate: args.taxRate,
      expiryDate: args.expiryDate,
    });

    if (oldPrice !== args.sellPrice || oldCostPrice !== args.buyPrice) {
      await logAudit(ctx, {
        orgId,
        userId: user.tokenIdentifier,
        userName: user.name || user.email || "Unknown User",
        action: "update",
        entityType: "Product",
        entityId: args.productId,
        entityLabel: args.name.trim(),
        changes: [
          { field: "price", oldValue: oldPrice, newValue: args.sellPrice },
          { field: "costPrice", oldValue: oldCostPrice, newValue: args.buyPrice },
        ],
      });
    }

    return { success: true };
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const { user, orgId } = await requirePermission(ctx, "products.create"); // same level as create

    const product = await ctx.db.get(args.productId);
    if (!product || product.orgId !== orgId) {
      throw new Error("Product not found or unauthorized");
    }

    await ctx.db.delete(args.productId);
    
    await logAudit(ctx, {
      orgId,
      userId: user.tokenIdentifier,
      userName: user.name || user.email || "Unknown User",
      action: "delete",
      entityType: "Product",
      entityId: args.productId,
      entityLabel: product.name,
    });
    
    return { success: true };
  },
});

