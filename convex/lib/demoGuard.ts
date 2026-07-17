/**
 * Server-side demo guard for Convex mutations.
 *
 * Usage in any mutation that should be blocked for demo users:
 *
 *   import { blockIfDemoOrg } from "./demoGuard";
 *
 *   // Inside mutation handler:
 *   blockIfDemoOrg(orgId, "Deleting products is not allowed in demo mode.");
 */

export const DEMO_ORG_ID = "demo_workspace";

/**
 * Throws an error if the given orgId belongs to the demo workspace.
 * Call this at the top of any mutation that should be restricted for demo users.
 *
 * @param orgId   The organization ID from the viewer context.
 * @param reason  Human-readable reason shown in the error message.
 */
export function blockIfDemoOrg(orgId: string, reason?: string): void {
  if (orgId === DEMO_ORG_ID) {
    throw new Error(
      `[DEMO_BLOCKED] ${reason ?? "This action is not available in demo mode."}`
    );
  }
}

/**
 * Returns true if the orgId belongs to the demo workspace.
 * Useful for conditional behavior without throwing.
 */
export function isDemoOrg(orgId: string): boolean {
  return orgId === DEMO_ORG_ID;
}
