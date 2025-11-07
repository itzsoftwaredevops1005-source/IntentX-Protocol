# IntentX - Intent-Based DeFi Swap Protocol

<div align="center">

![IntentX Banner](https://img.shields.io/badge/DeFi-Speedway-blue?style=for-the-badge)
![BlockDAG](https://img.shields.io/badge/BlockDAG-Buildathon-purple?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Intent-based swap protocol with Account Abstraction (EIP-4337) and AI-powered route optimization**

[Demo](https://intentx.replit.app) • [Documentation](#documentation) • [Smart Contracts](#smart-contracts)

</div>

---

## 🌟 Overview

IntentX is a revolutionary DeFi protocol built for the BlockDAG Buildathon (DeFi Speedway Lane). Instead of manually executing swaps, users simply specify their intent (e.g., "swap 1 ETH to USDC at the best rate"), and the protocol automatically finds the optimal path and executes it using Account Abstraction and AI-assisted logic.

### Key Features

- **🎯 Intent-Based Trading** - Describe what you want, we execute it optimally
- **⚡ Account Abstraction (EIP-4337)** - Gasless transactions with signature verification
- **🤖 AI-Powered Execution** - Automatic route optimization and timing
- **🔒 Slippage Protection** - Maximum 2% slippage enforcement
- **📊 Real-Time Analytics** - Track intents, volumes, and success rates
- **🎨 Modern UI** - Dark mode, smooth animations, futuristic design

---

## 🏗️ Architecture

### Smart Contracts (Solidity)

**IntentX.sol** - Core protocol contract
- `createIntent()` - Create a new swap intent with signature verification
- `executeIntent()` - Execute intent with optimal routing (executor only)
- `cancelIntent()` - Cancel pending intents
- Account Abstraction integration for gasless transactions
- Slippage protection (<2%)
- Protocol fee mechanism (0.3%)

**MockERC20.sol** - Test tokens for development

### Backend (Node.js + Express)

**API Endpoints:**
- `POST /api/intents` - Create new intent
- `GET /api/intents/:userAddress` - Get user's intents
- `POST /api/intents/:id/cancel` - Cancel intent
- `POST /api/intents/:id/execute` - Execute intent (bot only)
- `GET /api/analytics` - Get protocol analytics

**Intent Executor Bot:**
- Monitors pending intents every 5 seconds
- Checks market conditions and optimal execution timing
- Automatically executes when conditions are met
- Verifies slippage protection

### Frontend (React + TypeScript)

**Components:**
- Wallet connection (MetaMask integration)
- Swap interface with token selection
- Intent dashboard (Pending/Executed/Cancelled)
- Analytics dashboard
- Dark/Light mode support

**Tech Stack:**
- React 18 + TypeScript
- TailwindCSS + Shadcn UI
- TanStack Query for data fetching
- Ethers.js v6 for Web3 interactions
- Framer Motion for animations

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MetaMask or compatible wallet
- BlockDAG testnet RPC access (or use local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/intentx.git
cd intentx

# Install dependencies
npm install

# Install Hardhat dependencies
npm install hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
BLOCKDAG_RPC_URL=https://rpc-testnet.blockdag.network
PRIVATE_KEY=your_private_key_here

# Frontend Configuration (create .env.local in client/)
VITE_INTENTX_ADDRESS=0x...
VITE_RPC_URL=https://rpc-testnet.blockdag.network

# Optional: Token Addresses
VITE_USDC_ADDRESS=0x...
VITE_USDT_ADDRESS=0x...
VITE_WBTC_ADDRESS=0x...
VITE_DAI_ADDRESS=0x...
```

### Development

```bash
# Compile smart contracts
npx hardhat compile

# Deploy contracts to local network
npx hardhat node  # In one terminal
npx hardhat run scripts/deploy.ts --network localhost  # In another terminal

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5000`

---

## 📦 Deployment

### Deploy to BlockDAG Testnet

```bash
# Make sure .env is configured with BlockDAG RPC URL and private key
npx hardhat run scripts/deploy.ts --network blockdag
```

The deployment script will output contract addresses. Add them to your `.env.local` file.

### Deploy Frontend

The application is configured to work with Replit Deployments or any static hosting service.

```bash
# Build for production
npm run build

# The built files will be in the dist/ directory
```

---

## 🎮 Usage

### 1. Connect Wallet

Click "Connect Wallet" in the header to connect your MetaMask wallet to the BlockDAG testnet.

### 2. Create Intent

1. Select source and target tokens
2. Enter amount to swap
3. Adjust slippage tolerance (default: 1%)
4. Click "Create Intent"
5. Sign the message for Account Abstraction

### 3. Monitor Execution

- View your intents in the Intent Dashboard
- Pending intents will be automatically executed by the bot (usually within 10-30 seconds)
- See real-time status updates
- View executed amounts and rates

### 4. Analytics

Track your trading activity:
- Total intents created
- Executed swaps
- Total volume traded
- Success rate

---

## 🧪 Testing

### Run Smart Contract Tests

```bash
npx hardhat test
```

### Manual Testing

1. **Create Intent:** Submit a swap intent and verify it appears in the dashboard
2. **Executor Bot:** Wait for the bot to execute the intent (~10-30 seconds)
3. **Cancel Intent:** Try cancelling a pending intent
4. **Analytics:** Verify metrics update after transactions

---

## 📝 Smart Contracts

### IntentX Contract

**Key Functions:**

```solidity
function createIntent(
    address sourceToken,
    address targetToken,
    uint256 sourceAmount,
    uint256 minTargetAmount,
    uint256 slippage,
    bytes memory signature
) external returns (bytes32);

function executeIntent(
    bytes32 intentId,
    uint256 targetAmount
) external;

function cancelIntent(bytes32 intentId) external;
```

**Events:**

```solidity
event IntentCreated(bytes32 indexed intentId, address indexed user, ...);
event IntentExecuted(bytes32 indexed intentId, address indexed executor, ...);
event IntentCancelled(bytes32 indexed intentId, address indexed user);
```

### Security Features

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Signature verification for Account Abstraction
- ✅ Slippage protection (max 2%)
- ✅ SafeERC20 for token transfers
- ✅ Access control for executor functions

---

## 🤖 Intent Executor Bot

The executor bot runs automatically when the server starts. It:

1. **Monitors** pending intents every 5 seconds
2. **Analyzes** market conditions and optimal timing
3. **Executes** intents when conditions are met
4. **Verifies** slippage protection before execution

### Bot Configuration

Edit `server/executor-bot.ts` to customize:
- Check interval (default: 5 seconds)
- Execution criteria (default: after 10 seconds)
- Exchange rate sources
- Slippage tolerance

---

## 🎨 Design System

IntentX uses a modern, futuristic design inspired by leading DeFi platforms:

- **Colors:** Primary (Blue), Gradients (Purple to Cyan)
- **Typography:** Inter font family
- **Spacing:** Consistent 4px grid system
- **Components:** Shadcn UI + custom components
- **Animations:** Smooth transitions with Framer Motion
- **Dark Mode:** Full support with system preference detection

---

## 📚 API Reference

### Create Intent

```http
POST /api/intents
Content-Type: application/json

{
  "userAddress": "0x...",
  "sourceToken": "ETH",
  "targetToken": "USDC",
  "sourceAmount": "1.5",
  "minTargetAmount": "2775.00",
  "slippage": "1",
  "signature": "0x..."
}
```

### Get User Intents

```http
GET /api/intents/:userAddress
```

### Cancel Intent

```http
POST /api/intents/:id/cancel
```

### Get Analytics

```http
GET /api/analytics?userAddress=0x...
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | BlockDAG (EVM-compatible) |
| **Smart Contracts** | Solidity ^0.8.20 |
| **Backend** | Node.js, Express, TypeScript |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS, Shadcn UI |
| **Web3** | Ethers.js v6 |
| **State Management** | TanStack Query |
| **Development** | Hardhat, ESLint, TypeScript |

---

## 🏆 BlockDAG Buildathon

This project was built for the **BlockDAG Buildathon - DeFi Speedway Lane**.

### Deliverables ✅

- ✅ Full-stack DeFi application
- ✅ Smart contracts with Account Abstraction
- ✅ Intent-based swap mechanism
- ✅ Automated executor bot
- ✅ Real-time analytics dashboard
- ✅ Production-ready UI/UX
- ✅ Deployment scripts
- ✅ Comprehensive documentation

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

Project built by: [Your Name]
- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

<div align="center">

**Built with ❤️ for the BlockDAG Buildathon**

[⬆ Back to Top](#intentx---intent-based-defi-swap-protocol)

</div>
