import React, { useMemo, useEffect } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { useScenario } from '@/contexts/ScenarioContext';
import { generateForecastData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sliders, Users, CloudRain, Factory, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const Scenario: React.FC = () => {
  const { selectedRegion } = useRegion();
  const { scenario, setScenario, dynamicRiskLevel, demandStorageRatio } = useScenario();
  
  const populationGrowth = scenario.populationGrowth;
  const rainfallDecrease = scenario.rainfallDecrease;
  const industrialExpansion = scenario.industrialExpansion;

  const setPopulationGrowth = (v: number) => setScenario({ ...scenario, populationGrowth: v });
  const setRainfallDecrease = (v: number) => setScenario({ ...scenario, rainfallDecrease: v });
  const setIndustrialExpansion = (v: number) => setScenario({ ...scenario, industrialExpansion: v });

  const baseData = useMemo(() => generateForecastData(12), [selectedRegion]);

  const scenarioData = useMemo(() => {
    return baseData.map((item, index) => {
      const popFactor = 1 + (populationGrowth / 100) * (index / 12);
      const rainFactor = 1 + (rainfallDecrease / 100) * 0.5;
      const indFactor = 1 + (industrialExpansion / 100) * 0.3;
      
      const scenarioPredicted = Math.round(
        item.predicted * popFactor * rainFactor * indFactor
      );
      
      return {
        ...item,
        baseline: item.predicted,
        scenario: scenarioPredicted,
      };
    });
  }, [baseData, populationGrowth, rainfallDecrease, industrialExpansion]);

  const impactScore = useMemo(() => {
    const lastScenario = scenarioData[scenarioData.length - 1].scenario;
    const lastBaseline = scenarioData[scenarioData.length - 1].baseline;
    return Math.round(((lastScenario - lastBaseline) / lastBaseline) * 100);
  }, [scenarioData]);

  const sliderConfig = [
    {
      id: 'population',
      label: 'Population Growth',
      icon: Users,
      value: populationGrowth,
      onChange: setPopulationGrowth,
      color: 'text-primary',
      unit: '%',
      description: 'Projected population increase over forecast period',
    },
    {
      id: 'rainfall',
      label: 'Rainfall Decrease',
      icon: CloudRain,
      value: rainfallDecrease,
      onChange: setRainfallDecrease,
      color: 'text-warning',
      unit: '%',
      description: 'Expected reduction in annual rainfall',
    },
    {
      id: 'industrial',
      label: 'Industrial Expansion',
      icon: Factory,
      value: industrialExpansion,
      onChange: setIndustrialExpansion,
      color: 'text-success',
      unit: '%',
      description: 'Industrial sector growth rate',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sliders className="w-7 h-7 text-primary" />
          Scenario Simulation
        </h1>
        <p className="text-muted-foreground mt-1">
          Adjust parameters to see how they affect water demand for {selectedRegion.city}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Parameters</CardTitle>
            <CardDescription>Adjust sliders to simulate scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {sliderConfig.map((slider) => (
              <div key={slider.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-foreground">
                    <slider.icon className={`w-4 h-4 ${slider.color}`} />
                    {slider.label}
                  </Label>
                  <Badge variant="outline" className="font-mono">
                    +{slider.value}{slider.unit}
                  </Badge>
                </div>
                <Slider
                  value={[slider.value]}
                  onValueChange={([v]) => slider.onChange(v)}
                  max={50}
                  step={1}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">{slider.description}</p>
              </div>
            ))}

            {/* Impact Summary */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Dynamic Risk Level:</span>
                <Badge
                  variant="outline"
                  className={
                    dynamicRiskLevel === 'critical'
                      ? 'bg-danger/10 text-danger border-danger/30'
                      : dynamicRiskLevel === 'warning'
                      ? 'bg-warning/10 text-warning border-warning/30'
                      : 'bg-success/10 text-success border-success/30'
                  }
                >
                  {dynamicRiskLevel === 'critical' ? '🔴' : dynamicRiskLevel === 'warning' ? '🟡' : '🟢'} {dynamicRiskLevel.charAt(0).toUpperCase() + dynamicRiskLevel.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Demand/Storage Ratio:</span>
                <Badge variant="outline" className="font-mono">
                  {demandStorageRatio.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Projected Impact:</span>
                <Badge
                  variant="outline"
                  className={
                    impactScore > 20
                      ? 'bg-danger/10 text-danger border-danger/30'
                      : impactScore > 10
                      ? 'bg-warning/10 text-warning border-warning/30'
                      : 'bg-success/10 text-success border-success/30'
                  }
                >
                  {impactScore > 0 ? '+' : ''}{impactScore}% Demand Change
                </Badge>
              </div>
              {impactScore > 20 && (
                <div className="flex items-center gap-2 mt-3 text-sm text-danger">
                  <AlertTriangle className="w-4 h-4" />
                  High impact scenario - review capacity planning
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2 glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Scenario Comparison</CardTitle>
            <CardDescription>
              Baseline prediction vs scenario-adjusted forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={scenarioData}>
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
                  dataKey="baseline"
                  stroke="hsl(210, 80%, 30%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Baseline Forecast"
                />
                <Line
                  type="monotone"
                  dataKey="scenario"
                  stroke="hsl(199, 89%, 48%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(199, 89%, 48%)', strokeWidth: 2, r: 4 }}
                  name="Scenario Forecast"
                  activeDot={{ r: 6, fill: 'hsl(199, 89%, 48%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scenario;
