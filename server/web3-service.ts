import { ethers, Wallet, JsonRpcProvider, Contract } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const INTENTX_ABI = [
  "function createIntent(address sourceToken, address targetToken, uint256 sourceAmount, uint256 minTargetAmount, uint256 slippage, bytes signature) returns (bytes32)",
  "function executeIntent(bytes32 intentId, uint256 targetAmount)",
  "function cancelIntent(bytes32 intentId)",
  "function getIntent(bytes32 intentId) view returns (tuple(address user, address sourceToken, address targetToken, uint256 sourceAmount, uint256 minTargetAmount, uint256 slippage, uint256 createdAt, uint256 executedAt, uint8 status, bytes signature))",
  "function getUserIntents(address user) view returns (bytes32[])",
  "event IntentCreated(bytes32 indexed intentId, address indexed user, address sourceToken, address targetToken, uint256 sourceAmount, uint256 minTargetAmount)",
  "event IntentExecuted(bytes32 indexed intentId, address indexed executor, uint256 targetAmount)",
  "event IntentCancelled(bytes32 indexed intentId, address indexed user)",
];

export class BlockchainService {
  private provider: JsonRpcProvider;
  private executorWallet: Wallet;
  private intentXContract: Contract;

  constructor() {
    const rpcUrl = process.env.BLOCKDAG_RPC_URL || process.env.VITE_RPC_URL || "http://localhost:8545";
    const privateKey = process.env.PRIVATE_KEY || process.env.EXECUTOR_PRIVATE_KEY;
    const contractAddress = process.env.VITE_INTENTX_ADDRESS;

    if (!privateKey) {
      console.warn("⚠️  No PRIVATE_KEY found in environment. Blockchain features will be limited.");
    }

    if (!contractAddress) {
      console.warn("⚠️  No VITE_INTENTX_ADDRESS found. Using mock address.");
    }

    this.provider = new JsonRpcProvider(rpcUrl);
    
    if (privateKey) {
      this.executorWallet = new Wallet(privateKey, this.provider);
    } else {
      // Create a random wallet for development
      this.executorWallet = Wallet.createRandom().connect(this.provider);
    }

    this.intentXContract = new Contract(
      contractAddress || "0x0000000000000000000000000000000000000000",
      INTENTX_ABI,
      this.executorWallet
    );

    console.log("🔗 Blockchain Service initialized");
    console.log("   RPC:", rpcUrl);
    console.log("   Executor:", this.executorWallet.address);
    console.log("   Contract:", contractAddress || "Not deployed");
  }

  /**
   * Verify signature and recover signer address
   */
  verifySignature(message: string, signature: string): string {
    try {
      const messageHash = ethers.hashMessage(message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);
      return recoveredAddress;
    } catch (error) {
      throw new Error("Invalid signature");
    }
  }

  /**
   * Create intent on blockchain
   */
  async createIntentOnChain(
    sourceToken: string,
    targetToken: string,
    sourceAmount: string,
    minTargetAmount: string,
    slippage: string,
    signature: string
  ): Promise<{ intentId: string; txHash: string }> {
    try {
      const sourceAmountWei = ethers.parseUnits(sourceAmount, 18);
      const minTargetAmountWei = ethers.parseUnits(minTargetAmount, 18);
      const slippageBps = Math.floor(parseFloat(slippage) * 100); // Convert to basis points

      const tx = await this.intentXContract.createIntent(
        sourceToken,
        targetToken,
        sourceAmountWei,
        minTargetAmountWei,
        slippageBps,
        signature
      );

      const receipt = await tx.wait();
      
      // Parse the IntentCreated event to get the intentId
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.intentXContract.interface.parseLog(log);
          return parsed?.name === "IntentCreated";
        } catch {
          return false;
        }
      });

      let intentId = "0x";
      if (event) {
        const parsed = this.intentXContract.interface.parseLog(event);
        intentId = parsed?.args[0] || "0x";
      }

      return {
        intentId,
        txHash: receipt.hash,
      };
    } catch (error: any) {
      console.error("Error creating intent on chain:", error);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  /**
   * Execute intent on blockchain
   */
  async executeIntentOnChain(intentId: string, targetAmount: string): Promise<string> {
    try {
      const targetAmountWei = ethers.parseUnits(targetAmount, 18);

      const tx = await this.intentXContract.executeIntent(intentId, targetAmountWei);
      const receipt = await tx.wait();

      return receipt.hash;
    } catch (error: any) {
      console.error("Error executing intent on chain:", error);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  /**
   * Cancel intent on blockchain
   */
  async cancelIntentOnChain(intentId: string): Promise<string> {
    try {
      const tx = await this.intentXContract.cancelIntent(intentId);
      const receipt = await tx.wait();

      return receipt.hash;
    } catch (error: any) {
      console.error("Error cancelling intent on chain:", error);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  /**
   * Get intent from blockchain
   */
  async getIntentFromChain(intentId: string): Promise<any> {
    try {
      const intent = await this.intentXContract.getIntent(intentId);
      return {
        user: intent.user,
        sourceToken: intent.sourceToken,
        targetToken: intent.targetToken,
        sourceAmount: ethers.formatUnits(intent.sourceAmount, 18),
        minTargetAmount: ethers.formatUnits(intent.minTargetAmount, 18),
        slippage: intent.slippage.toString(),
        createdAt: new Date(Number(intent.createdAt) * 1000),
        executedAt: intent.executedAt > 0 ? new Date(Number(intent.executedAt) * 1000) : null,
        status: ["pending", "executed", "cancelled"][intent.status],
        signature: intent.signature,
      };
    } catch (error: any) {
      console.error("Error getting intent from chain:", error);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  /**
   * Check if contract is deployed
   */
  async isContractDeployed(): Promise<boolean> {
    try {
      const code = await this.provider.getCode(await this.intentXContract.getAddress());
      return code !== "0x";
    } catch {
      return false;
    }
  }

  getExecutorAddress(): string {
    return this.executorWallet.address;
  }
}

export const blockchainService = new BlockchainService();
