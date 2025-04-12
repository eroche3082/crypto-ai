import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
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

// 1. Wallet-to-Wallet Messaging system
export const walletMessages = pgTable("wallet_messages", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull(), // wallet address
  recipientId: text("recipient_id").notNull(), // wallet address
  content: text("content").notNull(),
  encryptionType: text("encryption_type").default("pgp"),
  status: text("status").default("sent"), // sent, delivered, read
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata")
});

export const insertWalletMessageSchema = createInsertSchema(walletMessages).pick({
  senderId: true,
  recipientId: true,
  content: true,
  encryptionType: true,
  metadata: true
});

export type InsertWalletMessage = z.infer<typeof insertWalletMessageSchema>;
export type WalletMessage = typeof walletMessages.$inferSelect;

// 2. Multi-Chain Portfolio Tracker
export const walletAssets = pgTable("wallet_assets", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  userId: integer("user_id").references(() => users.id),
  chain: text("chain").notNull(), // ethereum, solana, etc.
  asset: text("asset").notNull(),
  balance: text("balance").notNull(),
  usdValue: text("usd_value"),
  lastUpdated: timestamp("last_updated").defaultNow()
});

export const insertWalletAssetSchema = createInsertSchema(walletAssets).pick({
  walletAddress: true,
  userId: true,
  chain: true,
  asset: true,
  balance: true,
  usdValue: true
});

export type InsertWalletAsset = z.infer<typeof insertWalletAssetSchema>;
export type WalletAsset = typeof walletAssets.$inferSelect;

// 3. Gas Fee Optimizer
export const gasFeeEstimates = pgTable("gas_fee_estimates", {
  id: serial("id").primaryKey(),
  chain: text("chain").notNull(),
  fast: text("fast").notNull(),
  average: text("average").notNull(),
  slow: text("slow").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  historicalData: jsonb("historical_data")
});

export const insertGasFeeEstimateSchema = createInsertSchema(gasFeeEstimates).pick({
  chain: true,
  fast: true,
  average: true,
  slow: true,
  historicalData: true
});

export type InsertGasFeeEstimate = z.infer<typeof insertGasFeeEstimateSchema>;
export type GasFeeEstimate = typeof gasFeeEstimates.$inferSelect;

// 4. AI Trading Assistant
export const tradingSuggestions = pgTable("trading_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  suggestion: text("suggestion").notNull(), // buy, sell, hold
  confidence: text("confidence").notNull(), // 0-100
  reasoning: text("reasoning"),
  timestamp: timestamp("timestamp").defaultNow(),
  priceAtSuggestion: text("price_at_suggestion")
});

export const insertTradingSuggestionSchema = createInsertSchema(tradingSuggestions).pick({
  userId: true,
  symbol: true,
  suggestion: true,
  confidence: true,
  reasoning: true,
  priceAtSuggestion: true
});

export type InsertTradingSuggestion = z.infer<typeof insertTradingSuggestionSchema>;
export type TradingSuggestion = typeof tradingSuggestions.$inferSelect;

// 5. Pattern Recognition Scanner
export const chartPatterns = pgTable("chart_patterns", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  pattern: text("pattern").notNull(), // head and shoulders, double top, etc.
  confidence: text("confidence").notNull(),
  timeframe: text("timeframe").notNull(), // 1h, 4h, 1d, etc.
  detectedAt: timestamp("detected_at").defaultNow(),
  priceAtDetection: text("price_at_detection"),
  screenshot: text("screenshot") // URL to pattern screenshot
});

export const insertChartPatternSchema = createInsertSchema(chartPatterns).pick({
  symbol: true,
  pattern: true,
  confidence: true,
  timeframe: true,
  priceAtDetection: true,
  screenshot: true
});

export type InsertChartPattern = z.infer<typeof insertChartPatternSchema>;
export type ChartPattern = typeof chartPatterns.$inferSelect;

// 6. Sentiment Radar
export const marketSentiments = pgTable("market_sentiments", {
  id: serial("id").primaryKey(),
  sector: text("sector").notNull(), // DeFi, NFT, L1, L2, etc.
  overallSentiment: text("overall_sentiment").notNull(), // very negative, negative, neutral, positive, very positive
  score: integer("score").notNull(), // -100 to 100
  sources: jsonb("sources"), // Twitter, Reddit, Discord, etc.
  timestamp: timestamp("timestamp").defaultNow()
});

export const insertMarketSentimentSchema = createInsertSchema(marketSentiments).pick({
  sector: true,
  overallSentiment: true,
  score: true,
  sources: true
});

