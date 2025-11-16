// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IntentRegistry.sol";

/**
 * @title ExecutionManager
 * @notice Manages execution of registered intents
 * @dev Wave 2 scaffold - minimal implementation for demo purposes
 */
contract ExecutionManager {
    IntentRegistry public registry;
    address public owner;
    mapping(address => bool) public authorizedExecutors;
    mapping(bytes32 => ExecutionDetails) public executions;

    struct ExecutionDetails {
        bytes32 intentId;
        address executor;
        uint256 actualTargetAmount;
        uint256 executedAt;
        bytes32 txHash;
        bool completed;
    }

    event ExecutorAuthorized(address indexed executor);
    event ExecutorRevoked(address indexed executor);
    event IntentExecutionStarted(
        bytes32 indexed intentId,
        address indexed executor
    );
    event IntentExecutionCompleted(
        bytes32 indexed intentId,
        address indexed executor,
        uint256 actualTargetAmount
    );
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorizedExecutor() {
        require(authorizedExecutors[msg.sender], "Not authorized executor");
        _;
    }

    constructor(address _registry) {
        registry = IntentRegistry(_registry);
        owner = msg.sender;
        authorizedExecutors[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Authorize an executor (only owner)
     * @param executor Address to authorize
     */
    function authorizeExecutor(address executor) external onlyOwner {
        require(executor != address(0), "Invalid executor address");
        authorizedExecutors[executor] = true;
        emit ExecutorAuthorized(executor);
    }

    /**
     * @notice Revoke executor authorization (only owner)
     * @param executor Address to revoke
     */
    function revokeExecutor(address executor) external onlyOwner {
        require(executor != address(0), "Invalid executor address");
        authorizedExecutors[executor] = false;
        emit ExecutorRevoked(executor);
    }

    /**
     * @notice Transfer ownership (only owner)
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != owner, "Already owner");
        
        address previousOwner = owner;
        
        // Revoke previous owner's executor status for clean handover
        authorizedExecutors[previousOwner] = false;
        
        // Transfer ownership
        owner = newOwner;
        
        // Auto-authorize new owner as executor
        authorizedExecutors[newOwner] = true;
        
        emit ExecutorRevoked(previousOwner);
        emit OwnershipTransferred(previousOwner, newOwner);
        emit ExecutorAuthorized(newOwner);
    }

    /**
     * @notice Start intent execution
     * @param intentId ID of intent to execute
     */
    function startExecution(bytes32 intentId) external onlyAuthorizedExecutor {
        IntentRegistry.Intent memory intent = registry.getIntent(intentId);
        require(intent.intentId != bytes32(0), "Intent does not exist");
        require(
            intent.status == IntentRegistry.IntentStatus.Pending ||
            intent.status == IntentRegistry.IntentStatus.Matched,
            "Intent not executable"
        );

        registry.updateIntentStatus(intentId, IntentRegistry.IntentStatus.Executing);

        emit IntentExecutionStarted(intentId, msg.sender);
    }

    /**
     * @notice Complete intent execution
     * @param intentId ID of intent
     * @param actualTargetAmount Actual tokens received
     * @param txHash Transaction hash from DEX/route execution
     */
    function completeExecution(
        bytes32 intentId,
        uint256 actualTargetAmount,
        bytes32 txHash
    ) external onlyAuthorizedExecutor {
        IntentRegistry.Intent memory intent = registry.getIntent(intentId);
        require(
            intent.status == IntentRegistry.IntentStatus.Executing,
            "Intent not executing"
        );
        require(
            actualTargetAmount >= intent.minTargetAmount,
            "Insufficient output amount"
        );

        ExecutionDetails memory execution = ExecutionDetails({
            intentId: intentId,
            executor: msg.sender,
            actualTargetAmount: actualTargetAmount,
            executedAt: block.timestamp,
            txHash: txHash,
            completed: true
        });

        executions[intentId] = execution;
        registry.updateIntentStatus(intentId, IntentRegistry.IntentStatus.Completed);

        emit IntentExecutionCompleted(intentId, msg.sender, actualTargetAmount);
    }

    /**
     * @notice Fail intent execution
     * @param intentId ID of intent
     */
    function failExecution(bytes32 intentId) external onlyAuthorizedExecutor {
        registry.updateIntentStatus(intentId, IntentRegistry.IntentStatus.Failed);
    }

    /**
     * @notice Get execution details
     * @param intentId ID of intent
     */
    function getExecution(bytes32 intentId) external view returns (ExecutionDetails memory) {
        return executions[intentId];
    }
}
