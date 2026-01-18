import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'from-primary/10 to-transparent border-primary/20',
    success: 'from-success/10 to-transparent border-success/20',
    warning: 'from-warning/10 to-transparent border-warning/20',
    danger: 'from-danger/10 to-transparent border-danger/20',
  };

  const iconStyles = {
    default: 'bg-primary/20 text-primary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-danger/20 text-danger',
  };

  return (
    <Card className={cn(
      'kpi-card bg-gradient-to-br border overflow-hidden',
      variantStyles[variant]
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn('p-2 rounded-lg', iconStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {trend && trendValue && (
            <div className={cn(
              'text-sm font-medium px-2 py-1 rounded-md',
              trend === 'up' && 'bg-success/10 text-success',
              trend === 'down' && 'bg-danger/10 text-danger',
              trend === 'neutral' && 'bg-muted text-muted-foreground'
            )}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
