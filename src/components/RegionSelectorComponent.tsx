/**
 * Region Selector Component (renamed to avoid conflict)
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Region } from '@/services/forecastAPI';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegionSelectorProps {
  regions: Region[];
  selectedRegion: string | null;
  onSelect: (region: string) => void;
  loading?: boolean;
  monthsAhead: number;
  onMonthsChange: (months: number) => void;
}

export const RegionSelectorComponent: React.FC<RegionSelectorProps> = ({
  regions,
  selectedRegion,
  onSelect,
  loading = false,
  monthsAhead,
  onMonthsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredRegions = useMemo(() => {
    return regions.filter((region) => {
      const matchesSearch = region.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || region.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [regions, searchTerm, filterType]);

  const groupedRegions = useMemo(() => {
    const groups: Record<string, Region[]> = {
      state: [],
      district: [],
      city: [],
    };

    filteredRegions.forEach((region) => {
      if (groups[region.type]) {
        groups[region.type].push(region);
      }
    });

    return groups;
  }, [filteredRegions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Select Region
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'state' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('state')}
          >
            States
          </Button>
          <Button
            variant={filterType === 'district' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('district')}
          >
            Districts
          </Button>
          <Button
            variant={filterType === 'city' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('city')}
          >
            Cities
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredRegions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No regions found
            </div>
          ) : (
            Object.entries(groupedRegions).map(
              ([type, typeRegions]) =>
                typeRegions.length > 0 && (
                  <div key={type} className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground capitalize">
                      {type}s
                    </div>
                    {typeRegions.map((region) => (
                      <button
                        key={region.name}
                        onClick={() => onSelect(region.name)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedRegion === region.name
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{region.name}</span>
                          <Badge variant="outline">{region.type}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )
            )
          )}
        </div>

        {selectedRegion && (
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="months-select">Forecast Duration</Label>
            <Select
              value={monthsAhead.toString()}
              onValueChange={(value) => onMonthsChange(parseInt(value))}
            >
              <SelectTrigger id="months-select">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedRegion && (
          <div className="bg-primary/5 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Selected Region</p>
            <p className="font-medium">{selectedRegion}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Forecasting {monthsAhead} months ahead
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
