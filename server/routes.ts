import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { blockchainService } from "./web3-service";
import { insertIntentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if blockchain is available
  let blockchainEnabled = false;
  try {
    blockchainEnabled = await blockchainService.isContractDeployed();
    if (blockchainEnabled) {
      console.log("✅ Blockchain integration enabled");
    } else {
      console.log("⚠️  Contract not deployed. Using in-memory mode.");
    }
  } catch (error) {
    console.log("⚠️  Blockchain unavailable. Using in-memory mode.");
  }

  // Get all intents for a user
  app.get("/api/intents/:userAddress", async (req, res) => {
    try {
      const { userAddress } = req.params;
      const intents = await storage.getIntentsByUser(userAddress);
      res.json(intents);
    } catch (error) {
      console.error("Error fetching intents:", error);
      res.status(500).json({ error: "Failed to fetch intents" });
    }
  });

  // Get a single intent by ID
  app.get("/api/intent/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const intent = await storage.getIntent(id);
      
      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }
      
      res.json(intent);
    } catch (error) {
      console.error("Error fetching intent:", error);
      res.status(500).json({ error: "Failed to fetch intent" });
    }
  });

  // Create a new intent
  app.post("/api/intents", async (req, res) => {
    try {
      const validated = insertIntentSchema.parse(req.body);
      
      // Create comprehensive message with all fields and timestamp
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "createIntent",
        sourceToken: validated.sourceToken,
        targetToken: validated.targetToken,
        sourceAmount: validated.sourceAmount,
        minTargetAmount: validated.minTargetAmount,
        slippage: validated.slippage,
        timestamp,
      });
      
      let recoveredAddress: string;
      
      try {
        recoveredAddress = blockchainService.verifySignature(message, validated.signature);
      } catch (error) {
        return res.status(400).json({ error: "Invalid signature" });
      }

      // Verify that the recovered address matches the claimed user address
      if (recoveredAddress.toLowerCase() !== validated.userAddress.toLowerCase()) {
        return res.status(403).json({ 
          error: "Signature mismatch",
          details: "The signature does not match the claimed wallet address"
        });
      }

      // If blockchain is enabled, create intent on-chain
      let blockchainIntentId: string | undefined;
      if (blockchainEnabled) {
        try {
          const result = await blockchainService.createIntentOnChain(
            validated.sourceToken,
            validated.targetToken,
            validated.sourceAmount,
            validated.minTargetAmount,
            validated.slippage,
            validated.signature
          );
          blockchainIntentId = result.intentId;
          console.log(`📝 Intent created on-chain: ${result.txHash}`);
        } catch (error: any) {
          console.error("Blockchain error:", error);
          return res.status(500).json({ 
            error: "Failed to create intent on blockchain",
            details: error.message
          });
        }
      }

      // Store in local storage with blockchain ID
      const intent = await storage.createIntent(validated, blockchainIntentId);
      
      res.status(201).json(intent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid intent data", details: error.errors });
      }
      console.error("Error creating intent:", error);
      res.status(500).json({ error: "Failed to create intent" });
    }
  });

  // Cancel an intent
  app.post("/api/intents/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get intent to find blockchain ID
      const intent = await storage.getIntent(id);
      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }

      if (intent.status !== "pending") {
        return res.status(400).json({ error: "Intent is not pending" });
      }
      
      // If blockchain is enabled and has blockchain ID, cancel on-chain
      if (blockchainEnabled && intent.blockchainIntentId) {
        try {
          const txHash = await blockchainService.cancelIntentOnChain(intent.blockchainIntentId);
          console.log(`❌ Intent cancelled on-chain: ${txHash}`);
        } catch (error: any) {
          console.error("Blockchain cancel error:", error);
          return res.status(500).json({
            error: "Failed to cancel intent on blockchain",
            details: error.message
          });
        }
      }

      const updatedIntent = await storage.cancelIntent(id);
      res.json(updatedIntent);
    } catch (error) {
      console.error("Error cancelling intent:", error);
      res.status(500).json({ error: "Failed to cancel intent" });
    }
  });

  // Execute an intent (called by executor bot)
  app.post("/api/intents/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const { executedAmount } = req.body;
      
      if (!executedAmount) {
        return res.status(400).json({ error: "executedAmount is required" });
      }

      // Get intent to find blockchain ID
      const intent = await storage.getIntent(id);
      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }

      if (intent.status !== "pending") {
        return res.status(400).json({ error: "Intent is not pending" });
      }

      // If blockchain is enabled and has blockchain ID, execute on-chain
      if (blockchainEnabled && intent.blockchainIntentId) {
        try {
          const txHash = await blockchainService.executeIntentOnChain(
            intent.blockchainIntentId,
            executedAmount
          );
          console.log(`✅ Intent executed on-chain: ${txHash}`);
        } catch (error: any) {
          console.error("Blockchain execute error:", error);
          return res.status(500).json({
            error: "Failed to execute intent on blockchain",
            details: error.message
          });
        }
      }
      
      const updatedIntent = await storage.updateIntentStatus(id, "executed", executedAmount);
      res.json(updatedIntent);
    } catch (error) {
      console.error("Error executing intent:", error);
      res.status(500).json({ error: "Failed to execute intent" });
    }
  });

  // Get all pending intents (for executor bot)
  app.get("/api/intents-pending", async (req, res) => {
    try {
      const intents = await storage.getPendingIntents();
      res.json(intents);
    } catch (error) {
      console.error("Error fetching pending intents:", error);
      res.status(500).json({ error: "Failed to fetch pending intents" });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const { userAddress } = req.query;
      
      let intents;
      if (userAddress && typeof userAddress === 'string') {
        intents = await storage.getIntentsByUser(userAddress);
      } else {
        // For global analytics, get all intents
        const pending = await storage.getPendingIntents();
        // This is a simplified way - in production you'd have a better method
        intents = pending;
      }
      
      const total = intents.length;
      const executed = intents.filter(i => i.status === "executed").length;
      const pending = intents.filter(i => i.status === "pending").length;
      const cancelled = intents.filter(i => i.status === "cancelled").length;
      
      // Calculate total volume (simplified)
      const volume = intents
        .filter(i => i.status === "executed")
        .reduce((sum, i) => sum + parseFloat(i.executedAmount || "0"), 0);
      
      const successRate = total > 0 ? ((executed / total) * 100).toFixed(1) : "0.0";
      
      res.json({
        totalIntents: total,
        executedSwaps: executed,
        pendingIntents: pending,
        cancelledIntents: cancelled,
        totalVolume: volume.toFixed(2),
        successRate: parseFloat(successRate),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
