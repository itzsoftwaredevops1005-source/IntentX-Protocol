import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';

export default function IntentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    sourceToken: '0x' + '1'.repeat(40),
    targetToken: '0x' + '2'.repeat(40),
    sourceAmount: '',
    minTargetAmount: '',
    slippage: '0.5',
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

  const handleSubmit = (e) => {
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
    <Card>
      <CardHeader>
        <CardTitle>Create New Intent</CardTitle>
        <CardDescription>
          Specify what you want to achieve and IntentX will find the optimal path
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}
