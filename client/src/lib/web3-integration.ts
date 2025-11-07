import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";

const INTENTX_ABI = [
  "function createIntent(address sourceToken, address targetToken, uint256 sourceAmount, uint256 minTargetAmount, uint256 slippage, bytes signature) returns (bytes32)",
  "function executeIntent(bytes32 intentId, uint256 targetAmount)",
  "function cancelIntent(bytes32 intentId)",
  "function getIntent(bytes32 intentId) view returns (tuple(address user, address sourceToken, address targetToken, uint256 sourceAmount, uint256 minTargetAmount, uint256 slippage, uint256 createdAt, uint256 executedAt, uint8 status, bytes signature))",
  "function getUserIntents(address user) view returns (bytes32[])",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export interface Web3Config {
  intentXAddress: string;
  rpcUrl: string;
}

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private intentXContract: Contract | null = null;
  private config: Web3Config;

  constructor(config: Web3Config) {
    this.config = config;
  }

  async connect(): Promise<string> {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    this.provider = new BrowserProvider(window.ethereum);
    const accounts = await this.provider.send("eth_requestAccounts", []);
    
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const signer = await this.provider.getSigner();
    this.intentXContract = new Contract(
      this.config.intentXAddress,
      INTENTX_ABI,
      signer
    );

    return accounts[0];
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const signer = await this.provider.getSigner();
    return signer.signMessage(message);
  }

  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    decimals: number
  ): Promise<void> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const signer = await this.provider.getSigner();
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
    
    const amountWei = parseUnits(amount, decimals);
    const tx = await tokenContract.approve(spenderAddress, amountWei);
    await tx.wait();
  }

  async getTokenBalance(
    tokenAddress: string,
    userAddress: string
  ): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    
    return formatUnits(balance, decimals);
  }

  async createIntentOnChain(
    sourceToken: string,
    targetToken: string,
    sourceAmount: string,
    minTargetAmount: string,
    slippage: number,
    signature: string
  ): Promise<string> {
    if (!this.intentXContract) {
      throw new Error("Contract not initialized");
    }

    const tx = await this.intentXContract.createIntent(
      sourceToken,
      targetToken,
      parseUnits(sourceAmount, 18),
      parseUnits(minTargetAmount, 18),
      slippage,
      signature
    );
    
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getAddress(): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const signer = await this.provider.getSigner();
    return signer.getAddress();
  }
}

// Export singleton instance (will be initialized when wallet connects)
export let web3Service: Web3Service | null = null;

export function initializeWeb3(config: Web3Config) {
  web3Service = new Web3Service(config);
  return web3Service;
}
