"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FileText,
  Package,
  Search,
  User,
  UserCheck,
} from "lucide-react";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Search query
  const searchResults = useQuery(api.search.globalSearch, 
    { query: searchQuery },
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Trigger Button in Navbar */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] transition w-64 sm:w-80"
      >
        <Search className="h-4 w-4" />
        <span>Search... (⌘+K)</span>
      </button>

      {/* Command Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 w-full max-w-2xl">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <Command className="rounded-lg border border-[var(--color-border)]">
            <CommandInput
              placeholder="Search products, customers, suppliers, invoices..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              {searchResults && searchResults.products.length > 0 && (
                <CommandGroup heading="Products">
                  {searchResults.products.map((product) => (
                    <CommandItem
                      key={`product-${product._id}`}
                      onSelect={() => handleSelect(product.href)}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4 text-[var(--color-brand)]" />
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{product.subtitle}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {searchResults && searchResults.customers.length > 0 && (
                <CommandGroup heading="Customers">
                  {searchResults.customers.map((customer) => (
                    <CommandItem
                      key={`customer-${customer._id}`}
                      onSelect={() => handleSelect(customer.href)}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-[var(--color-brand)]" />
                      <div className="flex flex-col">
                        <span>{customer.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{customer.subtitle}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {searchResults && searchResults.suppliers.length > 0 && (
                <CommandGroup heading="Suppliers">
                  {searchResults.suppliers.map((supplier) => (
                    <CommandItem
                      key={`supplier-${supplier._id}`}
                      onSelect={() => handleSelect(supplier.href)}
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4 text-[var(--color-brand)]" />
                      <div className="flex flex-col">
                        <span>{supplier.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{supplier.subtitle}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {searchResults && searchResults.invoices.length > 0 && (
                <CommandGroup heading="Invoices">
                  {searchResults.invoices.map((invoice) => (
                    <CommandItem
                      key={`invoice-${invoice._id}`}
                      onSelect={() => handleSelect(invoice.href)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-[var(--color-brand)]" />
                      <div className="flex flex-col">
                        <span>{invoice.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{invoice.subtitle}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
