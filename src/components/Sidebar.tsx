import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import RegionSelector from './RegionSelector';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  Sliders,
  Upload,
  MessageSquare,
  BarChart3,
  GitCompare,
  HelpCircle,
  LogOut,
  Droplets,
  Shield,
  Eye,
  ChartLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const Sidebar: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'analyst', 'viewer'] },
    { path: '/prediction', icon: TrendingUp, label: 'Predictions', roles: ['admin', 'analyst', 'viewer'] },
    { path: '/scenario', icon: Sliders, label: 'Simulations', roles: ['admin', 'analyst'] },
    { path: '/data', icon: Upload, label: 'Data Upload', roles: ['admin', 'analyst'] },
    { path: '/ask-ai', icon: MessageSquare, label: 'Ask AI', roles: ['admin', 'analyst', 'viewer'] },
    { path: '/performance', icon: BarChart3, label: 'Model Performance', roles: ['admin'] },
    { path: '/comparison', icon: GitCompare, label: 'Compare Regions', roles: ['admin', 'analyst', 'viewer'] },
    { path: '/help', icon: HelpCircle, label: 'Help & Support', roles: ['admin', 'analyst', 'viewer'] },
  ];

  const roleConfig = {
    admin: { icon: Shield, color: 'bg-primary/20 text-primary', label: 'Admin' },
    analyst: { icon: ChartLine, color: 'bg-success/20 text-success', label: 'Analyst' },
    viewer: { icon: Eye, color: 'bg-warning/20 text-warning', label: 'Viewer' },
  };

  const userRoleConfig = user ? roleConfig[user.role] : null;

  return (
    <aside className="w-64 min-h-screen sidebar-gradient border-r border-sidebar-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <Droplets className="w-8 h-8 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">AquaForecast</h1>
            <p className="text-xs text-sidebar-foreground/60">Water Demand System</p>
          </div>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Region Selector */}
      <RegionSelector />

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const hasAccess = hasPermission(item.roles as any);
          if (!hasAccess) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-foreground font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            {userRoleConfig && (
              <Badge variant="outline" className={cn('text-xs', userRoleConfig.color)}>
                {userRoleConfig.label}
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
