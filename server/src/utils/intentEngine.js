/**
 * Intent Engine
 * Core business logic for intent processing and route optimization
 */

const fs = require('fs');
const path = require('path');
const blockchainSim = require('./blockchainSim');

const DATA_FILE = path.join(__dirname, '../data/intents.json');

class IntentEngine {
  constructor() {
    this.intents = [];
    this.nextId = 1;
    this.loadIntents();
  }

  /**
   * Load intents from JSON file
   */
  loadIntents() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        this.intents = data.intents || [];
        this.nextId = data.nextId || 1;
      }
    } catch (error) {
      console.error('Error loading intents:', error);
      this.intents = [];
      this.nextId = 1;
    }
  }

  /**
   * Save intents to JSON file
   */
  saveIntents() {
    try {
      const data = {
        intents: this.intents,
        nextId: this.nextId,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving intents:', error);
    }
  }

  /**
   * Create a new intent
   */
  async createIntent(intentData) {
    try {
      const intent = {
        id: this.nextId++,
        intentId: blockchainSim.generateIntentId(
          intentData.user || '0x0000000000000000000000000000000000000000',
          intentData.sourceToken,
          intentData.targetToken,
          intentData.sourceAmount
        ),
        user: intentData.user || '0x0000000000000000000000000000000000000000',
        sourceToken: intentData.sourceToken,
        targetToken: intentData.targetToken,
        sourceAmount: intentData.sourceAmount,
        minTargetAmount: intentData.minTargetAmount,
        slippage: intentData.slippage || 0.5,
        status: 'pending',
        createdAt: new Date().toISOString(),
        executedAt: null,
        txHash: null,
        executorAddress: null,
        actualTargetAmount: null,
        route: null,
        signature: intentData.signature || null,
      };

      // Simulate blockchain registration
      const blockchainResult = await blockchainSim.registerIntentOnChain({
        user: intent.user,
        sourceToken: intent.sourceToken,
        targetToken: intent.targetToken,
        sourceAmount: intent.sourceAmount,
        minTargetAmount: intent.minTargetAmount,
        slippage: intent.slippage,
        signature: intent.signature,
      });

      if (blockchainResult.success) {
        intent.txHash = blockchainResult.txHash;
        intent.intentId = blockchainResult.intentId;
      }

      // Calculate optimal route (mock AI optimization)
      intent.route = this.calculateOptimalRoute(
        intent.sourceToken,
        intent.targetToken,
        intent.sourceAmount
      );

      this.intents.push(intent);
      this.saveIntents();

      return {
        success: true,
        intent,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate optimal route (mock AI-powered optimization)
   */
  calculateOptimalRoute(sourceToken, targetToken, sourceAmount) {
    // Mock route calculation
    // In Wave 3, this will use real DEX aggregators and AI optimization
    const routes = [
      {
        path: [sourceToken, targetToken],
        protocol: 'UniswapV3',
        estimatedOutput: parseFloat(sourceAmount) * 0.98,
        gasEstimate: '150000',
        confidence: 0.95,
      },
      {
        path: [sourceToken, '0xUSDC', targetToken],
        protocol: 'SushiSwap',
        estimatedOutput: parseFloat(sourceAmount) * 0.97,
        gasEstimate: '200000',
        confidence: 0.92,
      },
    ];

    // Return best route (highest output)
    return routes.sort((a, b) => b.estimatedOutput - a.estimatedOutput)[0];
  }

  /**
   * Get all intents
   */
  getAllIntents() {
    return this.intents;
  }

  /**
   * Get intent by ID
   */
  getIntentById(id) {
    return this.intents.find(intent => intent.id === parseInt(id));
  }

  /**
   * Get intent by intentId (blockchain ID)
   */
  getIntentByIntentId(intentId) {
    return this.intents.find(intent => intent.intentId === intentId);
  }

  /**
   * Get intents by user address
   */
  getIntentsByUser(userAddress) {
    return this.intents.filter(intent => 
      intent.user.toLowerCase() === userAddress.toLowerCase()
    );
  }

  /**
   * Get pending intents
   */
  getPendingIntents() {
    return this.intents.filter(intent => intent.status === 'pending');
  }

  /**
   * Execute intent
   */
  async executeIntent(id) {
    try {
      const intent = this.getIntentById(id);
      if (!intent) {
        return { success: false, error: 'Intent not found' };
      }

      if (intent.status !== 'pending') {
        return { success: false, error: 'Intent not in pending status' };
      }

      // Update status to executing
      intent.status = 'executing';
      this.saveIntents();

      // Simulate blockchain execution
      const targetAmount = intent.route.estimatedOutput.toString();
      const executionResult = await blockchainSim.executeIntentOnChain(
        intent.intentId,
        targetAmount
      );

      if (executionResult.success) {
        intent.status = 'completed';
        intent.executedAt = new Date().toISOString();
        intent.txHash = executionResult.txHash;
        intent.executorAddress = blockchainSim.getExecutorAddress();
        intent.actualTargetAmount = executionResult.actualTargetAmount;
      } else {
        intent.status = 'failed';
      }

      this.saveIntents();

      return {
        success: true,
        intent,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cancel intent
   */
  async cancelIntent(id) {
    try {
      const intent = this.getIntentById(id);
      if (!intent) {
        return { success: false, error: 'Intent not found' };
      }

      if (intent.status !== 'pending') {
        return { success: false, error: 'Only pending intents can be cancelled' };
      }

      intent.status = 'cancelled';
      intent.executedAt = new Date().toISOString();
      this.saveIntents();

      return {
        success: true,
        intent,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get intent statistics
   */
  getStatistics() {
    const total = this.intents.length;
    const pending = this.intents.filter(i => i.status === 'pending').length;
    const executing = this.intents.filter(i => i.status === 'executing').length;
    const completed = this.intents.filter(i => i.status === 'completed').length;
    const cancelled = this.intents.filter(i => i.status === 'cancelled').length;
    const failed = this.intents.filter(i => i.status === 'failed').length;

    const totalVolume = this.intents
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + parseFloat(i.sourceAmount), 0);

    return {
      total,
      pending,
      executing,
      completed,
      cancelled,
      failed,
      totalVolume: totalVolume.toFixed(2),
      executorAddress: blockchainSim.getExecutorAddress(),
    };
  }
}

// Export singleton instance
const intentEngine = new IntentEngine();

module.exports = intentEngine;
