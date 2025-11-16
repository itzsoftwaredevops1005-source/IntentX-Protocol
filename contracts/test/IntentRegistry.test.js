const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IntentRegistry", function () {
  let intentRegistry;
  let owner, user1, user2;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const IntentRegistry = await ethers.getContractFactory("IntentRegistry");
    intentRegistry = await IntentRegistry.deploy();
    await intentRegistry.waitForDeployment();
  });

describe("ExecutionManager", function () {
  let intentRegistry, executionManager;
  let owner, user1, user2, executor;
  let intentId;

  beforeEach(async function () {
    [owner, user1, user2, executor] = await ethers.getSigners();
    
    const IntentRegistry = await ethers.getContractFactory("IntentRegistry");
    intentRegistry = await IntentRegistry.deploy();
    await intentRegistry.waitForDeployment();

    const ExecutionManager = await ethers.getContractFactory("ExecutionManager");
    executionManager = await ExecutionManager.deploy(await intentRegistry.getAddress());
    await executionManager.waitForDeployment();

    // Authorize ExecutionManager to update intent status
    await intentRegistry.connect(owner).authorizeManager(await executionManager.getAddress());

    const sourceToken = "0x" + "1".repeat(40);
    const targetToken = "0x" + "2".repeat(40);
    const sourceAmount = ethers.parseEther("100");
    const minTargetAmount = ethers.parseEther("95");
    const slippage = 500;
    const signature = "0x" + "a".repeat(130);

    const tx = await intentRegistry.connect(user1).registerIntent(
      sourceToken,
      targetToken,
      sourceAmount,
      minTargetAmount,
      slippage,
      signature
    );
    await tx.wait();

    const allIds = await intentRegistry.getAllIntentIds();
    intentId = allIds[0];
  });

  describe("Access Control", function () {
    it("should set deployer as owner", async function () {
      expect(await executionManager.owner()).to.equal(owner.address);
    });

    it("should authorize deployer as executor by default", async function () {
      expect(await executionManager.authorizedExecutors(owner.address)).to.be.true;
    });

    it("should allow owner to authorize new executor", async function () {
      await executionManager.connect(owner).authorizeExecutor(executor.address);
      expect(await executionManager.authorizedExecutors(executor.address)).to.be.true;
    });

    it("should revert when non-owner tries to authorize executor", async function () {
      await expect(
        executionManager.connect(user1).authorizeExecutor(executor.address)
      ).to.be.revertedWith("Not owner");
    });

    it("should allow owner to revoke executor", async function () {
      await executionManager.connect(owner).authorizeExecutor(executor.address);
      await executionManager.connect(owner).revokeExecutor(executor.address);
      expect(await executionManager.authorizedExecutors(executor.address)).to.be.false;
    });

    it("should revert when non-owner tries to revoke executor", async function () {
      await executionManager.connect(owner).authorizeExecutor(executor.address);
      await expect(
        executionManager.connect(user1).revokeExecutor(executor.address)
      ).to.be.revertedWith("Not owner");
    });

    it("should revert when authorizing zero address", async function () {
      await expect(
        executionManager.connect(owner).authorizeExecutor(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid executor address");
    });

    it("should allow owner to transfer ownership", async function () {
      await executionManager.connect(owner).transferOwnership(user1.address);
      expect(await executionManager.owner()).to.equal(user1.address);
    });

    it("should revoke previous owner's executor status on ownership transfer", async function () {
      expect(await executionManager.authorizedExecutors(owner.address)).to.be.true;
      
      await executionManager.connect(owner).transferOwnership(user1.address);
      
      expect(await executionManager.authorizedExecutors(owner.address)).to.be.false;
      expect(await executionManager.authorizedExecutors(user1.address)).to.be.true;
    });

    it("should auto-authorize new owner as executor", async function () {
      await executionManager.connect(owner).transferOwnership(user1.address);
      expect(await executionManager.authorizedExecutors(user1.address)).to.be.true;
    });

    it("should revert when non-owner tries to transfer ownership", async function () {
      await expect(
        executionManager.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWith("Not owner");
    });

    it("should revert when transferring to current owner", async function () {
      await expect(
        executionManager.connect(owner).transferOwnership(owner.address)
      ).to.be.revertedWith("Already owner");
    });
  });

  describe("Intent Execution", function () {
    beforeEach(async function () {
      await executionManager.connect(owner).authorizeExecutor(executor.address);
    });

    it("should allow authorized executor to start execution", async function () {
      await expect(
        executionManager.connect(executor).startExecution(intentId)
      ).to.emit(executionManager, "IntentExecutionStarted");
    });

    it("should revert when unauthorized user tries to start execution", async function () {
      await expect(
        executionManager.connect(user1).startExecution(intentId)
      ).to.be.revertedWith("Not authorized executor");
    });

    it("should complete execution successfully", async function () {
      await executionManager.connect(executor).startExecution(intentId);
      
      const targetAmount = ethers.parseEther("98");
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx"));
      
      await expect(
        executionManager.connect(executor).completeExecution(intentId, targetAmount, txHash)
      ).to.emit(executionManager, "IntentExecutionCompleted");

      const execution = await executionManager.getExecution(intentId);
      expect(execution.completed).to.be.true;
      expect(execution.executor).to.equal(executor.address);
    });

    it("should revert when completing execution with insufficient output", async function () {
      await executionManager.connect(executor).startExecution(intentId);
      
      const lowTargetAmount = ethers.parseEther("90");
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx"));
      
      await expect(
        executionManager.connect(executor).completeExecution(intentId, lowTargetAmount, txHash)
      ).to.be.revertedWith("Insufficient output amount");
    });

    it("should block revoked executor from starting execution", async function () {
      await executionManager.connect(owner).revokeExecutor(executor.address);
      
      await expect(
        executionManager.connect(executor).startExecution(intentId)
      ).to.be.revertedWith("Not authorized executor");
    });

    it("should block revoked executor from completing execution", async function () {
      await executionManager.connect(executor).startExecution(intentId);
      await executionManager.connect(owner).revokeExecutor(executor.address);
      
      const targetAmount = ethers.parseEther("98");
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx"));
      
      await expect(
        executionManager.connect(executor).completeExecution(intentId, targetAmount, txHash)
      ).to.be.revertedWith("Not authorized executor");
    });

    it("should block previous owner from executing after ownership transfer", async function () {
      const originalOwner = owner;
      await executionManager.connect(owner).transferOwnership(user2.address);
      
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("50");
      const minTargetAmount = ethers.parseEther("48");
      const slippage = 500;
      const signature = "0x" + "b".repeat(130);

      const tx = await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );
      await tx.wait();

      const allIds = await intentRegistry.getAllIntentIds();
      const newIntentId = allIds[allIds.length - 1];
      
      await expect(
        executionManager.connect(originalOwner).startExecution(newIntentId)
      ).to.be.revertedWith("Not authorized executor");
    });
  });
});

  describe("Intent Registration", function () {
    it("should register a new intent successfully", async function () {
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("100");
      const minTargetAmount = ethers.parseEther("95");
      const slippage = 500; // 5%
      const signature = "0x" + "a".repeat(130);

      const tx = await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = intentRegistry.interface.parseLog(log);
          return parsed?.name === "IntentRegistered";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      
      const count = await intentRegistry.getIntentCount();
      expect(count).to.equal(1);
    });

    it("should emit IntentRegistered event with correct parameters", async function () {
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("100");
      const minTargetAmount = ethers.parseEther("95");
      const slippage = 500;
      const signature = "0x" + "a".repeat(130);

      await expect(
        intentRegistry.connect(user1).registerIntent(
          sourceToken,
          targetToken,
          sourceAmount,
          minTargetAmount,
          slippage,
          signature
        )
      ).to.emit(intentRegistry, "IntentRegistered");
    });

    it("should create unique intent IDs for different intents", async function () {
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("100");
      const minTargetAmount = ethers.parseEther("95");
      const slippage = 500;
      const signature = "0x" + "a".repeat(130);

      const tx1 = await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );
      await tx1.wait();

      const tx2 = await intentRegistry.connect(user2).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );
      await tx2.wait();

      const allIds = await intentRegistry.getAllIntentIds();
      expect(allIds.length).to.equal(2);
      expect(allIds[0]).to.not.equal(allIds[1]);
    });
  });

  describe("Intent Retrieval", function () {
    let intentId;

    beforeEach(async function () {
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("100");
      const minTargetAmount = ethers.parseEther("95");
      const slippage = 500;
      const signature = "0x" + "a".repeat(130);

      const tx = await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );
      const receipt = await tx.wait();
      
      const allIds = await intentRegistry.getAllIntentIds();
      intentId = allIds[0];
    });

    it("should retrieve intent by ID", async function () {
      const intent = await intentRegistry.getIntent(intentId);
      
      expect(intent.intentId).to.equal(intentId);
      expect(intent.user).to.equal(user1.address);
      expect(intent.status).to.equal(0); // Pending
    });

    it("should retrieve all intents for a user", async function () {
      const userIntents = await intentRegistry.getUserIntents(user1.address);
      
      expect(userIntents.length).to.equal(1);
      expect(userIntents[0]).to.equal(intentId);
    });

    it("should retrieve all intent IDs", async function () {
      const allIds = await intentRegistry.getAllIntentIds();
      
      expect(allIds.length).to.equal(1);
      expect(allIds[0]).to.equal(intentId);
    });

    it("should return correct intent count", async function () {
      const count = await intentRegistry.getIntentCount();
      expect(count).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("should set deployer as owner", async function () {
      expect(await intentRegistry.owner()).to.equal(owner.address);
    });

    it("should allow owner to authorize manager", async function () {
      await intentRegistry.connect(owner).authorizeManager(user1.address);
      expect(await intentRegistry.authorizedManagers(user1.address)).to.be.true;
    });

    it("should revert when non-owner tries to authorize manager", async function () {
      await expect(
        intentRegistry.connect(user1).authorizeManager(user2.address)
      ).to.be.revertedWith("Not owner");
    });

    it("should allow owner to revoke manager", async function () {
      await intentRegistry.connect(owner).authorizeManager(user1.address);
      await intentRegistry.connect(owner).revokeManager(user1.address);
      expect(await intentRegistry.authorizedManagers(user1.address)).to.be.false;
    });

    it("should revert when authorizing zero address manager", async function () {
      await expect(
        intentRegistry.connect(owner).authorizeManager(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid manager address");
    });
  });

  describe("Intent Status Updates", function () {
    let intentId;

    beforeEach(async function () {
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("100");
      const minTargetAmount = ethers.parseEther("95");
      const slippage = 500;
      const signature = "0x" + "a".repeat(130);

      const tx = await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );
      await tx.wait();
      
      const allIds = await intentRegistry.getAllIntentIds();
      intentId = allIds[0];
    });

    it("should allow owner to update intent status", async function () {
      await intentRegistry.connect(owner).updateIntentStatus(intentId, 1); // Matched
      
      const intent = await intentRegistry.getIntent(intentId);
      expect(intent.status).to.equal(1);
    });

    it("should allow authorized manager to update intent status", async function () {
      await intentRegistry.connect(owner).authorizeManager(user2.address);
      await intentRegistry.connect(user2).updateIntentStatus(intentId, 1); // Matched
      
      const intent = await intentRegistry.getIntent(intentId);
      expect(intent.status).to.equal(1);
    });

    it("should revert when unauthorized user tries to update status", async function () {
      await expect(
        intentRegistry.connect(user1).updateIntentStatus(intentId, 1)
      ).to.be.revertedWith("Not authorized to update status");
    });

    it("should emit IntentStatusUpdated event", async function () {
      await expect(
        intentRegistry.connect(owner).updateIntentStatus(intentId, 1)
      ).to.emit(intentRegistry, "IntentStatusUpdated")
        .withArgs(intentId, 0, 1);
    });

    it("should transition through multiple statuses", async function () {
      await intentRegistry.connect(owner).updateIntentStatus(intentId, 1); // Matched
      await intentRegistry.connect(owner).updateIntentStatus(intentId, 2); // Executing
      await intentRegistry.connect(owner).updateIntentStatus(intentId, 3); // Completed
      
      const intent = await intentRegistry.getIntent(intentId);
      expect(intent.status).to.equal(3);
    });

    it("should revert when updating non-existent intent", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      
      await expect(
        intentRegistry.connect(owner).updateIntentStatus(fakeId, 1)
      ).to.be.revertedWith("Intent does not exist");
    });

    it("should block revoked manager from updating status", async function () {
      await intentRegistry.connect(owner).authorizeManager(user2.address);
      await intentRegistry.connect(owner).revokeManager(user2.address);
      
      await expect(
        intentRegistry.connect(user2).updateIntentStatus(intentId, 1)
      ).to.be.revertedWith("Not authorized to update status");
    });
  });

  describe("Multiple Users and Intents", function () {
    it("should handle multiple users creating intents", async function () {
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("100");
      const minTargetAmount = ethers.parseEther("95");
      const slippage = 500;
      const signature = "0x" + "a".repeat(130);

      await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );

      await intentRegistry.connect(user2).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );

      const user1Intents = await intentRegistry.getUserIntents(user1.address);
      const user2Intents = await intentRegistry.getUserIntents(user2.address);
      
      expect(user1Intents.length).to.equal(1);
      expect(user2Intents.length).to.equal(1);
      expect(user1Intents[0]).to.not.equal(user2Intents[0]);
    });

    it("should handle single user creating multiple intents", async function () {
      const sourceToken = "0x" + "1".repeat(40);
      const targetToken = "0x" + "2".repeat(40);
      const sourceAmount = ethers.parseEther("100");
      const minTargetAmount = ethers.parseEther("95");
      const slippage = 500;
      const signature = "0x" + "a".repeat(130);

      await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        sourceAmount,
        minTargetAmount,
        slippage,
        signature
      );

      await intentRegistry.connect(user1).registerIntent(
        sourceToken,
        targetToken,
        ethers.parseEther("200"),
        minTargetAmount,
        slippage,
        signature
      );

      const userIntents = await intentRegistry.getUserIntents(user1.address);
      expect(userIntents.length).to.equal(2);
      
      const count = await intentRegistry.getIntentCount();
      expect(count).to.equal(2);
    });
  });
});
