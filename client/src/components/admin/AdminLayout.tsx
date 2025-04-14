import React, { ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { Home, ArrowLeft, AlertTriangle, CheckCircle, Server, Activity, Database, Globe, LineChart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminNavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();

  const navItems: AdminNavItem[] = [
    { path: '/dashboard', label: 'Return to Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/admin/system-check', label: 'System Check', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
    { path: '/admin/system-validator', label: 'System Validator', icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
    { path: '/admin/system-report', label: 'System Report', icon: <LineChart className="mr-2 h-4 w-4" /> },
    { path: '/admin/api-health', label: 'API Health Dashboard', icon: <Globe className="mr-2 h-4 w-4" /> },
    { path: '/admin/system-diagnostics', label: 'System Diagnostics', icon: <Brain className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen p-4 gap-6 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
          <h1 className="ml-4 text-2xl font-bold">CryptoBot Admin</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <a className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                      location === item.path 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      {item.icon}
                      {item.label}
                    </a>
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;