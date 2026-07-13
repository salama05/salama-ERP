import { query } from "./_generated/server";
import { v } from "convex/values";
import { getViewerContext } from "./lib/context";

export const globalSearch = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const viewer = await getViewerContext(ctx);
    const { orgId } = viewer;
    const searchQuery = args.query.toLowerCase().trim();
    
    if (searchQuery.length === 0) {
      return {
        products: [],
        customers: [],
        suppliers: [],
        invoices: [],
      };
    }

    // Parallel searches
    const [products, customers, suppliers, invoices] = await Promise.all([
      ctx.db
        .query("products")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect(),
      ctx.db
        .query("customers")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect(),
      ctx.db
        .query("suppliers")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect(),
      ctx.db
        .query("invoices")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect(),
    ]);

    // Filter products
    const filteredProducts = products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(searchQuery) ||
          (product.sku && product.sku.toLowerCase().includes(searchQuery)) ||
          (product.barcode && product.barcode.toLowerCase().includes(searchQuery))
        );
      })
      .slice(0, 5)
      .map((product) => ({
        _id: product._id,
        name: product.name,
        type: "product" as const,
        subtitle: product.sku || product.barcode || `Stock: ${product.stock}`,
        href: `/products/${product._id}`,
      }));

    // Filter customers
    const filteredCustomers = customers
      .filter((customer) => {
        return (
          customer.name.toLowerCase().includes(searchQuery) ||
          (customer.email && customer.email.toLowerCase().includes(searchQuery)) ||
          (customer.phone && customer.phone.toLowerCase().includes(searchQuery))
        );
      })
      .slice(0, 5)
      .map((customer) => ({
        _id: customer._id,
        name: customer.name,
        type: "customer" as const,
        subtitle: customer.email || customer.phone || `Debt: ${customer.totalDebt}`,
        href: `/customers/${customer._id}`,
      }));

    // Filter suppliers
    const filteredSuppliers = suppliers
      .filter((supplier) => {
        return (
          supplier.name.toLowerCase().includes(searchQuery) ||
          (supplier.email && supplier.email.toLowerCase().includes(searchQuery)) ||
          (supplier.phone && supplier.phone.toLowerCase().includes(searchQuery))
        );
      })
      .slice(0, 5)
      .map((supplier) => ({
        _id: supplier._id,
        name: supplier.name,
        type: "supplier" as const,
        subtitle: supplier.email || supplier.phone || `Status: ${supplier.status}`,
        href: `/suppliers/${supplier._id}`,
      }));

    // Filter invoices
    const filteredInvoices = invoices
      .filter((invoice) => {
        return invoice.invoiceNumber.toLowerCase().includes(searchQuery);
      })
      .slice(0, 5)
      .map((invoice) => ({
        _id: invoice._id,
        name: invoice.invoiceNumber,
        type: "invoice" as const,
        subtitle: `Status: ${invoice.status} | Total: ${invoice.totalAmount}`,
        href: `/invoices/${invoice._id}`,
      }));

    return {
      products: filteredProducts,
      customers: filteredCustomers,
      suppliers: filteredSuppliers,
      invoices: filteredInvoices,
    };
  },
});
