import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a notification for a specific user or role
 */
export const createNotification = mutation({
  args: {
    orgId: v.string(),
    userId: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("accountant"), v.literal("sales_manager"), v.literal("inventory_manager"))),
    type: v.union(
      v.literal("low_stock"),
      v.literal("product_expiry"),
      v.literal("invoice_overdue"),
      v.literal("supplier_overdue")
    ),
    message: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      orgId: args.orgId,
      userId: args.userId,
      role: args.role,
      type: args.type,
      message: args.message,
      entityType: args.entityType,
      entityId: args.entityId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Mark a notification as read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

/**
 * Mark all notifications for a user as read
 */
export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user")
      .collect();

    const userNotifications = notifications.filter((n) => n.userId === args.userId && !n.isRead);

    for (const notification of userNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

/**
 * Get unread notifications for a user
 */
export const getUnreadNotifications = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user")
      .filter((q) => q.eq("userId", args.userId))
      .collect();

    return notifications.filter((n) => !n.isRead).slice(0, 20);
  },
});

/**
 * Get unread notifications for a role
 */
export const getUnreadRoleNotifications = query({
  args: {
    role: v.optional(v.union(v.literal("admin"), v.literal("accountant"), v.literal("sales_manager"), v.literal("inventory_manager"))),
  },
  handler: async (ctx, args) => {
    if (!args.role) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_role")
      .filter((q) => q.eq("role", args.role))
      .collect();

    return notifications.filter((n) => !n.isRead).slice(0, 20);
  },
});

/**
 * Check for low stock products and create notifications
 */
export const checkLowStock = mutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_org")
      .filter((q) => q.eq("orgId", args.orgId))
      .collect();

    for (const product of products) {
      if (product.minStockLevel && product.stock <= product.minStockLevel) {
        // Check if notification already exists in the last 24 hours
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_created")
          .collect();

        const existingForProduct = existing.find((n) => 
          n.entityType === "product" && 
          n.entityId === product._id &&
          n.type === "low_stock" &&
          n.createdAt > dayAgo
        );

        if (!existingForProduct) {
          await ctx.db.insert("notifications", {
            orgId: args.orgId,
            role: "inventory_manager",
            type: "low_stock",
            message: `Low stock alert: ${product.name} (Stock: ${product.stock})`,
            entityType: "product",
            entityId: product._id,
            isRead: false,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});

/**
 * Check for products approaching expiry
 */
export const checkProductExpiry = mutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_org")
      .filter((q) => q.eq("orgId", args.orgId))
      .collect();

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    for (const product of products) {
      if (product.expiryDate && product.expiryDate < now + thirtyDays) {
        // Check if notification already exists in the last 24 hours
        const dayAgo = now - 24 * 60 * 60 * 1000;
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_created")
          .collect();

        const existingForProduct = existing.find((n) => 
          n.entityType === "product" && 
          n.entityId === product._id &&
          n.type === "product_expiry" &&
          n.createdAt > dayAgo
        );

        if (!existingForProduct) {
          const daysUntilExpiry = Math.ceil((product.expiryDate - now) / (24 * 60 * 60 * 1000));
          await ctx.db.insert("notifications", {
            orgId: args.orgId,
            role: "inventory_manager",
            type: "product_expiry",
            message: `Product expiring soon: ${product.name} (${daysUntilExpiry} days)`,
            entityType: "product",
            entityId: product._id,
            isRead: false,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});

/**
 * Check for overdue invoices
 */
export const checkOverdueInvoices = mutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org")
      .filter((q) => q.eq("orgId", args.orgId))
      .collect();

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    for (const invoice of invoices) {
      if (invoice.status === "issued" && invoice.paymentMethod === "credit" && invoice.remainingDebt > 0) {
        const invoiceDate = invoice._creationTime;
        const isOverdue = now - invoiceDate > thirtyDays;

        if (isOverdue) {
          // Check if notification already exists in the last 7 days
          const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
          const existing = await ctx.db
            .query("notifications")
            .withIndex("by_created")
            .collect();

          const existingForInvoice = existing.find((n) => 
            n.entityType === "invoice" && 
            n.entityId === invoice._id &&
            n.type === "invoice_overdue" &&
            n.createdAt > weekAgo
          );

          if (!existingForInvoice) {
            await ctx.db.insert("notifications", {
              orgId: args.orgId,
              role: "accountant",
              type: "invoice_overdue",
              message: `Overdue invoice: ${invoice.invoiceNumber} (Debt: ${invoice.remainingDebt})`,
              entityType: "invoice",
              entityId: invoice._id,
              isRead: false,
              createdAt: Date.now(),
            });
          }
        }
      }
    }
  },
});

/**
 * Check for overdue supplier payments
 */
export const checkOverdueSupplierPayments = mutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_org")
      .filter((q) => q.eq("orgId", args.orgId))
      .collect();

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    for (const purchase of purchases) {
      if (purchase.status === "received" && purchase.paymentMethod === "credit") {
        const amountPaid = purchase.amountPaid || 0;
        const remaining = purchase.totalCost - amountPaid;

        if (remaining > 0) {
          const purchaseDate = purchase._creationTime;
          const isOverdue = now - purchaseDate > thirtyDays;

          if (isOverdue) {
            // Check if notification already exists in the last 7 days
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
            const existing = await ctx.db
              .query("notifications")
              .withIndex("by_created")
              .collect();

            const existingForPurchase = existing.find((n) => 
              n.entityType === "purchase" && 
              n.entityId === purchase._id &&
              n.type === "supplier_overdue" &&
              n.createdAt > weekAgo
            );

            if (!existingForPurchase) {
              await ctx.db.insert("notifications", {
                orgId: args.orgId,
                role: "accountant",
                type: "supplier_overdue",
                message: `Overdue supplier payment: ${purchase.purchaseNumber} (Remaining: ${remaining})`,
                entityType: "purchase",
                entityId: purchase._id,
                isRead: false,
                createdAt: Date.now(),
              });
            }
          }
        }
      }
    }
  },
});
