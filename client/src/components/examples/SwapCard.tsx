import SwapCard from "../SwapCard";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { Toaster } from "@/components/ui/toaster";

export default function SwapCardExample() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <div className="min-h-screen bg-background p-8">
          <SwapCard />
          <Toaster />
        </div>
      </WalletProvider>
    </ThemeProvider>
  );
}
