import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  preferences: jsonb("preferences")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  photoURL: true
});

// Portfolio assets schema
export const portfolioAssets = pgTable("portfolio_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  amount: text("amount").notNull(),
  buyPrice: text("buy_price"),
  buyDate: timestamp("buy_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertPortfolioAssetSchema = createInsertSchema(portfolioAssets).pick({
  userId: true,
  symbol: true,
  amount: true,
  buyPrice: true,
  buyDate: true,
  notes: true
});

// Price alerts schema
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  price: text("price").notNull(),
  type: text("type").notNull(), // "above" or "below"
  active: boolean("active").default(true),
  triggered: boolean("triggered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  triggeredAt: timestamp("triggered_at")
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).pick({
  userId: true,
  symbol: true,
  price: true,
  type: true,
  active: true
});

// Chat history schema
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // "user" or "bot"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});

export const insertChatHistorySchema = createInsertSchema(chatHistory).pick({
  userId: true,
  role: true,
  content: true
});

// Favorite cryptocurrencies schema
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  symbol: true
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolioAsset = z.infer<typeof insertPortfolioAssetSchema>;
export type PortfolioAsset = typeof portfolioAssets.$inferSelect;

export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
