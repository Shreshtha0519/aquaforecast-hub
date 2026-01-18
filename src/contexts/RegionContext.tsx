import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Region } from '@/types';

interface RegionContextType {
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  regionHierarchy: typeof regionHierarchy;
}

const regionHierarchy = {
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

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRegion, setSelectedRegion] = useState<Region>({
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Haveli',
  });

  return (
    <RegionContext.Provider
      value={{
        selectedRegion,
        setSelectedRegion,
        regionHierarchy,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
