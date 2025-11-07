import IntentDashboard from "../IntentDashboard";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";

export default function IntentDashboardExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-8">
        <IntentDashboard />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
