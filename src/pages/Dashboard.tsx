import React, { useMemo } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { getKPIData, generateForecastData, sectorData } from '@/data/mockData';
import KPICard from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Gauge, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

const Dashboard: React.FC = () => {
  const { selectedRegion } = useRegion();
  const regionKey = `${selectedRegion.state}-${selectedRegion.district}-${selectedRegion.city}`;
  
  const kpiData = useMemo(() => getKPIData(regionKey), [regionKey]);
  const forecastData = useMemo(() => generateForecastData(12), [regionKey]);

  const riskVariant = {
    safe: 'success' as const,
    warning: 'warning' as const,
    critical: 'danger' as const,
  };

  const riskEmoji = {
    safe: '🟢',
    warning: '🟡',
    critical: '🔴',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Water Demand"
          value={`${kpiData.demand} MLD`}
          subtitle="Million Liters/Day"
          icon={Droplets}
          trend="up"
          trendValue="+3.2%"
        />
        <KPICard
          title="Water Supply"
          value={`${kpiData.supply} MLD`}
          subtitle="Current Capacity"
          icon={TrendingUp}
          trend={kpiData.supply >= kpiData.demand ? 'up' : 'down'}
          trendValue={kpiData.supply >= kpiData.demand ? 'Sufficient' : 'Deficit'}
          variant={kpiData.supply >= kpiData.demand ? 'success' : 'warning'}
        />
        <KPICard
          title="Efficiency Score"
          value={kpiData.efficiency}
          subtitle="Out of 100"
          icon={Gauge}
          variant={kpiData.efficiency >= 85 ? 'success' : kpiData.efficiency >= 70 ? 'warning' : 'danger'}
        />
        <KPICard
          title="Risk Level"
          value={`${riskEmoji[kpiData.riskLevel]} ${kpiData.riskLevel.charAt(0).toUpperCase() + kpiData.riskLevel.slice(1)}`}
          subtitle="Current Assessment"
          icon={AlertTriangle}
          variant={riskVariant[kpiData.riskLevel]}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Line Chart */}
        <Card className="lg:col-span-2 glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Demand Forecast - Historical vs Predicted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0}/>
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
                <Area
                  type="monotone"
                  dataKey="historical"
                  stroke="hsl(199, 89%, 48%)"
                  strokeWidth={2}
                  fill="url(#historicalGradient)"
                  name="Historical"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(142, 70%, 45%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  name="Predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Donut Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary" />
              Sector Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Share']}
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(210, 30%, 88%)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
