import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, DollarSign, Zap } from "lucide-react";
import { formatAmount } from "@/lib/web3";

export default function AnalyticsDashboard() {
  const stats = [
    {
      title: "Total Intents",
      value: "1,247",
      change: "+12.5%",
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Executed Swaps",
      value: "1,089",
      change: "+8.2%",
      icon: Zap,
      color: "text-status-online",
    },
    {
      title: "Total Volume",
      value: `$${formatAmount(4567890, 0)}`,
      change: "+23.1%",
      icon: DollarSign,
      color: "text-chart-2",
    },
    {
      title: "Success Rate",
      value: "87.3%",
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { token: "ETH → USDC", amount: "1.5 ETH", time: "2 mins ago", status: "success" },
              { token: "WBTC → DAI", amount: "0.05 WBTC", time: "5 mins ago", status: "pending" },
              { token: "USDT → ETH", amount: "5000 USDT", time: "12 mins ago", status: "success" },
              { token: "DAI → WBTC", amount: "10000 DAI", time: "18 mins ago", status: "failed" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{activity.token}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{activity.amount}</p>
                  <div className={`text-xs ${
                    activity.status === "success" ? "text-status-online" :
                    activity.status === "pending" ? "text-chart-4" :
                    "text-status-busy"
                  }`}>
                    {activity.status}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pairs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { pair: "ETH / USDC", volume: "$1.2M", trades: "342" },
              { pair: "WBTC / DAI", volume: "$890K", trades: "256" },
              { pair: "USDT / ETH", volume: "$756K", trades: "189" },
              { pair: "DAI / USDC", volume: "$623K", trades: "134" },
            ].map((pair, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{pair.pair}</p>
                  <p className="text-xs text-muted-foreground">{pair.trades} trades</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">{pair.volume}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
