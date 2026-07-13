import { query } from "./_generated/server";

export const ping = query({
  args: {},
  handler: async (ctx) => {
    return "pong";
  },
});

export const inspectDb = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const products = await ctx.db.query("products").collect();
    const suppliers = await ctx.db.query("suppliers").collect();
    return { users, products, suppliers };
  },
});


