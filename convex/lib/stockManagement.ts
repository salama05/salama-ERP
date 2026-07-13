import { MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

export interface StockCheckItem {
  productId: Id<"products">;
  quantity: number;
}

export class InsufficientStockError extends Error {
  constructor(productName: string, available: number, requested: number) {
    super(
      `Stock insuffisant pour ${productName}. Disponible: ${available}, Demandé: ${requested}`
    );
    this.name = "InsufficientStockError";
  }
}

export async function checkAndValidateStock(
  ctx: MutationCtx,
  orgId: string,
  items: StockCheckItem[]
): Promise<Map<Id<"products">, Doc<"products">>> {
  const productMap = new Map<Id<"products">, Doc<"products">>();

  for (const item of items) {
    const product = await ctx.db.get(item.productId);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.orgId !== orgId) {
      throw new Error(
        `Unauthorized: Product does not belong to this organization`
      );
    }

    if (product.stock < item.quantity) {
      throw new InsufficientStockError(
        product.name,
        product.stock,
        item.quantity
      );
    }

    productMap.set(item.productId, product);
  }

  return productMap;
}

export async function decrementProductStock(
  ctx: MutationCtx,
  productId: Id<"products">,
  quantity: number
): Promise<void> {
  const product = await ctx.db.get(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const newStock = product.stock - quantity;
  if (newStock < 0) {
    throw new InsufficientStockError(product.name, product.stock, quantity);
  }

  await ctx.db.patch(productId, {
    stock: newStock,
  });
}

export async function recordStockMovement(
  ctx: MutationCtx,
  orgId: string,
  productId: Id<"products">,
  type: "SALE" | "RESTOCK" | "ADJUSTMENT",
  quantity: number,
  invoiceId?: Id<"invoices">,
  notes?: string
): Promise<void> {
  await ctx.db.insert("stock_movements", {
    orgId,
    productId,
    type,
    quantity: type === "SALE" ? -quantity : quantity, // Store negative for sales
    invoiceId,
    notes,
  });
}

export async function getProductStockInfo(
  ctx: MutationCtx,
  productId: Id<"products">
): Promise<{ current: number; minLevel?: number; isLow: boolean }> {
  const product = await ctx.db.get(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const minLevel = product.minStockLevel || 10;
  const isLow = product.stock <= minLevel;

  return {
    current: product.stock,
    minLevel,
    isLow,
  };
}

export async function getStockMovementHistory(
  ctx: MutationCtx,
  orgId: string,
  productId: Id<"products">,
  limit: number = 20
): Promise<
  Array<{
    date: number;
    type: string;
    quantity: number;
    invoiceId?: string;
    notes?: string;
  }>
> {
  const movements = await ctx.db
    .query("stock_movements")
    .withIndex("by_product", (q) =>
      q.eq("orgId", orgId).eq("productId", productId)
    )
    .order("desc")
    .take(limit);

  return movements.map((m) => ({
    date: m._creationTime,
    type: m.type,
    quantity: m.quantity,
    invoiceId: m.invoiceId ? String(m.invoiceId) : undefined,
    notes: m.notes,
  }));
}
