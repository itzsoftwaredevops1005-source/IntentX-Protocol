import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics'],
  });

  const { data: intentsData, isLoading: intentsLoading } = useQuery({
    queryKey: ['/api/intents'],
  });

  const intents = intentsData?.intents || [];
  const statistics = stats?.statistics || {};

  const statsCards = [
    {
      title: 'Total Intents',
      value: statistics.total || 0,
      icon: Activity,
      description: 'All time',
      color: 'text-blue-500',
    },
    {
      title: 'Completed',
      value: statistics.completed || 0,
      icon: CheckCircle2,
      description: 'Successfully executed',
      color: 'text-green-500',
    },
    {
      title: 'Pending',
      value: statistics.pending || 0,
      icon: Clock,
      description: 'Awaiting execution',
      color: 'text-yellow-500',
    },
    {
      title: 'Total Volume',
      value: `$${statistics.totalVolume || '0.00'}`,
      icon: TrendingUp,
      description: 'USD equivalent',
      color: 'text-purple-500',
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'default', label: 'Pending' },
      executing: { variant: 'secondary', label: 'Executing' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
      failed: { variant: 'destructive', label: 'Failed' },
    };

    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant} data-testid={`badge-${status}`}>{config.label}</Badge>;
  };

  if (statsLoading || intentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-dashboard">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your intent activity and system performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover-elevate" data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Intents</CardTitle>
          <CardDescription>Latest intent activity across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {intents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No intents yet. Create your first intent in the Intent Lab!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {intents.slice(-10).reverse().map((intent) => (
                <div
                  key={intent.id}
                  className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                  data-testid={`intent-item-${intent.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm" data-testid={`text-intent-id-${intent.id}`}>
                        #{intent.id}
                      </span>
                      {getStatusBadge(intent.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {intent.sourceAmount} tokens → {intent.minTargetAmount} min target
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(intent.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {intent.route && (
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {intent.route.protocol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Est. {intent.route.estimatedOutput.toFixed(2)} tokens
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {statistics.executorAddress && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Executor Address:</span>
              <span className="font-mono text-xs" data-testid="text-executor-address">
                {statistics.executorAddress}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
