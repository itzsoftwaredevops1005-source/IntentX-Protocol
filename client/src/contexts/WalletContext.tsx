import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { initializeWeb3, web3Service } from "@/lib/web3-integration";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Web3 service
    const config = {
      intentXAddress: import.meta.env.VITE_INTENTX_ADDRESS || "0x0000000000000000000000000000000000000000",
      rpcUrl: import.meta.env.VITE_RPC_URL || "http://localhost:8545",
    };
    initializeWeb3(config);
    setIsInitialized(true);

    // Check if already connected
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      }).catch(console.error);
    }
  }, []);

  const connect = async () => {
    try {
      if (!web3Service) {
        throw new Error("Web3 service not initialized");
      }

      const connectedAddress = await web3Service.connect();
      setAddress(connectedAddress);
      console.log("Wallet connected:", connectedAddress);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    console.log("Wallet disconnected");
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!web3Service) {
      throw new Error("Web3 service not initialized");
    }
    return web3Service.signMessage(message);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
