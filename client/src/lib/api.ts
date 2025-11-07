import type { Intent, InsertIntent } from "@shared/schema";

const API_BASE = "/api";

export interface Analytics {
  totalIntents: number;
  executedSwaps: number;
  pendingIntents: number;
  cancelledIntents: number;
  totalVolume: string;
  successRate: number;
}

export async function createIntent(intent: Omit<InsertIntent, 'signature'> & { signature: string }): Promise<Intent> {
  const response = await fetch(`${API_BASE}/intents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intent),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create intent");
  }

  return response.json();
}

export async function getIntentsByUser(userAddress: string): Promise<Intent[]> {
  const response = await fetch(`${API_BASE}/intents/${userAddress}`);

  if (!response.ok) {
    throw new Error("Failed to fetch intents");
  }

  return response.json();
}

export async function getIntent(id: string): Promise<Intent> {
  const response = await fetch(`${API_BASE}/intent/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch intent");
  }

  return response.json();
}

export async function cancelIntent(id: string): Promise<Intent> {
  const response = await fetch(`${API_BASE}/intents/${id}/cancel`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel intent");
  }

  return response.json();
}

export async function getAnalytics(userAddress?: string): Promise<Analytics> {
  const url = userAddress 
    ? `${API_BASE}/analytics?userAddress=${userAddress}`
    : `${API_BASE}/analytics`;
    
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
}
