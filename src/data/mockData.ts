export interface ForecastData {
  month: string;
  historical: number;
  predicted: number;
}

export interface SectorData {
  name: string;
  value: number;
  color: string;
}

export interface ActualVsPredicted {
  actual: number;
  predicted: number;
}

export interface KPIData {
  demand: number;
  supply: number;
  efficiency: number;
  riskLevel: 'safe' | 'warning' | 'critical';
}

export const generateForecastData = (months: number = 12): ForecastData[] => {
  const data: ForecastData[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < months; i++) {
    const baseValue = 1000 + Math.sin(i / 2) * 200;
    data.push({
      month: monthNames[i % 12],
      historical: Math.round(baseValue + Math.random() * 100),
      predicted: Math.round(baseValue + 50 + Math.random() * 80),
    });
  }
  return data;
};

export const sectorData: SectorData[] = [
  { name: 'Domestic', value: 45, color: 'hsl(199, 89%, 55%)' },
  { name: 'Agriculture', value: 35, color: 'hsl(142, 70%, 45%)' },
  { name: 'Industry', value: 20, color: 'hsl(38, 80%, 55%)' },
];

export const generateActualVsPredicted = (count: number = 50): ActualVsPredicted[] => {
  const data: ActualVsPredicted[] = [];
  for (let i = 0; i < count; i++) {
    const actual = 500 + Math.random() * 1000;
    const error = (Math.random() - 0.5) * 150;
    data.push({
      actual: Math.round(actual),
      predicted: Math.round(actual + error),
    });
  }
  return data;
};

export const getKPIData = (region: string): KPIData => {
  const regionHash = region.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const demand = 800 + (regionHash % 400);
  const supply = demand * (0.85 + (regionHash % 20) / 100);
  const efficiency = Math.min(100, Math.round((supply / demand) * 100));
  
  let riskLevel: 'safe' | 'warning' | 'critical' = 'safe';
  if (efficiency < 70) riskLevel = 'critical';
  else if (efficiency < 85) riskLevel = 'warning';
  
  return {
    demand: Math.round(demand),
    supply: Math.round(supply),
    efficiency,
    riskLevel,
  };
};

export const generateRegionComparisonData = (region: string) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hash = region.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  return monthNames.map((month, i) => ({
    month,
    demand: Math.round(800 + hash % 200 + Math.sin(i) * 100 + Math.random() * 50),
  }));
};

export const modelMetrics = {
  rmse: 45.23,
  mae: 32.18,
  r2: 0.94,
};
