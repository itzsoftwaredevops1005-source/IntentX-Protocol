import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SwapCard from "@/components/SwapCard";
import IntentDashboard from "@/components/IntentDashboard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useWallet } from "@/contexts/WalletContext";

export default function Home() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection />

      <section id="swap-section" className="py-16 border-t">
        <div className="container mx-auto px-4">
          <SwapCard />
        </div>
      </section>

      {isConnected && (
        <>
          <section className="py-16 border-t">
            <div className="container mx-auto px-4">
              <IntentDashboard />
            </div>
          </section>

          <section className="py-16 border-t">
            <div className="container mx-auto px-4">
              <AnalyticsDashboard />
            </div>
          </section>
        </>
      )}

      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">X</span>
              </div>
              <span className="font-semibold">IntentX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for BlockDAG Buildathon - DeFi Speedway Lane
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 IntentX Protocol
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
