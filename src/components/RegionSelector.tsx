import React from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Building2, Home } from 'lucide-react';

const RegionSelector: React.FC = () => {
  const { selectedRegion, setSelectedRegion, regionHierarchy } = useRegion();

  const states = Object.keys(regionHierarchy);
  const districts = selectedRegion.state 
    ? Object.keys(regionHierarchy[selectedRegion.state as keyof typeof regionHierarchy] || {})
    : [];
  const cities = selectedRegion.state && selectedRegion.district
    ? (regionHierarchy[selectedRegion.state as keyof typeof regionHierarchy] as any)?.[selectedRegion.district] || []
    : [];

  const handleStateChange = (state: string) => {
    const firstDistrict = Object.keys(regionHierarchy[state as keyof typeof regionHierarchy])[0];
    const firstCity = (regionHierarchy[state as keyof typeof regionHierarchy] as any)[firstDistrict][0];
    setSelectedRegion({ state, district: firstDistrict, city: firstCity });
  };

  const handleDistrictChange = (district: string) => {
    const firstCity = (regionHierarchy[selectedRegion.state as keyof typeof regionHierarchy] as any)[district][0];
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
            {cities.map((city: string) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RegionSelector;
