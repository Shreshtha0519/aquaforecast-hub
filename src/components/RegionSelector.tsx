import React from 'react';
import { useRegion, REGION_DATA } from '@/contexts/RegionContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Building2, Home } from 'lucide-react';

export default function RegionSelector() {
  const { selectedRegion, setSelectedRegion } = useRegion();

  const states = Object.keys(REGION_DATA);
  
  const getDistricts = (state: string): string[] => {
    const stateData = REGION_DATA[state as keyof typeof REGION_DATA];
    return stateData ? Object.keys(stateData) : [];
  };
  
  const getCities = (state: string, district: string): string[] => {
    const stateData = REGION_DATA[state as keyof typeof REGION_DATA];
    if (!stateData) return [];
    const districtData = stateData[district as keyof typeof stateData];
    return districtData ? [...districtData] : [];
  };

  const districts = getDistricts(selectedRegion.state);
  const cities = getCities(selectedRegion.state, selectedRegion.district);

  const handleStateChange = (state: string) => {
    const newDistricts = getDistricts(state);
    const firstDistrict = newDistricts[0] || '';
    const newCities = getCities(state, firstDistrict);
    const firstCity = newCities[0] || '';
    setSelectedRegion({ state, district: firstDistrict, city: firstCity });
  };

  const handleDistrictChange = (district: string) => {
    const newCities = getCities(selectedRegion.state, district);
    const firstCity = newCities[0] || '';
    setSelectedRegion({ ...selectedRegion, district, city: firstCity });
  };

  const handleCityChange = (city: string) => {
    setSelectedRegion({ ...selectedRegion, city });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-3 h-3" /> State
        </Label>
        <Select value={selectedRegion.state} onValueChange={handleStateChange}>
          <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {states.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-3 h-3" /> District
        </Label>
        <Select value={selectedRegion.district} onValueChange={handleDistrictChange}>
          <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {districts.map((district) => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider flex items-center gap-2">
          <Home className="w-3 h-3" /> City/Village
        </Label>
        <Select value={selectedRegion.city} onValueChange={handleCityChange}>
          <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
