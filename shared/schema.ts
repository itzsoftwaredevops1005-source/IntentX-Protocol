import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const intents = pgTable("intents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockchainIntentId: text("blockchain_intent_id"), // On-chain intent ID
  userAddress: text("user_address").notNull(),
  sourceToken: text("source_token").notNull(),
  targetToken: text("target_token").notNull(),
  sourceAmount: decimal("source_amount", { precision: 32, scale: 18 }).notNull(),
  minTargetAmount: decimal("min_target_amount", { precision: 32, scale: 18 }).notNull(),
  slippage: decimal("slippage", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  executedAmount: decimal("executed_amount", { precision: 32, scale: 18 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  executedAt: timestamp("executed_at"),
  signature: text("signature").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertIntentSchema = createInsertSchema(intents).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Intent = typeof intents.$inferSelect;
export type InsertIntent = z.infer<typeof insertIntentSchema>;
