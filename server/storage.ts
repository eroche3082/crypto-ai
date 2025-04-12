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
      .select({
        id: portfolioAssets.id,
        userId: portfolioAssets.userId,
        symbol: portfolioAssets.symbol,
        name: portfolioAssets.name, 
        quantity: portfolioAssets.quantity,
        purchasePrice: portfolioAssets.purchasePrice,
        purchaseDate: portfolioAssets.purchaseDate,
        createdAt: portfolioAssets.createdAt,
        updatedAt: portfolioAssets.updatedAt
      })
      .from(portfolioAssets)
      .where(eq(portfolioAssets.userId, userId));
  }
  
  async getPortfolioAsset(id: number): Promise<PortfolioAsset | undefined> {
    const [asset] = await db
      .select({
        id: portfolioAssets.id,
        userId: portfolioAssets.userId,
        symbol: portfolioAssets.symbol,
        name: portfolioAssets.name,
        quantity: portfolioAssets.quantity,
        purchasePrice: portfolioAssets.purchasePrice,
        purchaseDate: portfolioAssets.purchaseDate,
        createdAt: portfolioAssets.createdAt,
        updatedAt: portfolioAssets.updatedAt
      })
      .from(portfolioAssets)
      .where(eq(portfolioAssets.id, id));
    return asset;
  }
  
  async createPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    // Omitimos el campo 'type' que no existe en la base de datos real
    const [newAsset] = await db
      .insert(portfolioAssets)
      .values({
        userId: asset.userId,
        symbol: asset.symbol,
        name: asset.name,
        quantity: asset.quantity,
        purchasePrice: asset.purchasePrice,
        purchaseDate: asset.purchaseDate
      })
      .returning({
        id: portfolioAssets.id,
        userId: portfolioAssets.userId,
        symbol: portfolioAssets.symbol,
        name: portfolioAssets.name,
        quantity: portfolioAssets.quantity,
        purchasePrice: portfolioAssets.purchasePrice,
        purchaseDate: portfolioAssets.purchaseDate,
        createdAt: portfolioAssets.createdAt,
        updatedAt: portfolioAssets.updatedAt
      });
    return newAsset;
  }
  
  async updatePortfolioAsset(id: number, updates: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset | undefined> {
    // Creamos un objeto con sólo los campos que existen en la base de datos
    const validUpdates: Partial<InsertPortfolioAsset> = {};
    if (updates.name !== undefined) validUpdates.name = updates.name;
    if (updates.symbol !== undefined) validUpdates.symbol = updates.symbol;
    if (updates.quantity !== undefined) validUpdates.quantity = updates.quantity;
    if (updates.purchasePrice !== undefined) validUpdates.purchasePrice = updates.purchasePrice;
    if (updates.purchaseDate !== undefined) validUpdates.purchaseDate = updates.purchaseDate;
    
    const [updatedAsset] = await db
      .update(portfolioAssets)
      .set(validUpdates)
      .where(eq(portfolioAssets.id, id))
      .returning({
        id: portfolioAssets.id,
        userId: portfolioAssets.userId,
        symbol: portfolioAssets.symbol,
        name: portfolioAssets.name,
        quantity: portfolioAssets.quantity,
        purchasePrice: portfolioAssets.purchasePrice,
        purchaseDate: portfolioAssets.purchaseDate,
        createdAt: portfolioAssets.createdAt,
        updatedAt: portfolioAssets.updatedAt
      });
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
      .select({
        id: priceAlerts.id,
        userId: priceAlerts.userId,
        symbol: priceAlerts.symbol,
        targetPrice: priceAlerts.targetPrice,
        condition: priceAlerts.condition,
        active: priceAlerts.active,
        triggered: priceAlerts.triggered,
        triggeredAt: priceAlerts.triggeredAt,
        createdAt: priceAlerts.createdAt
      })
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, userId));
  }
  
  async getPriceAlert(id: number): Promise<PriceAlert | undefined> {
    const [alert] = await db
      .select({
        id: priceAlerts.id,
        userId: priceAlerts.userId,
        symbol: priceAlerts.symbol,
        targetPrice: priceAlerts.targetPrice,
        condition: priceAlerts.condition,
        active: priceAlerts.active,
        triggered: priceAlerts.triggered,
        triggeredAt: priceAlerts.triggeredAt,
        createdAt: priceAlerts.createdAt
      })
      .from(priceAlerts)
      .where(eq(priceAlerts.id, id));
    return alert;
  }
  
  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [newAlert] = await db
      .insert(priceAlerts)
      .values({
        userId: alert.userId,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        active: alert.active,
        triggered: alert.triggered
      })
      .returning({
        id: priceAlerts.id,
        userId: priceAlerts.userId,
        symbol: priceAlerts.symbol,
        targetPrice: priceAlerts.targetPrice,
        condition: priceAlerts.condition,
        active: priceAlerts.active,
        triggered: priceAlerts.triggered,
        triggeredAt: priceAlerts.triggeredAt,
        createdAt: priceAlerts.createdAt
      });
    return newAlert;
  }
  
  async updatePriceAlert(id: number, updates: Partial<InsertPriceAlert>): Promise<PriceAlert | undefined> {
    // Creamos un objeto con sólo los campos que existen en la base de datos
    const validUpdates: Partial<InsertPriceAlert> = {};
    if (updates.symbol !== undefined) validUpdates.symbol = updates.symbol;
    if (updates.targetPrice !== undefined) validUpdates.targetPrice = updates.targetPrice;
    if (updates.condition !== undefined) validUpdates.condition = updates.condition;
    if (updates.active !== undefined) validUpdates.active = updates.active;
    if (updates.triggered !== undefined) validUpdates.triggered = updates.triggered;
    
    const [updatedAlert] = await db
      .update(priceAlerts)
      .set(validUpdates)
      .where(eq(priceAlerts.id, id))
      .returning({
        id: priceAlerts.id,
        userId: priceAlerts.userId,
        symbol: priceAlerts.symbol,
        targetPrice: priceAlerts.targetPrice,
        condition: priceAlerts.condition,
        active: priceAlerts.active,
        triggered: priceAlerts.triggered,
        triggeredAt: priceAlerts.triggeredAt,
        createdAt: priceAlerts.createdAt
      });
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
      .returning({
        id: priceAlerts.id,
        userId: priceAlerts.userId,
        symbol: priceAlerts.symbol,
        targetPrice: priceAlerts.targetPrice,
        condition: priceAlerts.condition,
        active: priceAlerts.active,
        triggered: priceAlerts.triggered,
        triggeredAt: priceAlerts.triggeredAt,
        createdAt: priceAlerts.createdAt
      });
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
      .select({
        id: chatHistory.id,
        userId: chatHistory.userId,
        role: chatHistory.role,
        content: chatHistory.content,
        model: chatHistory.model,
        timestamp: chatHistory.timestamp,
        metadata: chatHistory.metadata
      })
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(chatHistory.timestamp);
  }
  
  async createChatMessage(message: InsertChatHistory): Promise<ChatHistory> {
    const [newMessage] = await db
      .insert(chatHistory)
      .values({
        userId: message.userId,
        role: message.role,
        content: message.content,
        model: message.model,
        metadata: message.metadata
      })
      .returning({
        id: chatHistory.id,
        userId: chatHistory.userId,
        role: chatHistory.role,
        content: chatHistory.content,
        model: chatHistory.model,
        timestamp: chatHistory.timestamp,
        metadata: chatHistory.metadata
      });
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
    // Use explicit column selection to avoid issues with schema differences
    return await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        symbol: favorites.symbol,
        name: favorites.name,
        createdAt: favorites.createdAt
      })
      .from(favorites)
      .where(eq(favorites.userId, userId));
  }
  
  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values({
        userId: favorite.userId,
        symbol: favorite.symbol,
        name: favorite.name
      })
      .returning({
        id: favorites.id,
        userId: favorites.userId,
        symbol: favorites.symbol,
        name: favorites.name,
        createdAt: favorites.createdAt
      });
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
      .select({ id: favorites.id })
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
