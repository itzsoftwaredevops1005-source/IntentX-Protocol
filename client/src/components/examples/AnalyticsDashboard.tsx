import AnalyticsDashboard from "../AnalyticsDashboard";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function AnalyticsDashboardExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-8">
        <AnalyticsDashboard />
      </div>
    </ThemeProvider>
  );
}
