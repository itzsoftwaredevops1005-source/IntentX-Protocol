import { storage } from "./storage";
import { blockchainService } from "./web3-service";

/**
 * Intent Executor Bot
 * Monitors pending intents and executes them when optimal conditions are met
 */
export class IntentExecutor {
  private isRunning = false;
  private checkInterval = 5000; // Check every 5 seconds
  private blockchainEnabled = false;

  constructor() {}

  /**
   * Start the executor bot
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Executor bot is already running");
      return;
    }

    // Check if blockchain is available
    try {
      this.blockchainEnabled = await blockchainService.isContractDeployed();
      if (this.blockchainEnabled) {
        console.log("✅ Executor bot will use blockchain integration");
      } else {
        console.log("⚠️  Executor bot running in simulation mode (no blockchain)");
      }
    } catch (error) {
      console.log("⚠️  Executor bot running in simulation mode (blockchain unavailable)");
    }

    this.isRunning = true;
    console.log("🤖 Intent Executor Bot started");
    console.log(`⏰ Checking for pending intents every ${this.checkInterval / 1000}s`);
    console.log(`👤 Executor address: ${blockchainService.getExecutorAddress()}\n`);

    this.execute();
  }

  /**
   * Stop the executor bot
   */
  stop() {
    this.isRunning = false;
    console.log("🛑 Intent Executor Bot stopped");
  }

  /**
   * Main execution loop
   */
  private async execute() {
    while (this.isRunning) {
      try {
        await this.processPendingIntents();
      } catch (error) {
        console.error("❌ Error processing intents:", error);
      }

      // Wait for next iteration
      await new Promise(resolve => setTimeout(resolve, this.checkInterval));
    }
  }

  /**
   * Process all pending intents
   */
  private async processPendingIntents() {
    const pendingIntents = await storage.getPendingIntents();

    if (pendingIntents.length === 0) {
      return;
    }

    console.log(`📊 Found ${pendingIntents.length} pending intent(s)`);

    for (const intent of pendingIntents) {
      try {
        // Simulate checking if conditions are met
        const shouldExecute = await this.shouldExecuteIntent(intent);

        if (shouldExecute) {
          await this.executeIntent(intent);
        }
      } catch (error) {
        console.error(`❌ Error processing intent ${intent.id}:`, error);
      }
    }
  }

  /**
   * Determine if an intent should be executed
   * In production, this would check:
   * - Market prices
   * - Liquidity availability
   * - Gas prices
   * - Time-based conditions
   */
  private async shouldExecuteIntent(intent: any): Promise<boolean> {
    // For demo purposes, execute after 10 seconds
    const intentAge = Date.now() - intent.createdAt.getTime();
    const shouldExecute = intentAge > 10000; // 10 seconds

    return shouldExecute;
  }

  /**
   * Execute an intent
   * In production, this would:
   * - Find optimal route through DEX aggregators
   * - Execute the swap
   * - Handle slippage protection
   * - Emit events
   */
  private async executeIntent(intent: any) {
    console.log(`\n⚡ Executing intent ${intent.id.substring(0, 8)}...`);
    console.log(`   ${intent.sourceAmount} ${intent.sourceToken} → ${intent.targetToken}`);

    try {
      // Simulate getting exchange rate
      const exchangeRate = await this.getExchangeRate(
        intent.sourceToken,
        intent.targetToken
      );

      // Calculate output amount
      const sourceAmount = parseFloat(intent.sourceAmount);
      const executedAmount = (sourceAmount * exchangeRate).toFixed(6);

      // Verify against minimum
      const minAmount = parseFloat(intent.minTargetAmount);
      if (parseFloat(executedAmount) < minAmount) {
        console.log(`   ⚠️  Output ${executedAmount} < minimum ${minAmount}, skipping`);
        return;
      }

      // Check slippage
      const slippagePercent = parseFloat(intent.slippage);
      const maxSlippage = (minAmount * slippagePercent) / 100;
      const actualSlippage = Math.abs(parseFloat(executedAmount) - minAmount);

      if (actualSlippage > maxSlippage) {
        console.log(`   ⚠️  Slippage ${actualSlippage.toFixed(6)} exceeds max ${maxSlippage.toFixed(6)}, skipping`);
        return;
      }

      // Execute on blockchain if enabled and has blockchain ID
      if (this.blockchainEnabled && intent.blockchainIntentId) {
        try {
          const txHash = await blockchainService.executeIntentOnChain(
            intent.blockchainIntentId,
            executedAmount
          );
          console.log(`   🔗 Blockchain TX: ${txHash.substring(0, 10)}...`);
        } catch (error: any) {
          console.error(`   ❌ Blockchain execution failed:`, error.message);
          // Don't update storage if blockchain execution fails
          return;
        }
      }

      // Update storage
      const result = await storage.updateIntentStatus(
        intent.id,
        "executed",
        executedAmount
      );

      if (result) {
        console.log(`   ✅ Intent executed successfully!`);
        console.log(`   📈 Received: ${executedAmount} ${intent.targetToken}`);
        console.log(`   💰 Rate: 1 ${intent.sourceToken} = ${exchangeRate.toFixed(2)} ${intent.targetToken}\n`);
      }
    } catch (error) {
      console.error(`   ❌ Execution failed:`, error);
    }
  }

  /**
   * Get exchange rate between two tokens
   * In production, this would query DEX aggregators, oracles, etc.
   */
  private async getExchangeRate(
    fromToken: string,
    toToken: string
  ): Promise<number> {
    // Mock exchange rates
    const rates: Record<string, Record<string, number>> = {
      ETH: {
        USDC: 1850,
        USDT: 1845,
        DAI: 1848,
        WBTC: 0.042,
      },
      WBTC: {
        ETH: 23.8,
        USDC: 44000,
        USDT: 43950,
        DAI: 43980,
      },
      USDC: {
        ETH: 0.00054,
        WBTC: 0.0000227,
        USDT: 0.9998,
        DAI: 0.9997,
      },
      USDT: {
        ETH: 0.000542,
        WBTC: 0.0000228,
        USDC: 1.0002,
        DAI: 0.9999,
      },
      DAI: {
        ETH: 0.000541,
        WBTC: 0.0000227,
        USDC: 1.0003,
        USDT: 1.0001,
      },
    };

    // Add some randomness to simulate market fluctuations
    const baseRate = rates[fromToken]?.[toToken] || 1;
    const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
    return baseRate * (1 + fluctuation);
  }
}

// Export singleton instance
export const executorBot = new IntentExecutor();
