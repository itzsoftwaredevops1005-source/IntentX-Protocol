import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import IntentForm from '@/components/IntentForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, X, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function IntentLab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: intentsData, isLoading } = useQuery({
    queryKey: ['/api/intents'],
  });

  const intents = intentsData?.intents || [];

  const executeIntentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest(`/api/intents/${id}/execute`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/intents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      
      toast({
        title: 'Intent Executed',
        description: 'Intent has been successfully executed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Execution Failed',
        description: error.message || 'Failed to execute intent',
        variant: 'destructive',
      });
    },
  });

  const cancelIntentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest(`/api/intents/${id}/cancel`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/intents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      
      toast({
        title: 'Intent Cancelled',
        description: 'Intent has been cancelled.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel intent',
        variant: 'destructive',
      });
    },
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'executing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'default', label: 'Pending' },
      executing: { variant: 'secondary', label: 'Executing' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
      failed: { variant: 'destructive', label: 'Failed' },
    };

    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-intent-lab">Intent Lab</h1>
        <p className="text-muted-foreground">
          Create and manage your intent-based swaps with AI-powered route optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <IntentForm />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Intents</CardTitle>
              <CardDescription>
                Manage your pending and executing intents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : intents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No intents created yet</p>
                  <p className="text-sm mt-2">Create your first intent using the form</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {intents.map((intent) => (
                    <div
                      key={intent.id}
                      className="p-4 border rounded-md space-y-3"
                      data-testid={`card-intent-${intent.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(intent.status)}
                          <span className="font-mono text-sm font-medium">
                            #{intent.id}
                          </span>
                          {getStatusBadge(intent.status)}
                        </div>
                        <div className="flex gap-2">
                          {intent.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => executeIntentMutation.mutate(intent.id)}
                                disabled={executeIntentMutation.isPending}
                                data-testid={`button-execute-${intent.id}`}
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelIntentMutation.mutate(intent.id)}
                                disabled={cancelIntentMutation.isPending}
                                data-testid={`button-cancel-${intent.id}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs">Source Amount</div>
                          <div className="font-medium">{intent.sourceAmount}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Min Target</div>
                          <div className="font-medium">{intent.minTargetAmount}</div>
                        </div>
                      </div>

                      {intent.route && (
                        <div className="p-2 bg-muted rounded-md text-sm">
                          <div className="font-medium">{intent.route.protocol}</div>
                          <div className="text-xs text-muted-foreground">
                            Est. Output: {intent.route.estimatedOutput.toFixed(2)} • 
                            Gas: {intent.route.gasEstimate}
                          </div>
                        </div>
                      )}

                      {intent.status === 'completed' && intent.actualTargetAmount && (
                        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-md text-sm">
                          <div className="text-green-600 dark:text-green-400 font-medium">
                            Actual Output: {intent.actualTargetAmount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Executed at: {new Date(intent.executedAt).toLocaleString()}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(intent.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
