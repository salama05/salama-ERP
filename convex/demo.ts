/**
 * Demo workspace management.
 *
 * This file contains:
 *  - `seedDemoData`      — seeds realistic fake data into `demo_workspace`
 *  - `resetDemoData`     — wipes and re-seeds demo data (called by cron every hour)
 *  - `getDemoStatus`     — public query: check if demo data exists
 *  - `getDemoProducts`   — public query: products for demo_workspace (no auth required)
 *  - `getDemoCustomers`  — public query: customers for demo_workspace (no auth required)
 *  - `getDemoInvoices`   — public query: invoices for demo_workspace (no auth required)
 */

import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const DEMO_ORG_ID = "demo_workspace";

// ─── Internal seed ────────────────────────────────────────────────────────────

export const seedDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── Organization settings ──────────────────────────────────────────────────
    const existingSettings = await ctx.db
      .query("organization_settings")
      .withIndex("by_org", (q) => q.eq("orgId", DEMO_ORG_ID))
      .first();

    if (!existingSettings) {
      await ctx.db.insert("organization_settings", {
        orgId: DEMO_ORG_ID,
        store_name: "متجر سلامة التجريبي",
        phone: "0550000000",
        email: "demo@salamaerp.com",
        nif: "000000000000000",
        rc: "00/00-0000000",
        nis: "000000000000000",
        n_art: "0000000000",
        company_type: "SARL",
        business_activity: {
          ar: "تجارة التجزئة",
          fr: "Commerce de détail",
          en: "Retail trade",
        },
        company_address: {
          ar: "16 شارع الاستقلال، الجزائر",
          fr: "16 Rue de l'Indépendance, Alger",
          en: "16 Independence St, Algiers",
        },
        defaultCurrency: "DZD",
        isMultiCurrencyEnabled: false,
        defaultTvaRate: 19,
        invoicePrefix: "DEMO",
      });
    }

    // ── Products ───────────────────────────────────────────────────────────────
    const productSeeds = [
      { name: "زيت الزيتون الممتاز", price: 1200, costPrice: 900, stock: 120, sku: "OIL-001", taxRate: 9 },
      { name: "مسحوق الغسيل 5 كغ", price: 850, costPrice: 600, stock: 200, sku: "WAS-001", taxRate: 19 },
      { name: "علب اللوز 500غ", price: 750, costPrice: 550, stock: 80, sku: "NUT-001", taxRate: 9 },
      { name: "مياه معدنية 1.5L (كرتون)", price: 320, costPrice: 220, stock: 500, sku: "WAT-001", taxRate: 9 },
      { name: "شاي أخضر مراكشي", price: 480, costPrice: 340, stock: 150, sku: "TEA-001", taxRate: 9 },
    ];

    const productIds: string[] = [];
    for (const p of productSeeds) {
      const id = await ctx.db.insert("products", {
        orgId: DEMO_ORG_ID,
        name: p.name,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        sku: p.sku,
        barcode: p.sku,
        minStockLevel: 20,
        taxRate: p.taxRate,
      });
      productIds.push(id);
    }

    // ── Customers ──────────────────────────────────────────────────────────────
    const customerSeeds = [
      { name: "مؤسسة الأمانة للتوزيع", phone: "0550112233", totalDebt: 15000, nif: "100000000000000" },
      { name: "سوبرماركت النجمة", phone: "0661445566", totalDebt: 0, nif: "200000000000000" },
      { name: "بقالة الوفاء", phone: "0771223344", totalDebt: 4500, nif: undefined },
      { name: "محمد أمين (تجزئة)", phone: "0550998877", totalDebt: 0, nif: undefined },
    ];

    const customerIds: string[] = [];
    for (const c of customerSeeds) {
      const id = await ctx.db.insert("customers", {
        orgId: DEMO_ORG_ID,
        name: c.name,
        phone: c.phone,
        totalDebt: c.totalDebt,
        creditLimit: 30000,
        status: "active",
        nif: c.nif,
      });
      customerIds.push(id);
    }

    // ── Counters ───────────────────────────────────────────────────────────────
    await ctx.db.insert("counters", { orgId: DEMO_ORG_ID, counterType: "invoice_official", currentNumber: 3 });
    await ctx.db.insert("counters", { orgId: DEMO_ORG_ID, counterType: "invoice_informal", currentNumber: 1 });

    // ── Invoices ───────────────────────────────────────────────────────────────
    if (customerIds.length > 0 && productIds.length > 0) {
      // Invoice 1 — Paid
      const inv1Id = await ctx.db.insert("invoices", {
        orgId: DEMO_ORG_ID,
        customerId: customerIds[0] as any,
        invoiceNumber: "DEMO-2026-001",
        isOfficial: true,
        paymentMethod: "cash",
        subtotal: 2400,
        tvaAmount: 456,
        timbreFiscal: 50,
        totalAmount: 2906,
        amountPaid: 2906,
        remainingDebt: 0,
        status: "paid",
        notes: "فاتورة تجريبية — مدفوعة",
      });
      await ctx.db.insert("invoice_items", {
        invoiceId: inv1Id,
        productId: productIds[0] as any,
        quantity: 2,
        unitPrice: 1200,
        taxRate: 9,
        itemSubtotal: 2400,
        itemTvaAmount: 216,
        itemTotal: 2616,
      });

      // Invoice 2 — Partial
      const inv2Id = await ctx.db.insert("invoices", {
        orgId: DEMO_ORG_ID,
        customerId: customerIds[1] as any,
        invoiceNumber: "DEMO-2026-002",
        isOfficial: true,
        paymentMethod: "credit",
        subtotal: 1700,
        tvaAmount: 323,
        timbreFiscal: 0,
        totalAmount: 2023,
        amountPaid: 1000,
        remainingDebt: 1023,
        status: "partial",
        notes: "فاتورة تجريبية — مدفوعة جزئياً",
      });
      await ctx.db.insert("invoice_items", {
        invoiceId: inv2Id,
        productId: productIds[1] as any,
        quantity: 2,
        unitPrice: 850,
        taxRate: 19,
        itemSubtotal: 1700,
        itemTvaAmount: 323,
        itemTotal: 2023,
      });

      // Invoice 3 — Draft
      const inv3Id = await ctx.db.insert("invoices", {
        orgId: DEMO_ORG_ID,
        customerId: customerIds[2] as any,
        invoiceNumber: "DEMO-2026-003",
        isOfficial: false,
        paymentMethod: "cash",
        subtotal: 960,
        tvaAmount: 86,
        timbreFiscal: 0,
        totalAmount: 1046,
        amountPaid: 0,
        remainingDebt: 1046,
        status: "draft",
        notes: "مسودة — قيد الإنجاز",
      });
      await ctx.db.insert("invoice_items", {
        invoiceId: inv3Id,
        productId: productIds[3] as any,
        quantity: 3,
        unitPrice: 320,
        taxRate: 9,
        itemSubtotal: 960,
        itemTvaAmount: 86,
        itemTotal: 1046,
      });
    }

    // ── Suppliers ──────────────────────────────────────────────────────────────
    await ctx.db.insert("suppliers", {
      orgId: DEMO_ORG_ID,
      name: "مجمع الجزائر للتوزيع",
      phone: "023456789",
      email: "fournisseur@exemple.dz",
      nif: "300000000000000",
      status: "active",
      paymentTerms: "30 يوم",
    });

    // ── Expenses ───────────────────────────────────────────────────────────────
    await ctx.db.insert("expenses", {
      orgId: DEMO_ORG_ID,
      amount: 5000,
      category: "إيجار",
      description: "إيجار المحل — يوليو 2026",
      date: "2026-07-01",
    });
    await ctx.db.insert("expenses", {
      orgId: DEMO_ORG_ID,
      amount: 1200,
      category: "كهرباء/ماء",
      description: "فاتورة الكهرباء",
      date: "2026-07-10",
    });

    console.log("[DEMO] Demo data seeded successfully for org:", DEMO_ORG_ID);
    return { success: true };
  },
});

