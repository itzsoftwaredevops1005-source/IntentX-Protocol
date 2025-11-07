import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallet } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/web3";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-lg bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">X</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            IntentX
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="hover-elevate active-elevate-2"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {isConnected ? (
            <Button
              variant="outline"
              onClick={disconnect}
              data-testid="button-disconnect-wallet"
              className="hover-elevate active-elevate-2"
            >
              <div className="w-2 h-2 rounded-full bg-status-online mr-2" />
              {formatAddress(address!)}
            </Button>
          ) : (
            <Button
              onClick={connect}
              data-testid="button-connect-wallet"
              className="hover-elevate active-elevate-2"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
