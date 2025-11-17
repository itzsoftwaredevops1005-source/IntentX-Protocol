# IntentX - Intent-Based DeFi Swap Protocol

## Overview

IntentX is an intent-based decentralized finance (DeFi) swap protocol built on BlockDAG. The platform allows users to specify their swap goals in natural language or through a structured form, and an AI-powered routing engine finds the optimal execution path. The system leverages Account Abstraction (EIP-4337) for gasless transactions and provides a complete three-tier architecture: React frontend, Express backend API, and Solidity smart contracts.

The application is designed as a comprehensive demo showcasing the complete intent-based trading workflow, from intent creation to automated execution by an executor bot. Users can create intents, monitor their status in real-time, and track analytics across all trading activity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture (React + Vite + TypeScript)

**Component Structure**: The frontend follows a modern React architecture using functional components with hooks and context providers. The application is organized into:
- **Pages**: Dashboard, IntentLab (swap interface), and Vaults (preview feature)
- **Components**: Reusable UI components including SwapCard, IntentCard, IntentDashboard, AnalyticsDashboard, HeroSection, and Navbar
- **Contexts**: WalletContext for Web3 wallet management and ThemeContext for dark/light mode
- **UI Library**: Shadcn UI components built on Radix UI primitives with Tailwind CSS styling

**State Management**: Uses React Query (@tanstack/react-query) for server state management with automatic caching, refetching, and optimistic updates. The queryClient is configured with custom fetch functions that handle API communication and error states.

**Routing**: Wouter library provides lightweight client-side routing without the overhead of React Router.

**Styling System**: Tailwind CSS with a custom design system defined in tailwind.config.ts. The design follows DeFi platform aesthetics with gradient accents, glassmorphism effects, and responsive layouts. The theme supports both light and dark modes with CSS custom properties.

**Web3 Integration**: Custom Web3Service class (web3-integration.ts) wraps ethers.js v6 for blockchain interactions. The service handles wallet connection, contract interactions with IntentX smart contract, and message signing for Account Abstraction. MetaMask is the primary wallet provider with browser provider detection.

### Backend Architecture (Node.js + Express)

**API Design**: RESTful API built with Express.js following controller-route pattern. The backend provides mock implementations for Wave 2 demo purposes but maintains production-ready structure.

**Intent Engine**: Core business logic in intentEngine.js manages the complete intent lifecycle:
- Intent registration with unique ID generation
- Status tracking (pending → executed/cancelled)
- Route optimization simulation
- JSON file-based persistence for demo purposes

**Natural Language Processing**: nlpParser.js supports two modes:
- Regex-based parsing for common patterns like "Swap 1 ETH to USDC"
- Optional OpenAI GPT integration when API key is provided
- Extracts sourceToken, targetToken, sourceAmount, and slippage from text

**Blockchain Simulation**: blockchainSim.js simulates blockchain interactions for demo:
- Mock transaction hash generation
- Intent ID generation using keccak256 hashing
- Simulates gas estimation and execution
- Provides fallback when actual blockchain is unavailable

**Executor Bot**: Automated background service (executor-bot.ts) that:
- Polls for pending intents every 5 seconds
- Simulates optimal execution timing
- Updates intent status and executed amounts
- Supports both blockchain integration and simulation modes

**API Endpoints**:
- `POST /api/intents` - Create new intent
- `GET /api/intents/:userAddress` - Get user's intents
- `GET /api/intent/:id` - Get specific intent
- `POST /api/intents/:id/cancel` - Cancel intent
- `POST /api/intents/:id/execute` - Manual execution (admin)
- `GET /api/statistics` - System-wide statistics
- `POST /api/intent/parse` - Parse natural language

**Storage Strategy**: In-memory storage with JSON file persistence for demo. The storage interface (IStorage) is abstracted to allow easy migration to PostgreSQL database using Drizzle ORM (schema defined but not implemented).

### Smart Contract Architecture (Solidity)

