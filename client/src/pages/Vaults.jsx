import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, TrendingUp, Zap, ArrowRight } from 'lucide-react';

export default function Vaults() {
  const vaults = [
    {
      id: 1,
      name: 'Stable Yield Vault',
      description: 'Automated yield farming with stablecoin pairs',
      tvl: '$1,250,000',
      apy: '12.5%',
      risk: 'Low',
      status: 'Active',
      icon: Shield,
    },
    {
      id: 2,
      name: 'DeFi Blue Chip Vault',
      description: 'Diversified exposure to top DeFi protocols',
      tvl: '$850,000',
      apy: '18.2%',
      risk: 'Medium',
      status: 'Active',
      icon: TrendingUp,
    },
    {
      id: 3,
      name: 'High-Velocity Trading Vault',
      description: 'Intent-driven algorithmic trading strategies',
      tvl: '$500,000',
      apy: '24.7%',
      risk: 'High',
      status: 'Active',
      icon: Zap,
    },
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'High':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-vaults">Vaults</h1>
        <p className="text-muted-foreground">
          Automated yield strategies powered by intent-based execution
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Intent-Powered Vaults
          </CardTitle>
          <CardDescription>
            Vaults use IntentX's AI-powered route optimization to maximize yields while minimizing gas costs. 
            Each vault continuously monitors opportunities and executes optimal strategies using intent-based swaps.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaults.map((vault) => {
          const Icon = vault.icon;
          return (
            <Card key={vault.id} className="hover-elevate" data-testid={`card-vault-${vault.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="default">{vault.status}</Badge>
                </div>
                <CardTitle className="text-lg">{vault.name}</CardTitle>
                <CardDescription>{vault.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">TVL</div>
                    <div className="text-lg font-bold" data-testid={`text-tvl-${vault.id}`}>
                      {vault.tvl}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">APY</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400" data-testid={`text-apy-${vault.id}`}>
                      {vault.apy}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Risk Level</div>
                  <Badge className={getRiskColor(vault.risk)} data-testid={`badge-risk-${vault.id}`}>
                    {vault.risk} Risk
                  </Badge>
                </div>

                <div className="pt-2 border-t">
                  <Button className="w-full gap-2" data-testid={`button-deposit-${vault.id}`}>
                    Deposit
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">Wave 3 Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Full vault functionality including deposits, withdrawals, and automated strategy execution 
            will be available in Wave 3 with mainnet deployment. The current demo showcases the UI and 
            vault structure that will be powered by on-chain smart contracts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
