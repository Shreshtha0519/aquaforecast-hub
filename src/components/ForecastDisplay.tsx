/**
 * Forecast Display Component
 * Displays ML model predictions with interactive chart and data table
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { ForecastResponse } from '@/services/forecastAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';

interface ForecastDisplayProps {
  data: ForecastResponse;
  onRefresh?: () => void;
  onExport?: () => void;
}

export const ForecastDisplay: React.FC<ForecastDisplayProps> = ({
  data,
  onRefresh,
  onExport,
}) => {
  // Transform data for chart
  const chartData = data.forecast.map((point) => ({
    month: point.month,
    demand: point.demand_mld,
    lower: point.confidence_lower,
    upper: point.confidence_upper,
  }));

  // Calculate statistics
  const avgDemand = data.forecast.reduce((sum, p) => sum + p.demand_mld, 0) / data.forecast.length;
  const maxDemand = Math.max(...data.forecast.map(p => p.demand_mld));
  const minDemand = Math.min(...data.forecast.map(p => p.demand_mld));
  const trend = data.forecast[data.forecast.length - 1].demand_mld - data.forecast[0].demand_mld;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Water Demand Forecast</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.region} • {data.forecast.length} months ahead
            </p>
          </div>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgDemand.toFixed(1)} MLD</div>
            <p className="text-sm text-muted-foreground">Average Demand</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{maxDemand.toFixed(1)} MLD</div>
            <p className="text-sm text-muted-foreground">Peak Demand</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{minDemand.toFixed(1)} MLD</div>
            <p className="text-sm text-muted-foreground">Minimum Demand</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className={trend >= 0 ? 'text-orange-500' : 'text-green-500'} />
              <div className="text-2xl font-bold">
                {trend > 0 ? '+' : ''}{trend.toFixed(1)} MLD
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Trend</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Forecast Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{ value: 'Demand (MLD)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              
              {/* Confidence interval area */}
              {chartData[0].lower && (
                <Area
                  type="monotone"
                  dataKey="upper"
                  fill="hsl(var(--primary))"
                  stroke="none"
                  fillOpacity={0.1}
                  legendType="none"
                />
              )}
              {chartData[0].lower && (
                <Area
                  type="monotone"
                  dataKey="lower"
                  fill="white"
                  stroke="none"
                  legendType="none"
                />
              )}
              
              {/* Main forecast line */}
              <Line
                type="monotone"
                dataKey="demand"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Forecasted Demand"
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* Confidence level info */}
          <div className="mt-4 text-sm text-muted-foreground">
            Shaded area represents {(data.confidence_level * 100).toFixed(0)}% confidence interval
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Forecast Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Month</th>
                  <th className="text-right py-2 px-4">Demand (MLD)</th>
                  {data.forecast[0].confidence_lower && (
                    <>
                      <th className="text-right py-2 px-4">Lower Bound</th>
                      <th className="text-right py-2 px-4">Upper Bound</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.forecast.map((point, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{point.month}</td>
                    <td className="text-right py-2 px-4 font-medium">
                      {point.demand_mld.toFixed(2)}
                    </td>
                    {point.confidence_lower && (
                      <>
                        <td className="text-right py-2 px-4 text-muted-foreground">
                          {point.confidence_lower.toFixed(2)}
                        </td>
                        <td className="text-right py-2 px-4 text-muted-foreground">
                          {point.confidence_upper?.toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Model Version</p>
              <p className="font-medium">{data.model_version}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Generated At</p>
              <p className="font-medium">
                {new Date(data.generated_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Confidence Level</p>
              <p className="font-medium">{(data.confidence_level * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data Source</p>
              <p className="font-medium">
                {data.metadata.cached ? 'Cached' : 'Fresh'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
