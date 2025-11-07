import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, DollarSign, Zap, Loader2 } from "lucide-react";
import { formatAmount } from "@/lib/web3";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/lib/api";
import { useWallet } from "@/contexts/WalletContext";

export default function AnalyticsDashboard() {
  const { address } = useWallet();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics", address],
    queryFn: () => getAnalytics(address || undefined),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading || !analytics) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Intents",
      value: analytics.totalIntents.toString(),
      change: "+12.5%",
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Executed Swaps",
      value: analytics.executedSwaps.toString(),
      change: "+8.2%",
      icon: Zap,
      color: "text-status-online",
    },
    {
      title: "Total Volume",
      value: `$${formatAmount(analytics.totalVolume, 0)}`,
      change: "+23.1%",
      icon: DollarSign,
      color: "text-chart-2",
    },
    {
      title: "Success Rate",
      value: `${analytics.successRate.toFixed(1)}%`,
      change: "+2.4%",
      icon: TrendingUp,
      color: "text-chart-3",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Protocol performance metrics and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-elevate" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-status-online">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
