import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { getViewerContext, requireOwnerRole } from "./lib/context";

export type PurchaseLineItem = {
  productId: Id<"products">;
  quantity: number;
  unitCost: number;
  expiryDate?: number;
};

export type CreatePurchaseInput = {
  supplierId: Id<"suppliers">;
  items: PurchaseLineItem[];
  status: "draft" | "received" | "paid";
  paymentMethod?: "cash" | "credit" | "check";
  amountPaid?: number;
  notes?: string;
};

async function getNextPurchaseNumber(
  ctx: MutationCtx,
  orgId: string
): Promise<string> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_org_and_type", (q) =>
      q.eq("orgId", orgId).eq("counterType", "purchase")
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
      counterType: "purchase",
      currentNumber: nextNumber,
    });
  }

  const year = new Date().getFullYear();
  const paddedNumber = String(nextNumber).padStart(3, "0");
  return `ACH-${year}-${paddedNumber}`;
}

async function validateAndFetchProducts(
  ctx: MutationCtx,
  orgId: string,
  items: PurchaseLineItem[]
): Promise<Map<Id<"products">, Doc<"products">>> {
  const productMap = new Map<Id<"products">, Doc<"products">>();

  for (const item of items) {
    const product = await ctx.db.get(item.productId);
    if (!product || product.orgId !== orgId) {
      throw new Error(`Product not found or unauthorized: ${item.productId}`);
    }
    productMap.set(item.productId, product);
  }

  return productMap;
}

function calculatePurchaseTotals(items: PurchaseLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
}

export const createPurchase = mutation({
  args: {
    supplierId: v.id("suppliers"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        unitCost: v.number(),
        expiryDate: v.optional(v.number()),
      })
    ),
    status: v.union(v.literal("draft"), v.literal("received"), v.literal("paid")),
    paymentMethod: v.optional(
      v.union(v.literal("cash"), v.literal("credit"), v.literal("check"))
    ),
    amountPaid: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireOwnerRole(ctx);
    const { orgId } = viewer;

    // Validate supplier belongs to org
    const supplier = await ctx.db.get(args.supplierId);
    if (!supplier || supplier.orgId !== orgId) {
      throw new Error("Unauthorized: Supplier not found or does not belong to org");
    }

    // Validate and fetch products
    const productMap = await validateAndFetchProducts(ctx, orgId, args.items);

    if (args.items.length === 0) {
      throw new Error("Purchase must have at least one item");
    }

    // Calculate total cost
    const totalCost = calculatePurchaseTotals(args.items);

    // Generate unique purchase number
    const purchaseNumber = await getNextPurchaseNumber(ctx, orgId);

    // Create purchase
    const purchaseId = await ctx.db.insert("purchases", {
      orgId,
      supplierId: args.supplierId,
      purchaseNumber,
      totalCost,
      status: args.status,
      paymentMethod: args.paymentMethod,
      amountPaid: args.amountPaid || 0,
      notes: args.notes,
    });

    // Create purchase line items and update product stock & buyPrice
    for (const item of args.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error("Product not found in map");

      // Add purchase item record
      await ctx.db.insert("purchase_items", {
        purchaseId,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        itemTotal: item.quantity * item.unitCost,
        expiryDate: item.expiryDate,
      });

      // Update product stock and buyPrice
      const newStock = product.stock + item.quantity;
      const newBuyPrice = item.unitCost;

      await ctx.db.patch(item.productId, {
        stock: newStock,
        costPrice: newBuyPrice,
      });

      // Record stock movement
      await ctx.db.insert("stock_movements", {
        orgId,
        productId: item.productId,
        type: "RESTOCK",
        quantity: item.quantity,
        notes: `Purchase order ${purchaseNumber} from ${supplier.name}`,
      });
    }

    return {
      purchaseId,
      purchaseNumber,
      totalCost,
    };
  },
});

export const listPurchases = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();

    // Fetch supplier names and products for each purchase
    const purchasesWithDetails = await Promise.all(
      purchases.map(async (purchase) => {
        const supplier = await ctx.db.get(purchase.supplierId);
        
        const items = await ctx.db
          .query("purchase_items")
          .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
          .collect();
        
        console.log(`Purchase ${purchase._id} has ${items.length} items`);
        
        const productNames = await Promise.all(
          items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            console.log(`Item product ID: ${item.productId}, Product:`, product);
            return product?.name || "Unknown";
          })
        );

        console.log(`Product names for purchase ${purchase._id}:`, productNames);

        return {
          ...purchase,
          supplierName: supplier?.name || "Unknown",
          productNames,
        };
      })
    );

    return purchasesWithDetails;
  },
});

export const getPurchase = query({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;

    const purchase = await ctx.db.get(args.purchaseId);
    if (!purchase || purchase.orgId !== orgId) {
      throw new Error("Purchase not found or unauthorized");
    }

    // Fetch supplier and items
    const supplier = await ctx.db.get(purchase.supplierId);
    const items = await ctx.db
      .query("purchase_items")
      .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
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
      ...purchase,
      supplier,
      items: itemsWithProducts,
    };
  },
});

export const deletePurchase = mutation({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, args) => {
    const viewer = await requireOwnerRole(ctx);
    const { orgId } = viewer;

    const purchase = await ctx.db.get(args.purchaseId);
    if (!purchase || purchase.orgId !== orgId) {
      throw new Error("Purchase not found or unauthorized");
    }

    // Get purchase items to reverse stock
    const items = await ctx.db
      .query("purchase_items")
      .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
      .collect();

    // Reverse stock for each item
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: Math.max(0, product.stock - item.quantity),
        });

        // Record stock reversal
        await ctx.db.insert("stock_movements", {
          orgId,
          productId: item.productId,
          type: "ADJUSTMENT",
          quantity: -item.quantity,
          notes: `Stock reversed from deleted purchase ${purchase.purchaseNumber}`,
        });
      }

      // Delete purchase item
      await ctx.db.delete(item._id);
    }

    // Delete the purchase
    await ctx.db.delete(purchase._id);

    return {
      success: true,
      purchaseNumber: purchase.purchaseNumber,
    };
  },
});