**IntentRegistry.sol**: Core contract for managing intents
- Stores intent data: user, tokens, amounts, slippage, timestamps, status
- CRUD operations: registerIntent, getIntent, updateStatus, cancelIntent
- Event emissions for off-chain indexing
- Access control for authorized managers
- Intent lifecycle: Pending → Executed/Cancelled

**ExecutionManager.sol**: Handles intent execution
- Maintains authorized executor whitelist
- Executes intents with validation checks
- Integrates with IntentRegistry for status updates
- Ensures only authorized executors can fill intents
- Emits execution events with executor and amounts

**Testing**: Comprehensive Hardhat test suite (IntentRegistry.test.js) with 15+ test cases covering:
- Intent creation and retrieval
- Status updates and cancellations
- Access control and authorization
- Event emission verification
- Edge cases and error conditions

**Deployment Configuration**: Hardhat setup supports:
- Local development (Hardhat network)
- BlockDAG testnet deployment
- Contract verification and optimization
- Environment-based configuration

### Data Flow

1. **Intent Creation**: User submits swap intent via frontend → Backend validates and stores → Optional blockchain registration → Returns intent ID
2. **Intent Execution**: Executor bot monitors pending intents → Finds optimal route → Executes swap → Updates status to executed
3. **Real-time Updates**: Frontend polls API every 5 seconds → React Query automatically updates UI → Users see live status changes
4. **Analytics**: Backend aggregates statistics from all intents → Frontend displays metrics in AnalyticsDashboard

### Design Patterns

**Separation of Concerns**: Clear boundaries between presentation (React), business logic (Express controllers), and data (storage layer). Each layer can be modified independently.

**Interface Abstraction**: IStorage interface allows swapping between in-memory, JSON file, or PostgreSQL storage without changing business logic.

**Factory Pattern**: Web3Service and BlockchainSimulator are initialized once and reused throughout the application lifecycle.

**Observer Pattern**: React Query acts as observer for server state, automatically re-fetching and updating components when data changes.

**Repository Pattern**: Storage layer abstracts data access, providing clean API for CRUD operations regardless of underlying persistence mechanism.

## External Dependencies

### Frontend Dependencies
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **TypeScript** - Type safety
- **Wouter** - Lightweight routing
- **@tanstack/react-query** - Server state management and data fetching
- **ethers.js v6** - Ethereum/blockchain interactions
- **Radix UI** - Headless UI primitives for accessible components
- **Tailwind CSS** - Utility-first styling framework
- **Shadcn UI** - Pre-built component library
- **Lucide React** - Icon library

### Backend Dependencies
- **Express.js** - Web server framework
- **ethers.js** - Smart contract interactions and utilities
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Smart Contract Dependencies
- **Hardhat** - Ethereum development environment
- **@nomicfoundation/hardhat-toolbox** - Testing and deployment tools
- **@openzeppelin/contracts** - Secure contract libraries
- **Solidity 0.8.20** - Smart contract language

### Database (Configured but Optional)
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **@neondatabase/serverless** - Serverless PostgreSQL client
- **PostgreSQL** - Relational database (schema defined in shared/schema.ts)

### Development Tools
- **tsx** - TypeScript execution for Node.js
- **esbuild** - Fast bundler for production builds

### Optional Integrations
- **OpenAI API** - Enhanced natural language processing for intent parsing (requires API key)
- **BlockDAG Network** - Testnet deployment target (requires RPC URL and private key)
- **MetaMask** - Browser wallet for Web3 interactions

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection (optional for Wave 2)
- `PRIVATE_KEY` - Executor wallet private key (blockchain mode)
- `VITE_INTENTX_ADDRESS` - Deployed IntentX contract address
- `VITE_RPC_URL` - Blockchain RPC endpoint
- `OPENAI_API_KEY` - OpenAI API key (optional NLP enhancement)
- `BLOCKDAG_RPC_URL` - BlockDAG testnet RPC URL (deployment)