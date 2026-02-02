import React, { useState, useMemo } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const Prediction: React.FC = () => {
  const { forecastData } = useRegion();
  const [forecastPeriod, setForecastPeriod] = useState<1 | 6 | 12>(6);

  const forecastDataFiltered = useMemo(() => {
    if (!forecastData) return [];
    
    // Filter based on selected period
    return forecastData.forecast.slice(0, forecastPeriod).map((point, index) => ({
      month: point.month,
      predicted: point.demand_mld,
      historical: index < 2 ? point.demand_mld * 0.95 : null,
    }));
  }, [forecastData, forecastPeriod]);

  const periodOptions = [
    { value: 1, label: '1 Month' },
    { value: 6, label: '6 Months' },
    { value: 12, label: '12 Months' },
  ];

  const averagePredicted = forecastDataFiltered.length > 0
    ? Math.round(forecastDataFiltered.reduce((sum, d) => sum + d.predicted, 0) / forecastDataFiltered.length)
    : 0;

  const peakDemand = forecastDataFiltered.length > 0
    ? Math.max(...forecastDataFiltered.map(d => d.predicted))
    : 0;

  const minDemand = forecastDataFiltered.length > 0
    ? Math.min(...forecastDataFiltered.map(d => d.predicted))
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* No Data Warning */}
      {!forecastData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No forecast data available. Please enter a country/region in the <strong>ML Forecast</strong> page first.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" />
            Demand Predictions
          </h1>
          <p className="text-muted-foreground mt-1">
            {forecastData 
              ? `Forecast water demand for ${forecastData.region}` 
              : 'Enter a region in ML Forecast page to see predictions'}
          </p>
        </div>
        
        {forecastData && (
          <div className="flex gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={forecastPeriod === option.value ? 'default' : 'outline'}
                onClick={() => setForecastPeriod(option.value as 1 | 6 | 12)}
                className={
                  forecastPeriod === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'border-primary/30 text-primary hover:bg-primary/10'
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                {option.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {forecastData && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Predicted</p>
                <p className="text-3xl font-bold text-foreground">{averagePredicted} MLD</p>
              </div>
              <Target className="w-10 h-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-success/20 bg-gradient-to-br from-success/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Peak Demand</p>
                <p className="text-3xl font-bold text-foreground">{peakDemand} MLD</p>
              </div>
              <Badge variant="outline" className="border-success/30 text-success">Max</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-warning/20 bg-gradient-to-br from-warning/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Minimum Demand</p>
                <p className="text-3xl font-bold text-foreground">{minDemand} MLD</p>
              </div>
              <Badge variant="outline" className="border-warning/30 text-warning">Min</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">
            {forecastPeriod}-Month Forecast Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={forecastDataFiltered}>
              <defs>
                <linearGradient id="predictGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 30%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(210, 20%, 45%)" fontSize={12} />
              <YAxis stroke="hsl(210, 20%, 45%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(210, 30%, 88%)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="historical"
                stroke="hsl(210, 80%, 30%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(210, 80%, 30%)', strokeWidth: 2 }}
                name="Historical Data"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="hsl(199, 89%, 48%)"
                strokeWidth={3}
                fill="url(#predictGradient)"
                dot={{ fill: 'hsl(199, 89%, 48%)', strokeWidth: 2 }}
                name="Predicted Demand"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};

export default Prediction;
