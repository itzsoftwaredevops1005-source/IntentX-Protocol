import { type User, type InsertUser, type Intent, type InsertIntent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Intent methods
  createIntent(intent: InsertIntent, blockchainIntentId?: string): Promise<Intent>;
  getIntent(id: string): Promise<Intent | undefined>;
  getIntentByBlockchainId(blockchainIntentId: string): Promise<Intent | undefined>;
  getIntentsByUser(userAddress: string): Promise<Intent[]>;
  updateIntentStatus(id: string, status: string, executedAmount?: string): Promise<Intent | undefined>;
  cancelIntent(id: string): Promise<Intent | undefined>;
  getPendingIntents(): Promise<Intent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private intents: Map<string, Intent>;

  constructor() {
    this.users = new Map();
    this.intents = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Intent methods
  async createIntent(insertIntent: InsertIntent, blockchainIntentId?: string): Promise<Intent> {
    const id = randomUUID();
    const now = new Date();
    const intent: Intent = {
      id,
      ...insertIntent,
      blockchainIntentId: blockchainIntentId || null,
      status: insertIntent.status || "pending",
      createdAt: now,
      executedAt: null,
      executedAmount: null,
    };
    this.intents.set(id, intent);
    return intent;
  }

  async getIntent(id: string): Promise<Intent | undefined> {
    return this.intents.get(id);
  }

  async getIntentByBlockchainId(blockchainIntentId: string): Promise<Intent | undefined> {
    return Array.from(this.intents.values()).find(
      intent => intent.blockchainIntentId === blockchainIntentId
    );
  }

  async getIntentsByUser(userAddress: string): Promise<Intent[]> {
    return Array.from(this.intents.values())
      .filter(intent => intent.userAddress.toLowerCase() === userAddress.toLowerCase())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateIntentStatus(
    id: string, 
    status: string, 
    executedAmount?: string
  ): Promise<Intent | undefined> {
    const intent = this.intents.get(id);
    if (!intent) return undefined;

    const updatedIntent: Intent = {
      ...intent,
      status,
      executedAmount: executedAmount || intent.executedAmount,
      executedAt: status === "executed" ? new Date() : intent.executedAt,
    };
    
    this.intents.set(id, updatedIntent);
    return updatedIntent;
  }

  async cancelIntent(id: string): Promise<Intent | undefined> {
    const intent = this.intents.get(id);
    if (!intent || intent.status !== "pending") return undefined;
    
    return this.updateIntentStatus(id, "cancelled");
  }

  async getPendingIntents(): Promise<Intent[]> {
    return Array.from(this.intents.values())
      .filter(intent => intent.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
