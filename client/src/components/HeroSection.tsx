import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";

export default function HeroSection() {
  const { isConnected, connect } = useWallet();

  const scrollToSwap = () => {
    document.getElementById("swap-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-2/5 to-background -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(0,0,0,0))] -z-10" />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">DeFi Speedway | BlockDAG Buildathon</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Intent-Based Swaps,
            <br />
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
              Executed Perfectly
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Specify what you want to achieve. IntentX finds the optimal path and executes your swap using Account Abstraction and AI-powered route optimization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={connect}
                data-testid="button-hero-connect"
                className="h-12 px-8 hover-elevate active-elevate-2"
              >
                Connect Wallet
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={scrollToSwap}
                data-testid="button-hero-swap"
                className="h-12 px-8 hover-elevate active-elevate-2"
              >
                Start Swapping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              data-testid="button-hero-learn"
              className="h-12 px-8 hover-elevate active-elevate-2"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Account Abstraction</h3>
              <p className="text-sm text-muted-foreground text-center">Gasless transactions with EIP-4337</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="font-semibold">AI Optimization</h3>
              <p className="text-sm text-muted-foreground text-center">Best rates, automatically found</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="font-semibold">Intent-Based</h3>
              <p className="text-sm text-muted-foreground text-center">Describe your goal, we execute</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
