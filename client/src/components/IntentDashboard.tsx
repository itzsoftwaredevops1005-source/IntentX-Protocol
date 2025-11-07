import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IntentCard from "./IntentCard";
import { FileX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIntentsByUser, cancelIntent } from "@/lib/api";
import type { Intent } from "@shared/schema";

export default function IntentDashboard() {
  const { toast } = useToast();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  const { data: intents = [], isLoading } = useQuery<Intent[]>({
    queryKey: ["/api/intents", address],
    enabled: !!address,
    queryFn: () => getIntentsByUser(address!),
    refetchInterval: 5000, // Refetch every 5 seconds to see executor updates
  });

  const cancelMutation = useMutation({
    mutationFn: cancelIntent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents", address] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Intent Cancelled",
        description: "Your swap intent has been cancelled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Cancel Intent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id);
  };

  const filterIntents = (status?: string) => {
    if (!status) return intents;
    return intents.filter((intent) => intent.status === status);
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileX className="w-16 h-16 text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Intent Dashboard</h2>
        <p className="text-muted-foreground">
          Track and manage your swap intents
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({intents.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({filterIntents("pending").length})
          </TabsTrigger>
          <TabsTrigger value="executed" data-testid="tab-executed">
            Executed ({filterIntents("executed").length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled">
            Cancelled ({filterIntents("cancelled").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {intents.length === 0 ? (
            <EmptyState message="No intents yet. Create your first swap intent!" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intents.map((intent) => (
                <IntentCard
                  key={intent.id}
                  id={intent.id}
                  sourceToken={intent.sourceToken}
                  targetToken={intent.targetToken}
                  sourceAmount={intent.sourceAmount}
                  status={intent.status as "pending" | "executed" | "cancelled"}
                  createdAt={intent.createdAt.toString()}
                  executedAmount={intent.executedAmount || undefined}
                  onCancel={intent.status === "pending" ? handleCancel : undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterIntents("pending").length === 0 ? (
            <EmptyState message="No pending intents" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterIntents("pending").map((intent) => (
                <IntentCard
                  key={intent.id}
                  id={intent.id}
                  sourceToken={intent.sourceToken}
                  targetToken={intent.targetToken}
                  sourceAmount={intent.sourceAmount}
                  status="pending"
                  createdAt={intent.createdAt.toString()}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executed" className="space-y-4">
          {filterIntents("executed").length === 0 ? (
            <EmptyState message="No executed intents yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterIntents("executed").map((intent) => (
                <IntentCard
                  key={intent.id}
                  id={intent.id}
                  sourceToken={intent.sourceToken}
                  targetToken={intent.targetToken}
                  sourceAmount={intent.sourceAmount}
                  status="executed"
                  createdAt={intent.createdAt.toString()}
                  executedAmount={intent.executedAmount || undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filterIntents("cancelled").length === 0 ? (
            <EmptyState message="No cancelled intents" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterIntents("cancelled").map((intent) => (
                <IntentCard
                  key={intent.id}
                  id={intent.id}
                  sourceToken={intent.sourceToken}
                  targetToken={intent.targetToken}
                  sourceAmount={intent.sourceAmount}
                  status="cancelled"
                  createdAt={intent.createdAt.toString()}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
