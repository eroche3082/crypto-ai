import { 
  users, type User, type InsertUser,
  portfolioAssets, type PortfolioAsset, type InsertPortfolioAsset,
  priceAlerts, type PriceAlert, type InsertPriceAlert,
  chatHistory, type ChatHistory, type InsertChatHistory,
  favorites, type Favorite, type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;
  
  // Portfolio methods
  getPortfolioAssets(userId: number): Promise<PortfolioAsset[]>;
  getPortfolioAsset(id: number): Promise<PortfolioAsset | undefined>;
  createPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset>;
  updatePortfolioAsset(id: number, updates: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset | undefined>;
  deletePortfolioAsset(id: number): Promise<boolean>;
  
  // Price alert methods
  getPriceAlerts(userId: number): Promise<PriceAlert[]>;
  getPriceAlert(id: number): Promise<PriceAlert | undefined>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updatePriceAlert(id: number, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined>;
  markAlertAsTriggered(id: number): Promise<PriceAlert | undefined>;
  deletePriceAlert(id: number): Promise<boolean>;
  
  // Chat history methods
  getChatHistory(userId: number): Promise<ChatHistory[]>;
  createChatMessage(message: InsertChatHistory): Promise<ChatHistory>;
  deleteChatHistory(userId: number): Promise<boolean>;
  
  // Favorites methods
  getFavorites(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;
  checkFavorite(userId: number, symbol: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ preferences: { stripeCustomerId: customerId } })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        preferences: { 
          stripeCustomerId: stripeInfo.customerId,
          stripeSubscriptionId: stripeInfo.subscriptionId
        } 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  // Portfolio methods
  async getPortfolioAssets(userId: number): Promise<PortfolioAsset[]> {
    return await db
      .select()
      .from(portfolioAssets)
      .where(eq(portfolioAssets.userId, userId));
  }
  
  async getPortfolioAsset(id: number): Promise<PortfolioAsset | undefined> {
    const [asset] = await db
      .select()
      .from(portfolioAssets)
      .where(eq(portfolioAssets.id, id));
    return asset;
  }
  
  async createPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    const [newAsset] = await db
      .insert(portfolioAssets)
      .values(asset)
      .returning();
    return newAsset;
  }
  
  async updatePortfolioAsset(id: number, updates: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset | undefined> {
    const [updatedAsset] = await db
      .update(portfolioAssets)
      .set(updates)
      .where(eq(portfolioAssets.id, id))
      .returning();
    return updatedAsset;
  }
  
  async deletePortfolioAsset(id: number): Promise<boolean> {
    const result = await db
      .delete(portfolioAssets)
      .where(eq(portfolioAssets.id, id));
    return true;
  }
  
  // Price alert methods
  async getPriceAlerts(userId: number): Promise<PriceAlert[]> {
    return await db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, userId));
  }
  
  async getPriceAlert(id: number): Promise<PriceAlert | undefined> {
    const [alert] = await db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.id, id));
    return alert;
  }
  
  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [newAlert] = await db
      .insert(priceAlerts)
      .values(alert)
      .returning();
    return newAlert;
  }
  
  async updatePriceAlert(id: number, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined> {
    const [updatedAlert] = await db
      .update(priceAlerts)
      .set(updates)
      .where(eq(priceAlerts.id, id))
      .returning();
    return updatedAlert;
  }
  
  async markAlertAsTriggered(id: number): Promise<PriceAlert | undefined> {
    const [updatedAlert] = await db
      .update(priceAlerts)
      .set({ 
        triggered: true, 
        triggeredAt: new Date(),
        active: false 
      })
      .where(eq(priceAlerts.id, id))
      .returning();
    return updatedAlert;
  }
  
  async deletePriceAlert(id: number): Promise<boolean> {
    await db
      .delete(priceAlerts)
      .where(eq(priceAlerts.id, id));
    return true;
  }
  
  // Chat history methods
  async getChatHistory(userId: number): Promise<ChatHistory[]> {
    return await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(chatHistory.timestamp);
  }
  
  async createChatMessage(message: InsertChatHistory): Promise<ChatHistory> {
    const [newMessage] = await db
      .insert(chatHistory)
      .values(message)
      .returning();
    return newMessage;
  }
  
  async deleteChatHistory(userId: number): Promise<boolean> {
    await db
      .delete(chatHistory)
      .where(eq(chatHistory.userId, userId));
    return true;
  }
  
  // Favorites methods
  async getFavorites(userId: number): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));
  }
  
  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }
  
  async deleteFavorite(id: number): Promise<boolean> {
    await db
      .delete(favorites)
      .where(eq(favorites.id, id));
    return true;
  }
  
  async checkFavorite(userId: number, symbol: string): Promise<boolean> {
    const result = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.symbol, symbol)
        )
      );
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
