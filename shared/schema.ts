import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  json,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  language: text("language").default("en"),
  theme: text("theme").default("dark"),
  settings: json("settings"),
  profile_image: text("profile_image"),
  stripe_customer_id: text("stripe_customer_id"),
  stripe_subscription_id: text("stripe_subscription_id"),
  experience_points: integer("experience_points").default(0),
  level: integer("level").default(1),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  category: text("category").notNull(),
  points: integer("points").notNull(),
  requirements: json("requirements").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// User Achievements table (many-to-many)
export const userAchievements = pgTable(
  "user_achievements",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievement_id: integer("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlocked_at: timestamp("unlocked_at").defaultNow(),
    progress: integer("progress").default(0),
    completed: boolean("completed").default(false),
  },
  (table) => {
    return {
      unique_user_achievement: unique().on(
        table.user_id,
        table.achievement_id
      ),
    };
  }
);

// Challenges table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  category: text("category").notNull(),
  points: integer("points").notNull(),
  requirements: json("requirements").notNull(),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

// User Challenges table (many-to-many)
export const userChallenges = pgTable(
  "user_challenges",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    challenge_id: integer("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    started_at: timestamp("started_at").defaultNow(),
    completed_at: timestamp("completed_at"),
    progress: integer("progress").default(0),
    completed: boolean("completed").default(false),
  },
  (table) => {
    return {
      unique_user_challenge: unique().on(table.user_id, table.challenge_id),
    };
  }
);

// Trading Simulation table
export const tradingSimulations = pgTable("trading_simulations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  starting_balance: integer("starting_balance").notNull(),
  current_balance: integer("current_balance").notNull(),
  risk_level: text("risk_level").notNull(), // low, medium, high
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  is_active: boolean("is_active").default(true),
});

// Quiz Questions table
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: json("options").notNull(), // array of options
  correct_answer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  category: text("category").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// User Quiz Responses table
export const userQuizResponses = pgTable("user_quiz_responses", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  question_id: integer("question_id")
    .notNull()
    .references(() => quizQuestions.id, { onDelete: "cascade" }),
  selected_answer: text("selected_answer").notNull(),
  is_correct: boolean("is_correct").notNull(),
  response_time: integer("response_time"), // in seconds
  created_at: timestamp("created_at").defaultNow(),
});

// Leaderboard table
export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // daily, weekly, monthly, all-time
  category: text("category").notNull(), // points, trading, quiz
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  created_at: timestamp("created_at").defaultNow(),
});

// Leaderboard Entries table
export const leaderboardEntries = pgTable(
  "leaderboard_entries",
  {
    id: serial("id").primaryKey(),
    leaderboard_id: integer("leaderboard_id")
      .notNull()
      .references(() => leaderboards.id, { onDelete: "cascade" }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    rank: integer("rank"),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      unique_leaderboard_user: unique().on(
        table.leaderboard_id,
        table.user_id
      ),
    };
  }
);

// Activity Log table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activity_type: text("activity_type").notNull(),
  description: text("description").notNull(),
  points_earned: integer("points_earned").default(0),
  metadata: json("metadata"),
  created_at: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  userAchievements: many(userAchievements),
  userChallenges: many(userChallenges),
  tradingSimulations: many(tradingSimulations),
  userQuizResponses: many(userQuizResponses),
  leaderboardEntries: many(leaderboardEntries),
  activityLogs: many(activityLogs),
  chatHistory: many(chatHistory),
  portfolioAssets: many(portfolioAssets),
  priceAlerts: many(priceAlerts),
  favorites: many(favorites),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.user_id],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievement_id],
    references: [achievements.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.user_id],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challenge_id],
    references: [challenges.id],
  }),
}));

export const tradingSimulationsRelations = relations(tradingSimulations, ({ one }) => ({
  user: one(users, {
    fields: [tradingSimulations.user_id],
    references: [users.id],
  }),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ many }) => ({
  userQuizResponses: many(userQuizResponses),
}));

export const userQuizResponsesRelations = relations(userQuizResponses, ({ one }) => ({
  user: one(users, {
    fields: [userQuizResponses.user_id],
    references: [users.id],
  }),
  question: one(quizQuestions, {
    fields: [userQuizResponses.question_id],
    references: [quizQuestions.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ many }) => ({
  leaderboardEntries: many(leaderboardEntries),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
  leaderboard: one(leaderboards, {
    fields: [leaderboardEntries.leaderboard_id],
    references: [leaderboards.id],
  }),
  user: one(users, {
    fields: [leaderboardEntries.user_id],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.user_id],
    references: [users.id],
  }),
}));

// Chat History table
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  model: text("model"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: json("metadata"),
});

// Chat History relations
export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
  user: one(users, {
    fields: [chatHistory.user_id],
    references: [users.id],
  }),
}));

