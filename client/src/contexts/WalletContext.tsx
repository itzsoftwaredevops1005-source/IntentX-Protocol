import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  const connect = () => {
    const mockAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
    setAddress(mockAddress);
    console.log("Wallet connected:", mockAddress);
  };

  const disconnect = () => {
    setAddress(null);
    console.log("Wallet disconnected");
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        connect,
        disconnect,
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