export type InsertMarketSentiment = z.infer<typeof insertMarketSentimentSchema>;
export type MarketSentiment = typeof marketSentiments.$inferSelect;

// 7. Crypto Academy
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  modules: jsonb("modules").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const userCourseProgress = pgTable("user_course_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  progress: integer("progress").notNull().default(0), // percentage
  completed: boolean("completed").default(false),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  difficulty: true,
  modules: true
});

export const insertUserCourseProgressSchema = createInsertSchema(userCourseProgress).pick({
  userId: true,
  courseId: true,
  progress: true,
  completed: true
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertUserCourseProgress = z.infer<typeof insertUserCourseProgressSchema>;
export type UserCourseProgress = typeof userCourseProgress.$inferSelect;

// 8. Paper Trading Arena
export const paperTradingAccounts = pgTable("paper_trading_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: text("balance").notNull().default("10000"), // USD
  createdAt: timestamp("created_at").defaultNow(),
  resetCount: integer("reset_count").default(0)
});

export const paperTrades = pgTable("paper_trades", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => paperTradingAccounts.id),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // buy, sell
  amount: text("amount").notNull(),
  price: text("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").default("executed"), // pending, executed, canceled
  profit: text("profit") // profit/loss if closed
});

export const insertPaperTradingAccountSchema = createInsertSchema(paperTradingAccounts).pick({
  userId: true,
  balance: true
});

export const insertPaperTradeSchema = createInsertSchema(paperTrades).pick({
  accountId: true,
  symbol: true,
  type: true,
  amount: true,
  price: true,
  status: true
});

export type InsertPaperTradingAccount = z.infer<typeof insertPaperTradingAccountSchema>;
export type PaperTradingAccount = typeof paperTradingAccounts.$inferSelect;

export type InsertPaperTrade = z.infer<typeof insertPaperTradeSchema>;
export type PaperTrade = typeof paperTrades.$inferSelect;

// 9. Token Economics Visualizer - no additional database tables needed

// 10. DAO Governance Hub
export const daoProposals = pgTable("dao_proposals", {
  id: serial("id").primaryKey(),
  daoName: text("dao_name").notNull(),
  proposalId: text("proposal_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // active, passed, rejected
  votingEnds: timestamp("voting_ends"),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const userDaoSubscriptions = pgTable("user_dao_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  daoName: text("dao_name").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertDaoProposalSchema = createInsertSchema(daoProposals).pick({
  daoName: true,
  proposalId: true,
  title: true,
  description: true,
  status: true,
  votingEnds: true,
  link: true
});

export const insertUserDaoSubscriptionSchema = createInsertSchema(userDaoSubscriptions).pick({
  userId: true,
  daoName: true
});

export type InsertDaoProposal = z.infer<typeof insertDaoProposalSchema>;
export type DaoProposal = typeof daoProposals.$inferSelect;

export type InsertUserDaoSubscription = z.infer<typeof insertUserDaoSubscriptionSchema>;
export type UserDaoSubscription = typeof userDaoSubscriptions.$inferSelect;

// 11-20: Additional tables will be added based on implementation
// 11. Crypto Events Calendar
export const cryptoEvents = pgTable("crypto_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull(), // fork, launch, update, etc.
  date: timestamp("date").notNull(),
  projects: text("projects").array().notNull(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow()
});

export const userEventReminders = pgTable("user_event_reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => cryptoEvents.id),
  reminderTime: timestamp("reminder_time").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertCryptoEventSchema = createInsertSchema(cryptoEvents).pick({
  title: true,
  description: true,
  eventType: true,
  date: true,
  projects: true,
  source: true
});

export const insertUserEventReminderSchema = createInsertSchema(userEventReminders).pick({
  userId: true,
  eventId: true,
  reminderTime: true
});

export type InsertCryptoEvent = z.infer<typeof insertCryptoEventSchema>;
export type CryptoEvent = typeof cryptoEvents.$inferSelect;

export type InsertUserEventReminder = z.infer<typeof insertUserEventReminderSchema>;
export type UserEventReminder = typeof userEventReminders.$inferSelect;

// Token Watchlist schema
export const tokenWatchlist = pgTable('token_watchlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  tokenId: text('token_id').notNull(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  contractAddress: text('contract_address'),
  chain: text('chain').default('ethereum'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertTokenWatchlistSchema = createInsertSchema(tokenWatchlist).pick({
  userId: true,
  tokenId: true,
  symbol: true,
  name: true,
  contractAddress: true,
  chain: true
});

export type TokenWatchlist = typeof tokenWatchlist.$inferSelect;
export type InsertTokenWatchlist = z.infer<typeof insertTokenWatchlistSchema>;
