import { Link, useLocation } from 'wouter';
import { Home, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/intent-lab', label: 'Intent Lab', icon: Zap },
    { path: '/vaults', label: 'Vaults', icon: Shield },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="flex items-center gap-2 text-xl font-bold hover-elevate px-3 py-2 rounded-md" data-testid="link-home">
                <span className="text-primary">X</span>
                <span>IntentX</span>
              </a>
            </Link>

            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" data-testid="button-connect-wallet">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
