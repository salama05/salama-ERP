import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Atomically increments a counter and returns the new value.
 * This guarantees gapless, strictly sequential numbering under concurrent creation.
 */
export const increment = internalMutation({
  args: {
    orgId: v.string(),
    counterType: v.string(),
  },
  handler: async (ctx, args) => {
    const counter = await ctx.db
      .query("counters")
      .withIndex("by_org_and_type", (q) =>
        q.eq("orgId", args.orgId).eq("counterType", args.counterType)
      )
      .unique();

    let nextNumber: number;

    if (counter) {
      nextNumber = counter.currentNumber + 1;
      await ctx.db.patch(counter._id, { currentNumber: nextNumber });
    } else {
      nextNumber = 1;
      await ctx.db.insert("counters", {
        orgId: args.orgId,
        counterType: args.counterType,
        currentNumber: nextNumber,
      });
    }

    return nextNumber;
  },
});
