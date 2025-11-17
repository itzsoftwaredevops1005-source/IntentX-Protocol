/**
 * Natural Language Parser
 * Parses natural language intents into structured data
 * Supports both regex-based parsing and optional OpenAI integration
 */

const { ethers } = require('ethers');

// Mock token addresses for common tokens
const TOKEN_ADDRESSES = {
  ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  MATIC: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
};

class NLPParser {
  constructor() {
    this.hasOpenAI = !!process.env.OPENAI_API_KEY;
    if (this.hasOpenAI) {
      console.log('✅ OpenAI API key detected - Enhanced NLP parsing enabled');
    } else {
      console.log('ℹ️  Using regex-based intent parsing');
    }
  }

  /**
   * Parse natural language intent
   * @param {string} intentText - Natural language intent (e.g., "Swap 1 ETH to USDC")
   * @returns {Promise<Object>} - Structured intent data
   */
  async parseIntent(intentText) {
    try {
      if (!intentText || typeof intentText !== 'string') {
        throw new Error('Invalid intent text');
      }

      // Try OpenAI parsing if available
      if (this.hasOpenAI) {
        try {
          const openAIResult = await this.parseWithOpenAI(intentText);
          if (openAIResult) {
            return {
              success: true,
              source: 'openai',
              ...openAIResult,
            };
          }
        } catch (error) {
          console.warn('OpenAI parsing failed, falling back to regex:', error.message);
        }
      }

      // Fallback to regex-based parsing
      const regexResult = this.parseWithRegex(intentText);
      return {
        success: true,
        source: 'regex',
        ...regexResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'mock',
      };
    }
  }

  /**
   * Regex-based intent parsing
   * @param {string} text - Intent text
   * @returns {Object} - Parsed intent data
   */
  parseWithRegex(text) {
    const normalizedText = text.toLowerCase().trim();

    // Extract action (swap, trade, exchange, convert)
    const action = this.extractAction(normalizedText);

    // Extract amounts and tokens
    const { amount, fromToken, toToken } = this.extractTokensAndAmount(normalizedText);

    // Calculate estimates
    const sourceAmount = amount;
    const estimatedOutput = parseFloat(amount) * 0.98; // Mock 2% slippage
    const minTargetAmount = estimatedOutput * 0.95; // 5% slippage tolerance

    // Generate best route
    const bestRoute = this.generateMockRoute(fromToken, toToken, sourceAmount);

    return {
      action,
      fromToken,
      toToken,
      amount: sourceAmount.toString(),
      sourceToken: TOKEN_ADDRESSES[fromToken] || `0x${fromToken.toLowerCase().repeat(20).slice(0, 40)}`,
      targetToken: TOKEN_ADDRESSES[toToken] || `0x${toToken.toLowerCase().repeat(20).slice(0, 40)}`,
      sourceAmount: sourceAmount.toString(),
      minTargetAmount: minTargetAmount.toFixed(6),
      estimatedOutput: estimatedOutput.toFixed(6),
      bestRoute,
      estimatedGas: '90000',
      expectedYield: estimatedOutput.toFixed(6),
      slippage: 0.5,
      confidence: 0.92,
    };
  }

  /**
   * Extract action from text
   */
  extractAction(text) {
    if (text.includes('swap')) return 'swap';
    if (text.includes('trade')) return 'trade';
    if (text.includes('exchange')) return 'exchange';
    if (text.includes('convert')) return 'convert';
    if (text.includes('buy')) return 'buy';
    if (text.includes('sell')) return 'sell';
    return 'swap';
  }

  /**
   * Extract tokens and amount from text
   */
  extractTokensAndAmount(text) {
    // Pattern: "1 ETH to USDC" or "swap 1 ETH for USDC"
    const patterns = [
      /(\d+\.?\d*)\s*([a-z]+)\s+(?:to|for|into|→)\s+([a-z]+)/i,
      /(?:swap|trade|exchange|convert)\s+(\d+\.?\d*)\s*([a-z]+)\s+(?:to|for|into)\s+([a-z]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          amount: parseFloat(match[1]),
          fromToken: match[2].toUpperCase(),
          toToken: match[3].toUpperCase(),
        };
      }
    }

    // Default fallback
    return {
      amount: 1,
      fromToken: 'ETH',
      toToken: 'USDC',
    };
  }

  /**
   * Generate mock route for demo
   */
  generateMockRoute(fromToken, toToken, amount) {
    const protocols = ['UniswapV3', 'SushiSwap', 'Curve', 'Balancer'];
    const selectedProtocol = protocols[Math.floor(Math.random() * protocols.length)];

    return {
      protocol: selectedProtocol,
      path: [fromToken, toToken],
      estimatedOutput: parseFloat(amount) * 0.98,
      gasEstimate: '150000',
      confidence: 0.95,
      priceImpact: '0.12%',
    };
  }

  /**
   * Parse with OpenAI (if API key is available)
   * @param {string} text - Intent text
   * @returns {Promise<Object>} - Parsed intent data
   */
  async parseWithOpenAI(text) {
    if (!this.hasOpenAI) {
      return null;
    }

    try {
      // Lazy load OpenAI to avoid requiring it when not available
      const { default: OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a DeFi intent parser. Parse the user's intent into a structured JSON object with these fields:
- action: (swap/trade/exchange/convert)
- fromToken: source token symbol (uppercase)
- toToken: target token symbol (uppercase)
- amount: numeric amount to swap

Respond ONLY with valid JSON, no explanation.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
      });

      const parsed = JSON.parse(completion.choices[0].message.content);

      // Enhance with additional data
      const sourceAmount = parseFloat(parsed.amount);
      const estimatedOutput = sourceAmount * 0.98;
      const minTargetAmount = estimatedOutput * 0.95;

      return {
        ...parsed,
        sourceToken: TOKEN_ADDRESSES[parsed.fromToken] || `0x${parsed.fromToken.toLowerCase().repeat(20).slice(0, 40)}`,
        targetToken: TOKEN_ADDRESSES[parsed.toToken] || `0x${parsed.toToken.toLowerCase().repeat(20).slice(0, 40)}`,
        sourceAmount: sourceAmount.toString(),
        minTargetAmount: minTargetAmount.toFixed(6),
        estimatedOutput: estimatedOutput.toFixed(6),
        bestRoute: this.generateMockRoute(parsed.fromToken, parsed.toToken, sourceAmount),
        estimatedGas: '90000',
        expectedYield: estimatedOutput.toFixed(6),
        slippage: 0.5,
        confidence: 0.97,
      };
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      return null;
    }
  }
}

// Export singleton instance
const nlpParser = new NLPParser();

module.exports = nlpParser;
