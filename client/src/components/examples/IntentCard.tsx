import IntentCard from "../IntentCard";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function IntentCardExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <IntentCard
            id="1"
            sourceToken="ETH"
            targetToken="USDC"
            sourceAmount="1.5"
            status="executed"
            createdAt="2025-01-15T10:30:00"
            executedAmount="2775.00"
          />
          <IntentCard
            id="2"
            sourceToken="WBTC"
            targetToken="DAI"
            sourceAmount="0.05"
            status="pending"
            createdAt="2025-01-15T11:00:00"
            onCancel={(id) => console.log("Cancelled:", id)}
          />
          <IntentCard
            id="3"
            sourceToken="USDT"
            targetToken="ETH"
            sourceAmount="5000"
            status="cancelled"
            createdAt="2025-01-15T09:15:00"
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
