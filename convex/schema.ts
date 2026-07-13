import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk Subject ID
    orgIds: v.array(v.string()), // Array of Clerk Organization IDs this user belongs to
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("accountant"),
      v.literal("sales_manager"),
      v.literal("inventory_manager"),
      v.literal("custom"),
      // Legacy roles for backward compatibility
      v.literal("OWNER"),
      v.literal("STAFF")
    ),
    isActive: v.optional(v.boolean()),
    customPermissions: v.optional(v.array(v.string())),
    deactivatedAt: v.optional(v.number()),
    deactivatedBy: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"]),

  products: defineTable({
    orgId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    costPrice: v.optional(v.number()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    stock: v.number(),
    minStockLevel: v.optional(v.number()), // Alert threshold
    taxRate: v.optional(v.number()), // 9 or 19 for TVA percentage
    images: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({})), // For industry-specific fields
    expiryDate: v.optional(v.number()), // Timestamp (ms since epoch) - optional because not all products expire
  }).index("by_org", ["orgId"]),

  customers: defineTable({
    orgId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    nif: v.optional(v.string()), // NIF for B2B
    rc: v.optional(v.string()), // RC for B2B
    totalDebt: v.number(), // Credit tracking for wholesale
    creditLimit: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("inactive")),
  }).index("by_org", ["orgId"]),

  invoices: defineTable({
    orgId: v.string(),
    customerId: v.id("customers"),
    invoiceNumber: v.string(), // e.g., "FACT-2026-001" or "BON-2026-001"
    isOfficial: v.boolean(), // Facture (true) vs Bon de livraison (false)
    paymentMethod: v.union(v.literal("cash"), v.literal("credit"), v.literal("check")), // For Timbre Fiscal
    subtotal: v.number(),
    tvaAmount: v.number(),
    timbreFiscal: v.number(), // Stamp tax for official + cash
    totalAmount: v.number(),
    amountPaid: v.number(), // For credit tracking
    remainingDebt: v.number(),
    status: v.union(v.literal("draft"), v.literal("issued"), v.literal("paid"), v.literal("partial"), v.literal("void")), // Invoice state
    notes: v.optional(v.string()),
  }).index("by_org", ["orgId"]).index("by_customer", ["orgId", "customerId"]),

  invoice_items: defineTable({
    invoiceId: v.id("invoices"),
    productId: v.id("products"),
    quantity: v.number(),
    unitPrice: v.number(),
    taxRate: v.number(), // 9 or 19
    itemSubtotal: v.number(),
    itemTvaAmount: v.number(),
    itemTotal: v.number(),
  }).index("by_invoice", ["invoiceId"]),

  organization_settings: defineTable({
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
  }).index("by_org", ["orgId"]),

  counters: defineTable({
    orgId: v.string(),
    counterType: v.string(), // "invoice_official", "invoice_informal", "purchase"
    currentNumber: v.number(),
  }).index("by_org_and_type", ["orgId", "counterType"]),

  stock_movements: defineTable({
    orgId: v.string(),
    productId: v.id("products"),
    type: v.union(v.literal("SALE"), v.literal("RESTOCK"), v.literal("ADJUSTMENT")),
    quantity: v.number(), // Can be negative for sales
    invoiceId: v.optional(v.id("invoices")), // Reference to invoice if type is SALE
    notes: v.optional(v.string()),
  })
    .index("by_org", ["orgId"])
    .index("by_product", ["orgId", "productId"])
    .index("by_invoice", ["invoiceId"]),

  suppliers: defineTable({
    orgId: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    nif: v.optional(v.string()), // Tax ID
    rc: v.optional(v.string()), // Registration code
    address: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
  }).index("by_org", ["orgId"]),

  purchases: defineTable({
    orgId: v.string(),
    supplierId: v.id("suppliers"),
    purchaseNumber: v.string(), // e.g., "ACH-2026-001"
    totalCost: v.number(), // Total amount for the purchase
    status: v.union(v.literal("draft"), v.literal("received"), v.literal("paid")),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("credit"), v.literal("check"))),
    amountPaid: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_org", ["orgId"])
    .index("by_supplier", ["orgId", "supplierId"]),

  purchase_items: defineTable({
    purchaseId: v.id("purchases"),
    productId: v.id("products"),
    quantity: v.number(),
    unitCost: v.number(), // Cost per unit from supplier
    itemTotal: v.number(), // quantity * unitCost
    expiryDate: v.optional(v.number()), // Timestamp (ms since epoch) - optional
  }).index("by_purchase", ["purchaseId"]),

  expenses: defineTable({
    orgId: v.string(),
    amount: v.number(),
    category: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
  }).index("by_org", ["orgId"]),

  audit_logs: defineTable({
    orgId: v.string(),
    userId: v.string(), // We store as string (e.g., tokenIdentifier or internal ID) for robust linking
    userName: v.string(),
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("void"),
      v.literal("price_change"),
      v.literal("stock_adjustment"),
      v.literal("login"),
      v.literal("role_change")
    ),
    entityType: v.string(), // e.g., "invoice" | "product" | "inventory" | "user"
    entityId: v.string(),
    entityLabel: v.string(), // A human-readable label for the entity (e.g., Invoice Number)
    changes: v.optional(v.array(v.object({
      field: v.string(),
      oldValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
    }))),
    timestamp: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  notifications: defineTable({
    orgId: v.string(),
    userId: v.optional(v.string()), // Optional - can be role-targeted
    role: v.optional(v.union(v.literal("admin"), v.literal("accountant"), v.literal("sales_manager"), v.literal("inventory_manager"))),
    type: v.union(
      v.literal("low_stock"),
      v.literal("product_expiry"),
      v.literal("invoice_overdue"),
      v.literal("supplier_overdue")
    ),
    message: v.string(),
    entityType: v.optional(v.string()), // e.g., "product" | "invoice" | "supplier"
    entityId: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId", "isRead"])
    .index("by_role", ["role", "isRead"])
    .index("by_created", ["createdAt"])
    .index("by_entity", ["entityType", "entityId"]),
});
