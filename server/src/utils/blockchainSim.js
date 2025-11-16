/**
 * Blockchain Simulation Utility
 * Simulates blockchain interactions for Wave 2 demo
 */

const { ethers } = require('ethers');

class BlockchainSimulator {
  constructor() {
    this.mockProvider = null;
    this.mockWallet = null;
    this.transactionCounter = 0;
  }

  /**
   * Initialize mock blockchain provider
   */
  initialize() {
    try {
      // Create mock provider (local hardhat network simulation)
      this.mockProvider = new ethers.JsonRpcProvider('http://localhost:8545');
      
      // Create mock wallet for executor
      this.mockWallet = ethers.Wallet.createRandom().connect(this.mockProvider);
      
      console.log('🔗 Blockchain Simulator initialized');
      console.log('   Mock Executor:', this.mockWallet.address);
    } catch (error) {
      console.warn('⚠️  Blockchain simulator running in offline mode');
    }
  }

  /**
   * Generate mock transaction hash
   */
  generateTxHash() {
    this.transactionCounter++;
    return ethers.keccak256(
      ethers.toUtf8Bytes(`tx-${Date.now()}-${this.transactionCounter}`)
    );
  }

  /**
   * Generate mock intent ID
   */
  generateIntentId(user, sourceToken, targetToken, sourceAmount) {
    return ethers.keccak256(
      ethers.toUtf8Bytes(
        `${user}-${sourceToken}-${targetToken}-${sourceAmount}-${Date.now()}`
      )
    );
  }

  /**
   * Simulate signature verification
   */
  async verifySignature(message, signature, expectedAddress) {
    try {
      if (!signature || signature.length < 130) {
        return { valid: false, error: 'Invalid signature format' };
      }

      // In real implementation, this would verify on-chain signature
      // For demo, we simulate successful verification
      return {
        valid: true,
        recoveredAddress: expectedAddress || this.mockWallet.address,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Simulate intent registration on blockchain
   */
  async registerIntentOnChain(intentData) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const intentId = this.generateIntentId(
        intentData.user,
        intentData.sourceToken,
        intentData.targetToken,
        intentData.sourceAmount
      );

      const txHash = this.generateTxHash();

      return {
        success: true,
        intentId,
        txHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        gasUsed: '150000',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simulate intent execution on blockchain
   */
  async executeIntentOnChain(intentId, targetAmount) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const txHash = this.generateTxHash();

      return {
        success: true,
        txHash,
        actualTargetAmount: targetAmount,
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        gasUsed: '250000',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simulate fetching intent from blockchain
   */
  async getIntentFromChain(intentId) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // In Wave 3, this will fetch from actual blockchain
      return {
        success: true,
        exists: false, // For demo, return false to use local storage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get mock executor address
   */
  getExecutorAddress() {
    return this.mockWallet?.address || '0x0000000000000000000000000000000000000000';
  }

  /**
   * Generate mock signature for testing
   */
  async generateMockSignature(message) {
    try {
      if (this.mockWallet) {
        return await this.mockWallet.signMessage(message);
      }
      // Return mock signature if wallet not available
      return '0x' + 'a'.repeat(130);
    } catch (error) {
      return '0x' + 'a'.repeat(130);
    }
  }
}

// Export singleton instance
const blockchainSim = new BlockchainSimulator();
blockchainSim.initialize();

module.exports = blockchainSim;
