import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function IntentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [naturalLanguageIntent, setNaturalLanguageIntent] = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  
  const [formData, setFormData] = useState({
    sourceToken: '0x' + '1'.repeat(40),
    targetToken: '0x' + '2'.repeat(40),
    sourceAmount: '',
    minTargetAmount: '',
    slippage: '0.5',
  });

  const parseIntentMutation = useMutation({
    mutationFn: async (intent) => {
      const response = await fetch('/api/intent/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse intent');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setParsedIntent(data);
      toast({
        title: 'Intent Parsed',
        description: `Detected: ${data.action} ${data.amount} ${data.fromToken} to ${data.toToken}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Parse Error',
        description: error.message || 'Failed to parse intent',
        variant: 'destructive',
      });
    },
  });

  const createIntentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('/api/intents', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/intents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      
      toast({
        title: 'Intent Created',
        description: 'Your intent has been successfully created and queued for execution.',
      });

      setNaturalLanguageIntent('');
      setParsedIntent(null);
      setFormData({
        sourceToken: formData.sourceToken,
        targetToken: formData.targetToken,
        sourceAmount: '',
        minTargetAmount: '',
        slippage: '0.5',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create intent',
        variant: 'destructive',
      });
    },
  });

  const handleParseIntent = (e) => {
    e.preventDefault();
    if (!naturalLanguageIntent.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an intent to parse',
        variant: 'destructive',
      });
      return;
    }
    parseIntentMutation.mutate(naturalLanguageIntent);
  };

  const handleSubmitParsedIntent = () => {
    if (!parsedIntent) return;
    
    createIntentMutation.mutate({
      sourceToken: parsedIntent.sourceToken,
      targetToken: parsedIntent.targetToken,
      sourceAmount: parsedIntent.sourceAmount,
      minTargetAmount: parsedIntent.minTargetAmount,
      slippage: parsedIntent.slippage || 0.5,
      user: '0x0000000000000000000000000000000000000000',
      signature: null,
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();

    if (!formData.sourceAmount || !formData.minTargetAmount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createIntentMutation.mutate({
      sourceToken: formData.sourceToken,
      targetToken: formData.targetToken,
      sourceAmount: formData.sourceAmount,
      minTargetAmount: formData.minTargetAmount,
      slippage: parseFloat(formData.slippage),
      user: '0x0000000000000000000000000000000000000000',
      signature: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Natural Language Intent
          </CardTitle>
          <CardDescription>
            Describe what you want to do in plain English (e.g., "Swap 1 ETH to USDC")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleParseIntent} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Swap 1 ETH to USDC"
                value={naturalLanguageIntent}
                onChange={(e) => setNaturalLanguageIntent(e.target.value)}
                className="min-h-[80px]"
                data-testid="textarea-natural-intent"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={parseIntentMutation.isPending}
              data-testid="button-parse-intent"
            >
              {parseIntentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing Intent...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse Intent
                </>
              )}
            </Button>
          </form>

          {parsedIntent && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted rounded-md space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default">Parsed Result</Badge>
                  <Badge variant="outline">{parsedIntent.source}</Badge>
                  {parsedIntent.confidence !== undefined && (
                    <Badge variant={parsedIntent.confidence > 0.7 ? 'default' : 'outline'}>
                      {Math.round(parsedIntent.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>

                {parsedIntent.warning && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                    ⚠️ {parsedIntent.warning}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Action</div>
                    <div className="font-medium">{parsedIntent.action}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">{parsedIntent.amount} {parsedIntent.fromToken}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">From</div>
                    <div className="font-medium">{parsedIntent.fromToken}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">To</div>
                    <div className="font-medium">{parsedIntent.toToken}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Estimated Output</div>
                    <div className="font-medium">{parsedIntent.estimatedOutput}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Gas Estimate</div>
                    <div className="font-medium">{parsedIntent.estimatedGas}</div>
                  </div>
                </div>

                {parsedIntent.bestRoute && (
                  <div className="p-2 bg-background rounded text-xs">
                    <div className="font-medium">{parsedIntent.bestRoute.protocol}</div>
                    <div className="text-muted-foreground">
                      Path: {parsedIntent.bestRoute.path.join(' → ')}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSubmitParsedIntent}
                className="w-full gap-2"
                disabled={createIntentMutation.isPending || (parsedIntent.usedFallback && parsedIntent.confidence < 0.5)}
                data-testid="button-submit-parsed-intent"
              >
                {createIntentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Intent...
                  </>
                ) : (parsedIntent.usedFallback && parsedIntent.confidence < 0.5) ? (
                  <>
                    Cannot Submit - Low Confidence
                  </>
                ) : (
                  <>
                    Submit Intent
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              {parsedIntent.usedFallback && parsedIntent.confidence < 0.5 && (
                <p className="text-xs text-muted-foreground text-center">
                  Try rephrasing your intent or use the manual form below
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowManualForm(!showManualForm)}
          data-testid="button-toggle-manual-form"
        >
          {showManualForm ? 'Hide' : 'Show'} Manual Form
        </Button>
      </div>

      {showManualForm && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Intent Form</CardTitle>
            <CardDescription>
              Specify exact parameters for your intent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceToken">Source Token Address</Label>
                  <Input
                    id="sourceToken"
                    name="sourceToken"
                    value={formData.sourceToken}
                    onChange={handleInputChange}
                    placeholder="0x..."
                    data-testid="input-source-token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetToken">Target Token Address</Label>
                  <Input
                    id="targetToken"
                    name="targetToken"
                    value={formData.targetToken}
                    onChange={handleInputChange}
                    placeholder="0x..."
                    data-testid="input-target-token"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceAmount">Source Amount</Label>
                  <Input
                    id="sourceAmount"
                    name="sourceAmount"
                    type="number"
                    step="0.01"
                    value={formData.sourceAmount}
                    onChange={handleInputChange}
                    placeholder="100.0"
                    required
                    data-testid="input-source-amount"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minTargetAmount">Min Target Amount</Label>
                  <Input
                    id="minTargetAmount"
                    name="minTargetAmount"
                    type="number"
                    step="0.01"
                    value={formData.minTargetAmount}
                    onChange={handleInputChange}
                    placeholder="95.0"
                    required
                    data-testid="input-min-target-amount"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
                <Input
                  id="slippage"
                  name="slippage"
                  type="number"
                  step="0.1"
                  value={formData.slippage}
                  onChange={handleInputChange}
                  placeholder="0.5"
                  data-testid="input-slippage"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={createIntentMutation.isPending}
                data-testid="button-create-intent"
              >
                {createIntentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Intent...
                  </>
                ) : (
                  <>
                    Create Intent
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
