"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useI18n } from "@/lib/i18n";
import { Search, Package, Users, FileText, Building2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Doc } from "@/convex/_generated/dataModel";

interface SearchResult {
  type: "product" | "customer" | "supplier" | "invoice";
  id: string;
  label: string;
  subtitle?: string;
  href: string;
}

export function GlobalSearch() {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const products = useQuery(api.products.listProducts, {});
  const customers = useQuery(api.customers.listCustomers, {});
  const suppliers = useQuery(api.suppliers.listSuppliers, {});
  const invoices = useQuery(api.invoices.listInvoices, {});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const newResults: SearchResult[] = [];

    // Search products
    products?.forEach((product: Doc<"products">) => {
      if (product.name.toLowerCase().includes(q) || product.sku?.toLowerCase().includes(q)) {
        newResults.push({
          type: "product",
          id: product._id,
          label: product.name,
          subtitle: product.sku || `Stock: ${product.stock}`,
          href: `/products/${product._id}`,
        });
      }
    });

    // Search customers
    customers?.forEach((customer) => {
      if (customer.name.toLowerCase().includes(q) || customer.email?.toLowerCase().includes(q)) {
        newResults.push({
          type: "customer",
          id: customer._id,
          label: customer.name,
          subtitle: customer.email || customer.phone,
          href: `/customers/${customer._id}`,
        });
      }
    });

    // Search suppliers
    suppliers?.forEach((supplier) => {
      if (supplier.name.toLowerCase().includes(q) || supplier.email?.toLowerCase().includes(q)) {
        newResults.push({
          type: "supplier",
          id: supplier._id,
          label: supplier.name,
          subtitle: supplier.email || supplier.phone,
          href: `/suppliers/${supplier._id}`,
        });
      }
    });

    // Search invoices
    invoices?.forEach((invoice: Doc<"invoices">) => {
      if (invoice.invoiceNumber.toLowerCase().includes(q)) {
        newResults.push({
          type: "invoice",
          id: invoice._id,
          label: invoice.invoiceNumber,
          subtitle: `${invoice.isOfficial ? "Facture" : "Bon"} - ${invoice.status}`,
          href: `/invoices/${invoice._id}`,
        });
      }
    });

    setResults(newResults);
  }, [query, products, customers, suppliers, invoices]);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "supplier":
        return <Building2 className="h-4 w-4" />;
      case "invoice":
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return language === "ar" ? "منتج" : language === "fr" ? "Produit" : "Product";
      case "customer":
        return language === "ar" ? "عميل" : language === "fr" ? "Client" : "Customer";
      case "supplier":
        return language === "ar" ? "مورد" : language === "fr" ? "Fournisseur" : "Supplier";
      case "invoice":
        return language === "ar" ? "فاتورة" : language === "fr" ? "Facture" : "Invoice";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Search className="h-4 w-4 text-gray-500" />
        <span className="text-gray-500">
          {language === "ar" ? "بحث..." : language === "fr" ? "Rechercher..." : "Search..."}
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-200 rounded">
          <span className={isRTL ? "ml-1" : "mr-1"}>&#8984;</span>
          K
        </kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0">
          <div className="flex items-center border-b px-4 py-3">
            <Search className={`h-5 w-5 text-gray-500 ${isRTL ? "ml-2" : "mr-2"}`} />
            <input
              type="text"
              placeholder={language === "ar" ? "ابحث عن منتجات، عمليل، موردين، فواتير..." : language === "fr" ? "Rechercher produits, clients, fournisseurs, factures..." : "Search products, customers, suppliers, invoices..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-sm"
              autoFocus
            />
            <button
              onClick={() => setQuery("")}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {query.trim()
                  ? (language === "ar" ? "لا توجد نتائج" : language === "fr" ? "Aucun résultat" : "No results")
                  : (language === "ar" ? "اكتب للبحث" : language === "fr" ? "Tapez pour rechercher" : "Type to search")}
              </div>
            ) : (
              <div className="py-2">
                {results.map((result) => (
                  <a
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <div className="flex-shrink-0 text-gray-400">{getIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.label}</p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {getTypeLabel(result.type)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
