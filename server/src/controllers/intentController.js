/**
 * Intent Controller
 * Handles HTTP requests for intent operations
 */

const intentEngine = require('../utils/intentEngine');
const blockchainSim = require('../utils/blockchainSim');
const nlpParser = require('../utils/nlpParser');

/**
 * Create a new intent
 */
exports.createIntent = async (req, res) => {
  try {
    const { sourceToken, targetToken, sourceAmount, minTargetAmount, slippage, user, signature } = req.body;

    // Validate required fields
    if (!sourceToken || !targetToken || !sourceAmount || !minTargetAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sourceToken, targetToken, sourceAmount, minTargetAmount',
      });
    }

    // Validate numeric types and ranges
    const numericSourceAmount = parseFloat(sourceAmount);
    const numericMinTargetAmount = parseFloat(minTargetAmount);
    const numericSlippage = parseFloat(slippage || 0.5);

    if (isNaN(numericSourceAmount) || numericSourceAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sourceAmount: must be a positive number',
      });
    }

    if (isNaN(numericMinTargetAmount) || numericMinTargetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid minTargetAmount: must be a positive number',
      });
    }

    if (isNaN(numericSlippage) || numericSlippage < 0 || numericSlippage > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid slippage: must be between 0 and 100',
      });
    }

    // Validate Ethereum addresses
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(sourceToken) || !addressRegex.test(targetToken)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token addresses: must be valid Ethereum addresses',
      });
    }

    // Create intent
    const result = await intentEngine.createIntent({
      sourceToken,
      targetToken,
      sourceAmount: numericSourceAmount.toString(),
      minTargetAmount: numericMinTargetAmount.toString(),
      slippage: numericSlippage,
      user: user || '0x0000000000000000000000000000000000000000',
      signature: signature || null,
    });

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Intent created successfully',
        intent: result.intent,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error creating intent:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all intents
 */
exports.getAllIntents = (req, res) => {
  try {
    const intents = intentEngine.getAllIntents();
    return res.status(200).json({
      success: true,
      count: intents.length,
      intents,
    });
  } catch (error) {
    console.error('Error fetching intents:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get intent by ID
 */
exports.getIntentById = (req, res) => {
  try {
    const { id } = req.params;
    const intent = intentEngine.getIntentById(id);

    if (!intent) {
      return res.status(404).json({
        success: false,
        error: 'Intent not found',
      });
    }

    return res.status(200).json({
      success: true,
      intent,
    });
  } catch (error) {
    console.error('Error fetching intent:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get intents by user address
 */
exports.getIntentsByUser = (req, res) => {
  try {
    const { userAddress } = req.params;
    const intents = intentEngine.getIntentsByUser(userAddress);

    return res.status(200).json({
      success: true,
      count: intents.length,
      intents,
    });
  } catch (error) {
    console.error('Error fetching user intents:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get pending intents
 */
exports.getPendingIntents = (req, res) => {
  try {
    const intents = intentEngine.getPendingIntents();

    return res.status(200).json({
      success: true,
      count: intents.length,
      intents,
    });
  } catch (error) {
    console.error('Error fetching pending intents:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Execute an intent
 */
exports.executeIntent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await intentEngine.executeIntent(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Intent executed successfully',
        intent: result.intent,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error executing intent:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Cancel an intent
 */
exports.cancelIntent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await intentEngine.cancelIntent(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Intent cancelled successfully',
        intent: result.intent,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error cancelling intent:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get intent statistics
 */
exports.getStatistics = (req, res) => {
  try {
    const stats = intentEngine.getStatistics();

    return res.status(200).json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Parse natural language intent
 */
exports.parseIntent = async (req, res) => {
  try {
    const { intent } = req.body;

    if (!intent || typeof intent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "intent" field in request body',
      });
    }

    const result = await nlpParser.parseIntent(intent);

    if (result.success) {
      return res.status(200).json({
        success: true,
        ...result,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error parsing intent:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Health check endpoint
 */
exports.healthCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'IntentX API is running',
    timestamp: new Date().toISOString(),
    executorAddress: blockchainSim.getExecutorAddress(),
  });
};
