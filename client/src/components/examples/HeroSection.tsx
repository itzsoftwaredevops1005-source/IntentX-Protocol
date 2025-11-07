import HeroSection from "../HeroSection";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";

export default function HeroSectionExample() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <div className="min-h-screen bg-background">
          <HeroSection />
        </div>
      </WalletProvider>
    </ThemeProvider>
  );
}
