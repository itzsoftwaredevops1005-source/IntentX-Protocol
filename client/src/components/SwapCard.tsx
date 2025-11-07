import { useState } from "react";
import { ArrowDownUp, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SUPPORTED_TOKENS } from "@/lib/web3";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { createIntent } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function SwapCard() {
  const { isConnected, connect, address, signMessage } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("1");
  const [customSlippage, setCustomSlippage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const createIntentMutation = useMutation({
    mutationFn: async (data: {
      sourceToken: string;
      targetToken: string;
      sourceAmount: string;
      minTargetAmount: string;
      slippage: string;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      // Create comprehensive message with all fields and timestamp for Account Abstraction
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "createIntent",
        sourceToken: data.sourceToken,
        targetToken: data.targetToken,
        sourceAmount: data.sourceAmount,
        minTargetAmount: data.minTargetAmount,
        slippage: data.slippage,
        timestamp,
      });
      const signature = await signMessage(message);

      return createIntent({
        userAddress: address,
        sourceToken: data.sourceToken,
        targetToken: data.targetToken,
        sourceAmount: data.sourceAmount,
        minTargetAmount: data.minTargetAmount,
        slippage: data.slippage,
        status: "pending",
        signature,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents", address] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Intent Created! 🎉",
        description: `Your swap intent has been created and will be executed shortly.`,
      });
      setFromAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Intent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleCreateIntent = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap.",
        variant: "destructive",
      });
      return;
    }

    const estimatedOutput = (parseFloat(fromAmount) * 1850).toFixed(6);
    const finalSlippage = customSlippage || slippage;

    createIntentMutation.mutate({
      sourceToken: fromToken,
      targetToken: toToken,
      sourceAmount: fromAmount,
      minTargetAmount: estimatedOutput,
      slippage: finalSlippage,
    });
  };

  const estimatedOutput = fromAmount ? (parseFloat(fromAmount) * 1850).toFixed(2) : "0.00";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Swap</CardTitle>
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-swap-settings"
                className="hover-elevate active-elevate-2"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute right-4 mt-2 z-10">
              <Card className="w-64 p-4">
                <Label className="text-sm font-medium mb-3 block">Slippage Tolerance</Label>
                <div className="flex gap-2 mb-3">
                  {["0.5", "1", "2"].map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={slippage === value && !customSlippage ? "default" : "outline"}
                      onClick={() => {
                        setSlippage(value);
                        setCustomSlippage("");
                      }}
                      data-testid={`button-slippage-${value}`}
                      className="flex-1 hover-elevate active-elevate-2"
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => setCustomSlippage(e.target.value)}
                    data-testid="input-custom-slippage"
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">From</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              data-testid="input-from-amount"
              className="flex-1 text-2xl h-14 font-mono"
            />
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-32 h-14" data-testid="select-from-token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_TOKENS.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{token.logo}</span>
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">Balance: 2.5 {fromToken}</div>
        </div>

        <div className="flex justify-center -my-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleSwapTokens}
            data-testid="button-swap-direction"
            className="rounded-full w-10 h-10 hover-elevate active-elevate-2"
          >
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">To</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="0.0"
              value={estimatedOutput}
              readOnly
              data-testid="input-to-amount"
              className="flex-1 text-2xl h-14 font-mono bg-muted/30"
            />
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-32 h-14" data-testid="select-to-token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_TOKENS.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{token.logo}</span>
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {fromAmount && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated Rate</span>
              <span className="font-mono">1 {fromToken} ≈ 1850 {toToken}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Slippage</span>
              <span className="font-mono">{customSlippage || slippage}%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Route optimized via Account Abstraction</span>
            </div>
          </div>
        )}

        {isConnected ? (
          <Button
            size="lg"
            className="w-full h-14 text-base hover-elevate active-elevate-2"
            onClick={handleCreateIntent}
            disabled={createIntentMutation.isPending}
            data-testid="button-create-intent"
          >
            {createIntentMutation.isPending ? "Creating Intent..." : "Create Intent"}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full h-14 text-base hover-elevate active-elevate-2"
            onClick={connect}
            data-testid="button-connect-to-swap"
          >
            Connect Wallet to Swap
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
