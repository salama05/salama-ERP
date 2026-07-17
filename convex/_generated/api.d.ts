/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as audit from "../audit.js";
import type * as backup from "../backup.js";
import type * as counters from "../counters.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as demo from "../demo.js";
import type * as finance from "../finance.js";
import type * as invoices from "../invoices.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_context from "../lib/context.js";
import type * as lib_demoGuard from "../lib/demoGuard.js";
import type * as lib_stockManagement from "../lib/stockManagement.js";
import type * as lib_taxCalculator from "../lib/taxCalculator.js";
import type * as notifications from "../notifications.js";
import type * as organization_settings from "../organization_settings.js";
import type * as products from "../products.js";
import type * as purchases from "../purchases.js";
import type * as search from "../search.js";
import type * as settings from "../settings.js";
import type * as suppliers from "../suppliers.js";
import type * as test from "../test.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  audit: typeof audit;
  backup: typeof backup;
  counters: typeof counters;
  crons: typeof crons;
  customers: typeof customers;
  demo: typeof demo;
  finance: typeof finance;
  invoices: typeof invoices;
  "lib/audit": typeof lib_audit;
  "lib/auth": typeof lib_auth;
  "lib/context": typeof lib_context;
  "lib/demoGuard": typeof lib_demoGuard;
  "lib/stockManagement": typeof lib_stockManagement;
  "lib/taxCalculator": typeof lib_taxCalculator;
  notifications: typeof notifications;
  organization_settings: typeof organization_settings;
  products: typeof products;
  purchases: typeof purchases;
  search: typeof search;
  settings: typeof settings;
  suppliers: typeof suppliers;
  test: typeof test;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
