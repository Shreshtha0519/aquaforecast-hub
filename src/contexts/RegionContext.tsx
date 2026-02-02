import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Region {
  state: string;
  district: string;
  city: string;
}

export interface ForecastData {
  region: string;
  model_version: string;
  generated_at: string;
  forecast: Array<{
    month: string;
    demand_mld: number;
    confidence_lower?: number;
    confidence_upper?: number;
  }>;
}

export const REGION_DATA = {
  Maharashtra: {
    Pune: ['Haveli', 'Khed', 'Mulshi', 'Baramati'],
    Mumbai: ['Andheri', 'Borivali', 'Kurla', 'Dadar'],
    Nagpur: ['Kamptee', 'Hingna', 'Saoner'],
  },
  Karnataka: {
    Bangalore: ['North', 'South', 'East', 'West'],
    Mysore: ['Hunsur', 'Nanjangud', 'T Narasipura'],
    Hubli: ['Dharwad', 'Navalgund'],
  },
  Gujarat: {
    Ahmedabad: ['Daskroi', 'Sanand', 'Dholka'],
    Surat: ['Bardoli', 'Chorasi', 'Kamrej'],
  },
  Rajasthan: {
    Jaipur: ['Amber', 'Sanganer', 'Chomu'],
    Udaipur: ['Girwa', 'Vallabhnagar', 'Salumber'],
  },
};

interface RegionContextType {
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  forecastData: ForecastData | null;
  setForecastData: (data: ForecastData | null) => void;
}

const RegionContext = createContext<RegionContextType | null>(null);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState<Region>({
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Haveli',
  });

  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  return (
    <RegionContext.Provider value={{ selectedRegion, setSelectedRegion, forecastData, setForecastData }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
