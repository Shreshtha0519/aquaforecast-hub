import React from 'react';
import { REGION_DATA } from '@/contexts/RegionContext';
import { generateRegionComparisonData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GitCompare, MapPin } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Comparison() {
  const allCities: string[] = React.useMemo(() => {
    const cities: string[] = [];
    Object.entries(REGION_DATA).forEach(([, districts]) => {
      Object.entries(districts).forEach(([district, citiesList]) => {
        citiesList.forEach((city) => {
          cities.push(`${city}, ${district}`);
        });
      });
    });
    return cities;
  }, []);

  const [region1, setRegion1] = React.useState(allCities[0]);
  const [region2, setRegion2] = React.useState(allCities[4]);

  const comparisonData = React.useMemo(() => {
    const data1 = generateRegionComparisonData(region1);
    const data2 = generateRegionComparisonData(region2);

    return data1.map((item, index) => ({
      month: item.month,
      [region1]: item.demand,
      [region2]: data2[index]?.demand || 0,
    }));
  }, [region1, region2]);

  const avgDemand1 = Math.round(
    comparisonData.reduce((sum, d) => sum + (d[region1] as number), 0) / comparisonData.length
  );
  const avgDemand2 = Math.round(
    comparisonData.reduce((sum, d) => sum + (d[region2] as number), 0) / comparisonData.length
  );

  const growth1 = Math.round(
    (((comparisonData[11]?.[region1] as number) - (comparisonData[0]?.[region1] as number)) /
      (comparisonData[0]?.[region1] as number)) *
      100
  );
  const growth2 = Math.round(
    (((comparisonData[11]?.[region2] as number) - (comparisonData[0]?.[region2] as number)) /
      (comparisonData[0]?.[region2] as number)) *
      100
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GitCompare className="w-7 h-7 text-primary" />
          Region Comparison
        </h1>
        <p className="text-muted-foreground mt-1">
          Compare water demand trends between two regions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" /> Region 1
            </Label>
            <Select value={region1} onValueChange={setRegion1}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-60">
                {allCities.map((city) => (
                  <SelectItem key={city} value={city} disabled={city === region2}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Avg Demand</p>
                <p className="text-xl font-bold text-foreground">{avgDemand1} MLD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">YoY Growth</p>
                <Badge
                  variant="outline"
                  className={growth1 >= 0 ? 'text-warning border-warning/30' : 'text-success border-success/30'}
                >
                  {growth1 >= 0 ? '+' : ''}{growth1}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-success/30 bg-gradient-to-br from-success/5 to-transparent">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-success" /> Region 2
            </Label>
            <Select value={region2} onValueChange={setRegion2}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-60">
                {allCities.map((city) => (
                  <SelectItem key={city} value={city} disabled={city === region1}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Avg Demand</p>
                <p className="text-xl font-bold text-foreground">{avgDemand2} MLD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">YoY Growth</p>
                <Badge
                  variant="outline"
                  className={growth2 >= 0 ? 'text-warning border-warning/30' : 'text-success border-success/30'}
                >
                  {growth2 >= 0 ? '+' : ''}{growth2}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Demand Growth Comparison</CardTitle>
          <CardDescription>12-month demand trends for selected regions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
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
                dataKey={region1}
                stroke="hsl(199, 89%, 48%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(199, 89%, 48%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey={region2}
                stroke="hsl(142, 70%, 45%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(142, 70%, 45%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
