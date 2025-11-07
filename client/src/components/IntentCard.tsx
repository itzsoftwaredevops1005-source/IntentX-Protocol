import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/web3";

interface IntentCardProps {
  id: string;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
  status: "pending" | "executed" | "cancelled";
  createdAt: string;
  executedAmount?: string;
  onCancel?: (id: string) => void;
}

export default function IntentCard({
  id,
  sourceToken,
  targetToken,
  sourceAmount,
  status,
  createdAt,
  executedAmount,
  onCancel,
}: IntentCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      color: "bg-chart-4 text-chart-4",
    },
    executed: {
      icon: CheckCircle2,
      label: "Executed",
      color: "bg-status-online text-status-online",
    },
    cancelled: {
      icon: XCircle,
      label: "Cancelled",
      color: "bg-status-busy text-status-busy",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="hover-elevate" data-testid={`card-intent-${id}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">
                {sourceToken} → {targetToken}
              </h3>
              <Badge variant="outline" className={`${config.color.split(' ')[1]}/20`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-mono font-medium">
              {formatAmount(sourceAmount)} {sourceToken}
            </span>
          </div>
          {executedAmount && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Received:</span>
              <span className="font-mono font-medium text-status-online">
                {formatAmount(executedAmount)} {targetToken}
              </span>
            </div>
          )}
        </div>

        {status === "pending" && onCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(id)}
            data-testid={`button-cancel-${id}`}
            className="w-full hover-elevate active-elevate-2"
          >
            Cancel Intent
          </Button>
        )}

        {status === "pending" && !onCancel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for execution...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
