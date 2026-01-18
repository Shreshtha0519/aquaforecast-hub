import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateActualVsPredicted, modelMetrics } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, TrendingDown, Sigma, AlertCircle } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const Performance: React.FC = () => {
  const { hasPermission } = useAuth();
  const scatterData = generateActualVsPredicted(50);

  const canAccess = hasPermission(['admin']);

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="glass-card border-warning/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Admin Access Required</h3>
            <p className="text-muted-foreground mt-2">
              Model performance metrics are only available to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'RMSE',
      value: modelMetrics.rmse.toFixed(2),
      description: 'Root Mean Square Error',
      icon: TrendingDown,
      status: modelMetrics.rmse < 50 ? 'good' : 'warning',
    },
    {
      label: 'MAE',
      value: modelMetrics.mae.toFixed(2),
      description: 'Mean Absolute Error',
      icon: Target,
      status: modelMetrics.mae < 40 ? 'good' : 'warning',
    },
    {
      label: 'R² Score',
      value: modelMetrics.r2.toFixed(2),
      description: 'Coefficient of Determination',
      icon: Sigma,
      status: modelMetrics.r2 > 0.9 ? 'good' : 'warning',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          Model Performance
        </h1>
        <p className="text-muted-foreground mt-1">
          Evaluate prediction accuracy and model metrics
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricCards.map((metric) => (
          <Card
            key={metric.label}
            className={`glass-card border-border/50 ${
              metric.status === 'good' ? 'border-l-4 border-l-success' : 'border-l-4 border-l-warning'
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${metric.status === 'good' ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <metric.icon className={`w-6 h-6 ${metric.status === 'good' ? 'text-success' : 'text-warning'}`} />
                </div>
              </div>
              <Badge
                variant="outline"
                className={`mt-4 ${
                  metric.status === 'good'
                    ? 'border-success/30 text-success bg-success/10'
                    : 'border-warning/30 text-warning bg-warning/10'
                }`}
              >
                {metric.status === 'good' ? '✓ Within Target' : '⚠ Needs Improvement'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scatter Plot */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Actual vs Predicted Values</CardTitle>
          <CardDescription>
            Each point represents a prediction. Points closer to the diagonal line indicate better accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 30%, 88%)" />
              <XAxis
                type="number"
                dataKey="actual"
                name="Actual"
                unit=" MLD"
                stroke="hsl(210, 20%, 45%)"
                fontSize={12}
                label={{ value: 'Actual Demand (MLD)', position: 'bottom', offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="predicted"
                name="Predicted"
                unit=" MLD"
                stroke="hsl(210, 20%, 45%)"
                fontSize={12}
                label={{ value: 'Predicted Demand (MLD)', angle: -90, position: 'left' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(210, 30%, 88%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [`${value} MLD`, name]}
              />
              <ReferenceLine
                segment={[
                  { x: 500, y: 500 },
                  { x: 1500, y: 1500 },
                ]}
                stroke="hsl(142, 70%, 45%)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Scatter
                name="Predictions"
                data={scatterData}
                fill="hsl(199, 89%, 48%)"
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Green dashed line represents perfect prediction (Actual = Predicted)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
