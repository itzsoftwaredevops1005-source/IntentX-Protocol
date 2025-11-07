// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IntentX
 * @notice Intent-based swap protocol with Account Abstraction (EIP-4337) support
 * @dev Allows users to specify swap intents that are executed optimally by the protocol
 */
contract IntentX is ReentrancyGuard {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    struct Intent {
        address user;
        address sourceToken;
        address targetToken;
        uint256 sourceAmount;
        uint256 minTargetAmount;
        uint256 slippage; // in basis points (e.g., 200 = 2%)
        uint256 createdAt;
        uint256 executedAt;
        IntentStatus status;
        bytes signature;
    }

    enum IntentStatus {
        Pending,
        Executed,
        Cancelled
    }

    // Intent ID => Intent
    mapping(bytes32 => Intent) public intents;
    
    // User address => Intent IDs
    mapping(address => bytes32[]) public userIntents;
    
    // Executor address (authorized to execute intents)
    address public executor;
    
    // Protocol fee in basis points (e.g., 30 = 0.3%)
    uint256 public protocolFee = 30;
    
    // Protocol treasury
    address public treasury;

    // Maximum slippage allowed (2% = 200 basis points)
    uint256 public constant MAX_SLIPPAGE = 200;

    event IntentCreated(
        bytes32 indexed intentId,
        address indexed user,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 minTargetAmount
    );

    event IntentExecuted(
        bytes32 indexed intentId,
        address indexed executor,
        uint256 targetAmount
    );

    event IntentCancelled(bytes32 indexed intentId, address indexed user);

    modifier onlyExecutor() {
        require(msg.sender == executor, "Only executor can call");
        _;
    }

    constructor(address _executor, address _treasury) {
        require(_executor != address(0), "Invalid executor");
        require(_treasury != address(0), "Invalid treasury");
        executor = _executor;
        treasury = _treasury;
    }

    /**
     * @notice Create a new swap intent
     * @param sourceToken Token to swap from
     * @param targetToken Token to swap to
     * @param sourceAmount Amount of source token
     * @param minTargetAmount Minimum amount of target token to receive
     * @param slippage Allowed slippage in basis points
     * @param signature User's signature for Account Abstraction
     */
    function createIntent(
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 minTargetAmount,
        uint256 slippage,
        bytes memory signature
    ) external nonReentrant returns (bytes32) {
        require(sourceToken != address(0), "Invalid source token");
        require(targetToken != address(0), "Invalid target token");
        require(sourceAmount > 0, "Invalid source amount");
        require(minTargetAmount > 0, "Invalid min target amount");
        require(slippage <= MAX_SLIPPAGE, "Slippage too high");

        // Verify signature for Account Abstraction
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                msg.sender,
                sourceToken,
                targetToken,
                sourceAmount,
                minTargetAmount,
                slippage,
                block.timestamp
            )
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        // Generate intent ID
        bytes32 intentId = keccak256(
            abi.encodePacked(
                msg.sender,
                sourceToken,
                targetToken,
                sourceAmount,
                block.timestamp,
                userIntents[msg.sender].length
            )
        );

        // Transfer source tokens to contract
        if (sourceToken != address(0)) {
            IERC20(sourceToken).safeTransferFrom(msg.sender, address(this), sourceAmount);
        }

        // Create intent
        intents[intentId] = Intent({
            user: msg.sender,
            sourceToken: sourceToken,
            targetToken: targetToken,
            sourceAmount: sourceAmount,
            minTargetAmount: minTargetAmount,
            slippage: slippage,
            createdAt: block.timestamp,
            executedAt: 0,
            status: IntentStatus.Pending,
            signature: signature
        });

        userIntents[msg.sender].push(intentId);

        emit IntentCreated(
            intentId,
            msg.sender,
            sourceToken,
            targetToken,
            sourceAmount,
            minTargetAmount
        );

        return intentId;
    }

    /**
     * @notice Execute a pending intent
     * @param intentId ID of the intent to execute
     * @param targetAmount Actual amount of target token received
     */
    function executeIntent(bytes32 intentId, uint256 targetAmount)
        external
        onlyExecutor
        nonReentrant
    {
        Intent storage intent = intents[intentId];
        require(intent.status == IntentStatus.Pending, "Intent not pending");
        require(targetAmount >= intent.minTargetAmount, "Insufficient output");

        // Verify slippage is within bounds
        uint256 expectedAmount = intent.minTargetAmount;
        uint256 maxSlippage = (expectedAmount * intent.slippage) / 10000;
        require(
            targetAmount >= expectedAmount - maxSlippage,
            "Slippage exceeded"
        );

        // Calculate protocol fee
        uint256 fee = (targetAmount * protocolFee) / 10000;
        uint256 userAmount = targetAmount - fee;

        // Update intent status
        intent.status = IntentStatus.Executed;
        intent.executedAt = block.timestamp;

        // Transfer target tokens to user
        if (intent.targetToken != address(0)) {
            IERC20(intent.targetToken).safeTransfer(intent.user, userAmount);
            if (fee > 0) {
                IERC20(intent.targetToken).safeTransfer(treasury, fee);
            }
        }

        emit IntentExecuted(intentId, msg.sender, targetAmount);
    }

    /**
     * @notice Cancel a pending intent
     * @param intentId ID of the intent to cancel
     */
    function cancelIntent(bytes32 intentId) external nonReentrant {
        Intent storage intent = intents[intentId];
        require(intent.user == msg.sender, "Not intent owner");
        require(intent.status == IntentStatus.Pending, "Intent not pending");

        intent.status = IntentStatus.Cancelled;

        // Return source tokens to user
        if (intent.sourceToken != address(0)) {
            IERC20(intent.sourceToken).safeTransfer(intent.user, intent.sourceAmount);
        }

        emit IntentCancelled(intentId, msg.sender);
    }

    /**
     * @notice Get intent details
     */
    function getIntent(bytes32 intentId) external view returns (Intent memory) {
        return intents[intentId];
    }

    /**
     * @notice Get all intent IDs for a user
     */
    function getUserIntents(address user) external view returns (bytes32[] memory) {
        return userIntents[user];
    }

    /**
     * @notice Update executor address (owner only)
     */
    function setExecutor(address _executor) external {
        require(msg.sender == executor, "Only current executor");
        require(_executor != address(0), "Invalid executor");
        executor = _executor;
    }

    /**
     * @notice Update protocol fee (owner only)
     */
    function setProtocolFee(uint256 _fee) external {
        require(msg.sender == executor, "Only executor");
        require(_fee <= 100, "Fee too high"); // Max 1%
        protocolFee = _fee;
    }
}
