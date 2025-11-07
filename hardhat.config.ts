import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // BlockDAG testnet configuration
    blockdag: {
      url: process.env.BLOCKDAG_RPC_URL || "https://rpc-testnet.blockdag.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1234, // Replace with actual BlockDAG testnet chain ID
    },
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Hardhat network for testing
    hardhat: {
      chainId: 1337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