// Portfolio Assets table
export const portfolioAssets = pgTable("portfolio_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // crypto, stock, etc.
  quantity: text("quantity").notNull(),
  purchasePrice: text("purchase_price").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Price Alerts table
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  targetPrice: text("target_price").notNull(),
  condition: text("condition").notNull(), // above, below
  active: boolean("active").default(true),
  triggered: boolean("triggered").default(false),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  name: text("name"),
  type: text("type").default("crypto"), // crypto, stock, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet Messages table
export const walletMessages = pgTable("wallet_messages", {
  id: serial("id").primaryKey(),
  sender_wallet: text("sender_wallet").notNull(),
  recipient_wallet: text("recipient_wallet").notNull(),
  message: text("message").notNull(),
  is_encrypted: boolean("is_encrypted").default(false),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow(),
  read_at: timestamp("read_at"),
  signature: text("signature"),
  metadata: json("metadata"),
});

// User Onboarding Profiles table
export const userOnboardingProfiles = pgTable("user_onboarding_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  
  // Core profile data
  crypto_experience_level: text("crypto_experience_level"),
  investor_type: json("investor_type"), // array - Renamed from investment_goals
  preferred_cryptocurrencies: json("preferred_cryptocurrencies"), // array of cryptos
  monthly_investment: text("monthly_investment"), // Renamed from initial_investment
  used_platforms: json("used_platforms"), // array - New field
  insight_preferences: json("insight_preferences"), // array - New field
  alert_preferences: text("alert_preferences"), // New field
  risk_tolerance: text("risk_tolerance"),
  nft_preferences: text("nft_preferences"), // New field
  timezone: text("timezone"),
  
  // Universal Access Code System fields
  unique_code: text("unique_code").unique(), // Generated access code
  user_category: text("user_category"), // BEGINNER, INTER, EXPERT, VIP, etc.
  unlocked_features: json("unlocked_features").default("[]"), // Features unlocked based on level
  referral_count: integer("referral_count").default(0), // Count of users who used this code as referral
  
  // Payment and level tracking
  unlocked_levels: json("unlocked_levels").default("[]"), // Array of unlocked level IDs
  stripe_customer_id: text("stripe_customer_id"), // Stripe customer ID for payments
  stripe_payment_history: json("stripe_payment_history").default("[]"), // Payment history
  last_payment_date: timestamp("last_payment_date"), // Last payment date
  subscription_status: text("subscription_status").default("free"), // free, paid, premium
  
  // QR Code access
  qr_code_url: text("qr_code_url"), // URL to the QR code for dashboard access
  last_access_date: timestamp("last_access_date"), // Last access date
  access_count: integer("access_count").default(0), // Number of times accessed
  
  // System fields
  onboarding_completed: boolean("onboarding_completed").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Token Watchlist table
export const tokenWatchlist = pgTable("token_watchlist", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contract_address: text("contract_address").notNull(),
  token_id: text("token_id"),
  chain: text("chain").notNull(),
  name: text("name"),
  description: text("description"),
  image_url: text("image_url"),
  collection_name: text("collection_name"),
  floor_price: text("floor_price"),
  last_price: text("last_price"),
  risk_score: integer("risk_score"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Relations for new tables
export const portfolioAssetsRelations = relations(portfolioAssets, ({ one }) => ({
  user: one(users, {
    fields: [portfolioAssets.userId],
    references: [users.id],
  }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, {
    fields: [priceAlerts.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

export const tokenWatchlistRelations = relations(tokenWatchlist, ({ one }) => ({
  user: one(users, {
    fields: [tokenWatchlist.user_id],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({
  id: true,
  timestamp: true,
});
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;

export const insertPortfolioAssetSchema = createInsertSchema(portfolioAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPortfolioAsset = z.infer<typeof insertPortfolioAssetSchema>;
export type PortfolioAsset = typeof portfolioAssets.$inferSelect;

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
});
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  created_at: true,
});
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlocked_at: true,
});
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  created_at: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  started_at: true,
});
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

export const insertTradingSimulationSchema = createInsertSchema(tradingSimulations).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertTradingSimulation = z.infer<typeof insertTradingSimulationSchema>;
export type TradingSimulation = typeof tradingSimulations.$inferSelect;

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  created_at: true,
});
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

export const insertUserQuizResponseSchema = createInsertSchema(userQuizResponses).omit({
  id: true,
  created_at: true,
});
export type InsertUserQuizResponse = z.infer<typeof insertUserQuizResponseSchema>;
export type UserQuizResponse = typeof userQuizResponses.$inferSelect;

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  created_at: true,
});
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  updated_at: true,
});
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  created_at: true,
});
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export const insertWalletMessageSchema = createInsertSchema(walletMessages).omit({
  id: true,
  created_at: true,
  read_at: true,
});
export type InsertWalletMessage = z.infer<typeof insertWalletMessageSchema>;
export type WalletMessage = typeof walletMessages.$inferSelect;

export const insertTokenWatchlist = createInsertSchema(tokenWatchlist).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertTokenWatchlist = z.infer<typeof insertTokenWatchlist>;
export type TokenWatchlist = typeof tokenWatchlist.$inferSelect;

export const insertUserOnboardingProfileSchema = createInsertSchema(userOnboardingProfiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertUserOnboardingProfile = z.infer<typeof insertUserOnboardingProfileSchema>;
export type UserOnboardingProfile = typeof userOnboardingProfiles.$inferSelect;