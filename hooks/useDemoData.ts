"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDemoSession } from "./useDemoSession";

/**
 * Returns live demo data from Convex (no auth required).
 * Only active when isDemoMode is true.
 *
 * Pages can use this instead of the auth-gated queries when in demo mode:
 *
 *   const { isDemoMode } = useDemoSession();
 *   const { products } = useDemoData();
 *   const data = isDemoMode ? products : useQuery(api.products.list);
 */
export function useDemoData() {
  const { isDemoMode } = useDemoSession();

  // Convex queries — these run unconditionally but only consume data
  // when isDemoMode is true. They don't require auth.
  const products = useQuery(api.demo.getDemoProducts);
  const customers = useQuery(api.demo.getDemoCustomers);
  const invoices = useQuery(api.demo.getDemoInvoices);
  const orgSettings = useQuery(api.demo.getDemoOrgSettings);
  const status = useQuery(api.demo.getDemoStatus);

  return {
    isDemoMode,
    products: products ?? [],
    customers: customers ?? [],
    invoices: invoices ?? [],
    orgSettings: orgSettings ?? null,
    isSeeded: status?.isSeeded ?? false,
    isLoading:
      products === undefined ||
      customers === undefined ||
      invoices === undefined,
  };
}