// ─── Internal reset ────────────────────────────────────────────────────────────

export const resetDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "invoice_items",
      "invoices",
      "customers",
      "products",
      "suppliers",
      "purchases",
      "purchase_items",
      "expenses",
      "organization_settings",
      "counters",
      "stock_movements",
      "audit_logs",
      "notifications",
    ] as const;

    // Delete all demo records from each table
    for (const table of tables) {
      if (table === "invoice_items" || table === "purchase_items") {
        // These don't have orgId — handled via parent references, skip direct delete
        // We rely on the parent invoice/purchase being deleted first
        continue;
      }
      let hasMore = true;
      while (hasMore) {
        const rows = await (ctx.db.query(table) as any)
          .withIndex("by_org", (q: any) => q.eq("orgId", DEMO_ORG_ID))
          .take(100);
        if (rows.length === 0) {
          hasMore = false;
        } else {
          for (const row of rows) {
            await ctx.db.delete(row._id);
          }
        }
      }
    }

    // Delete orphan invoice_items (invoices already deleted)
    // They have no orgId index — we do a full scan and delete orphans
    let hasMoreItems = true;
    while (hasMoreItems) {
      const items = await ctx.db.query("invoice_items").take(200);
      const orphans = [];
      for (const item of items) {
        const parent = await ctx.db.get(item.invoiceId);
        if (!parent) orphans.push(item._id);
      }
      if (orphans.length === 0) {
        hasMoreItems = false;
      } else {
        for (const id of orphans) {
          await ctx.db.delete(id);
        }
      }
    }

    // Re-seed fresh data
    await ctx.runMutation(internal.demo.seedDemoData, {});

    console.log("[DEMO] Demo data reset completed at", new Date().toISOString());
    return { success: true };
  },
});

// ─── Public query ─────────────────────────────────────────────────────────────

/** Check if demo data is seeded and how many records exist. */
export const getDemoStatus = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_org", (q) => q.eq("orgId", DEMO_ORG_ID))
      .take(10);
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("orgId", DEMO_ORG_ID))
      .take(10);
    return {
      isSeeded: products.length > 0,
      productCount: products.length,
      customerCount: customers.length,
      orgId: DEMO_ORG_ID,
    };
  },
});

// ─── Public demo data queries (no auth required) ──────────────────────────────
// These queries ONLY return data from demo_workspace and are safe to expose
// without authentication. They power the demo dashboard when there is no
// Clerk session.

/** All products in the demo workspace. */
export const getDemoProducts = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("products")
      .withIndex("by_org", (q) => q.eq("orgId", DEMO_ORG_ID))
      .collect();
  },
});

/** All customers in the demo workspace. */
export const getDemoCustomers = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("orgId", DEMO_ORG_ID))
      .collect();
  },
});

/** Most recent 20 invoices in the demo workspace. */
export const getDemoInvoices = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("orgId", DEMO_ORG_ID))
      .order("desc")
      .take(20);
  },
});

/** Organization settings for the demo workspace. */
export const getDemoOrgSettings = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("organization_settings")
      .withIndex("by_org", (q) => q.eq("orgId", DEMO_ORG_ID))
      .first();
  },
});

