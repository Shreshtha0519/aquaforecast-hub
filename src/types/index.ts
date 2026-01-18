export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Region {
  state: string;
  district: string;
  city: string;
}

export interface KPIData {
  demand: number;
  supply: number;
  efficiency: number;
  riskLevel: 'safe' | 'warning' | 'critical';
}

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

export interface ScenarioParams {
  populationGrowth: number;
  rainfallDecrease: number;
  industrialExpansion: number;
}

export interface ModelMetrics {
  rmse: number;
  mae: number;
  r2: number;
}

export interface ActualVsPredicted {
  actual: number;
  predicted: number;
}

export interface RegionComparison {
  region: string;
  data: { month: string; demand: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
