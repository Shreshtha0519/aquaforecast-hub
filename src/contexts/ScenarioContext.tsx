import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useRegion } from './RegionContext';
import { getKPIData } from '@/data/mockData';

interface ScenarioState {
  populationGrowth: number;
  rainfallDecrease: number;
  industrialExpansion: number;
}

interface ScenarioContextType {
  scenario: ScenarioState;
  setScenario: (scenario: ScenarioState) => void;
  dynamicRiskLevel: 'safe' | 'warning' | 'critical';
  projectedDemand: number;
  currentStorage: number;
  demandStorageRatio: number;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const { selectedRegion } = useRegion();
  const [scenario, setScenario] = useState<ScenarioState>({
    populationGrowth: 0,
    rainfallDecrease: 0,
    industrialExpansion: 0,
  });

  const kpiData = useMemo(() => {
    const regionKey = `${selectedRegion.state}-${selectedRegion.district}-${selectedRegion.city}`;
    return getKPIData(regionKey);
  }, [selectedRegion]);

  const { dynamicRiskLevel, projectedDemand, currentStorage, demandStorageRatio } = useMemo(() => {
    // Calculate scenario-adjusted demand
    const popFactor = 1 + (scenario.populationGrowth / 100);
    const rainFactor = 1 + (scenario.rainfallDecrease / 100) * 0.5;
    const indFactor = 1 + (scenario.industrialExpansion / 100) * 0.3;
    
    const adjustedDemand = Math.round(kpiData.demand * popFactor * rainFactor * indFactor);
    const storage = kpiData.supply; // Use supply as proxy for storage capacity
    const ratio = (adjustedDemand / storage) * 100;

    // Determine dynamic risk level based on demand/storage ratio
    let risk: 'safe' | 'warning' | 'critical' = 'safe';
    if (ratio >= 85) {
      risk = 'critical';
    } else if (ratio >= 70) {
      risk = 'warning';
    }

    return {
      dynamicRiskLevel: risk,
      projectedDemand: adjustedDemand,
      currentStorage: storage,
      demandStorageRatio: ratio,
    };
  }, [kpiData, scenario]);

  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        setScenario,
        dynamicRiskLevel,
        projectedDemand,
        currentStorage,
        demandStorageRatio,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario(): ScenarioContextType {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
}
