// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IntentRegistry
 * @notice Registry for managing user intents in the IntentX protocol
 * @dev Wave 2 scaffold - minimal implementation for demo purposes
 */
contract IntentRegistry {
    enum IntentStatus {
        Pending,
        Matched,
        Executing,
        Completed,
        Cancelled,
        Failed
    }

    struct Intent {
        bytes32 intentId;
        address user;
        address sourceToken;
        address targetToken;
        uint256 sourceAmount;
        uint256 minTargetAmount;
        uint256 slippage;
        uint256 createdAt;
        IntentStatus status;
        bytes signature;
    }

    address public owner;
    mapping(address => bool) public authorizedManagers;
    mapping(bytes32 => Intent) public intents;
    mapping(address => bytes32[]) public userIntents;
    bytes32[] public allIntentIds;

    event IntentRegistered(
        bytes32 indexed intentId,
        address indexed user,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount
    );

    event IntentStatusUpdated(
        bytes32 indexed intentId,
        IntentStatus oldStatus,
        IntentStatus newStatus
    );

    event ManagerAuthorized(address indexed manager);
    event ManagerRevoked(address indexed manager);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorizedManager() {
        require(
            msg.sender == owner || authorizedManagers[msg.sender],
            "Not authorized to update status"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Authorize a manager (e.g., ExecutionManager contract)
     * @param manager Address to authorize
     */
    function authorizeManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid manager address");
        authorizedManagers[manager] = true;
        emit ManagerAuthorized(manager);
    }

    /**
     * @notice Revoke manager authorization
     * @param manager Address to revoke
     */
    function revokeManager(address manager) external onlyOwner {
        authorizedManagers[manager] = false;
        emit ManagerRevoked(manager);
    }

    /**
     * @notice Register a new intent
     * @param sourceToken Address of source token
     * @param targetToken Address of target token
     * @param sourceAmount Amount of source tokens
     * @param minTargetAmount Minimum acceptable target tokens
     * @param slippage Slippage tolerance in basis points
     * @param signature User signature for Account Abstraction
     */
    function registerIntent(
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 minTargetAmount,
        uint256 slippage,
        bytes memory signature
    ) external returns (bytes32) {
        bytes32 intentId = keccak256(
            abi.encodePacked(
                msg.sender,
                sourceToken,
                targetToken,
                sourceAmount,
                block.timestamp,
                allIntentIds.length
            )
        );

        Intent memory newIntent = Intent({
            intentId: intentId,
            user: msg.sender,
            sourceToken: sourceToken,
            targetToken: targetToken,
            sourceAmount: sourceAmount,
            minTargetAmount: minTargetAmount,
            slippage: slippage,
            createdAt: block.timestamp,
            status: IntentStatus.Pending,
            signature: signature
        });

        intents[intentId] = newIntent;
        userIntents[msg.sender].push(intentId);
        allIntentIds.push(intentId);

        emit IntentRegistered(
            intentId,
            msg.sender,
            sourceToken,
            targetToken,
            sourceAmount
        );

        return intentId;
    }

    /**
     * @notice Update intent status (only authorized managers)
     * @param intentId ID of the intent
     * @param newStatus New status
     */
    function updateIntentStatus(bytes32 intentId, IntentStatus newStatus) external onlyAuthorizedManager {
        Intent storage intent = intents[intentId];
        require(intent.intentId != bytes32(0), "Intent does not exist");

        IntentStatus oldStatus = intent.status;
        intent.status = newStatus;

        emit IntentStatusUpdated(intentId, oldStatus, newStatus);
    }

    /**
     * @notice Get intent details
     * @param intentId ID of the intent
     */
    function getIntent(bytes32 intentId) external view returns (Intent memory) {
        return intents[intentId];
    }

    /**
     * @notice Get all intents for a user
     * @param user User address
     */
    function getUserIntents(address user) external view returns (bytes32[] memory) {
        return userIntents[user];
    }

    /**
     * @notice Get all intent IDs
     */
    function getAllIntentIds() external view returns (bytes32[] memory) {
        return allIntentIds;
    }

    /**
     * @notice Get total number of intents
     */
    function getIntentCount() external view returns (uint256) {
        return allIntentIds.length;
    }
}
