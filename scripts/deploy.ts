import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying IntentX Protocol...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy mock tokens for testing
  console.log("📦 Deploying Mock Tokens...");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  console.log("USDC deployed to:", await usdc.getAddress());

  const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
  await usdt.waitForDeployment();
  console.log("USDT deployed to:", await usdt.getAddress());

  const wbtc = await MockERC20.deploy("Wrapped Bitcoin", "WBTC", 8);
  await wbtc.waitForDeployment();
  console.log("WBTC deployed to:", await wbtc.getAddress());

  const dai = await MockERC20.deploy("Dai Stablecoin", "DAI", 18);
  await dai.waitForDeployment();
  console.log("DAI deployed to:", await dai.getAddress());

  console.log("\n💫 Deploying IntentX Contract...");

  // Deploy IntentX contract
  const executor = deployer.address; // In production, use a dedicated executor
  const treasury = deployer.address; // In production, use a dedicated treasury

  const IntentX = await ethers.getContractFactory("IntentX");
  const intentX = await IntentX.deploy(executor, treasury);
  await intentX.waitForDeployment();

  const intentXAddress = await intentX.getAddress();
  console.log("IntentX deployed to:", intentXAddress);

  console.log("\n✅ Deployment Complete!\n");
  console.log("📋 Contract Addresses:");
  console.log("====================");
  console.log("IntentX:", intentXAddress);
  console.log("USDC:", await usdc.getAddress());
  console.log("USDT:", await usdt.getAddress());
  console.log("WBTC:", await wbtc.getAddress());
  console.log("DAI:", await dai.getAddress());
  console.log("\n📝 Add these to your .env file:");
  console.log(`VITE_INTENTX_ADDRESS=${intentXAddress}`);
  console.log(`VITE_USDC_ADDRESS=${await usdc.getAddress()}`);
  console.log(`VITE_USDT_ADDRESS=${await usdt.getAddress()}`);
  console.log(`VITE_WBTC_ADDRESS=${await wbtc.getAddress()}`);
  console.log(`VITE_DAI_ADDRESS=${await dai.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
