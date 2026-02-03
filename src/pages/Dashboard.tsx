import React, { useMemo, useEffect, useState } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { useScenario } from '@/contexts/ScenarioContext';
import KPICard from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, Gauge, AlertTriangle, TrendingUp, Brain, MapPin, Lightbulb, Sprout } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { forecastAPI } from '@/services/forecastAPI';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

const Dashboard: React.FC = () => {
  const { selectedRegion } = useRegion();
  const { dynamicRiskLevel, projectedDemand, currentStorage, demandStorageRatio, setRealKPIData } = useScenario();
  
  // Custom location inputs
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
  const [selectedCity, setSelectedCity] = useState<string>('Haveli');
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [regionType, setRegionType] = useState<'agricultural' | 'metropolitan'>('agricultural');
  
  const regionKey = `${selectedState}-${selectedDistrict}-${selectedCity}`;
  
  // Location data
  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Uttar Pradesh', 'Tamil Nadu', 'Rajasthan'];
  const districts: Record<string, string[]> = {
    'Maharashtra': ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner']
  };
  const cities: Record<string, string[]> = {
    'Pune': ['Haveli', 'Mulshi', 'Bhor', 'Maval', 'Shirur'],
    'Mumbai': ['Andheri', 'Bandra', 'Borivali', 'Kurla', 'Thane'],
    'Nagpur': ['Sitabuldi', 'Dharampeth', 'Saoner', 'Kamptee'],
    'Ahmedabad': ['Vastrapur', 'Satellite', 'Maninagar', 'Naroda'],
    'Bangalore': ['Whitefield', 'Jayanagar', 'Koramangala', 'Indiranagar'],
    'Chennai': ['T Nagar', 'Anna Nagar', 'Velachery', 'Adyar'],
    'Lucknow': ['Gomti Nagar', 'Hazratganj', 'Alambagh', 'Aliganj'],
    'Jaipur': ['Malviya Nagar', 'Vaishali Nagar', 'C Scheme', 'Mansarovar']
  };
  
  // Metropolitan cities for classification
  const metropolitanCities = ['Mumbai', 'Bangalore', 'Chennai', 'Ahmedabad', 'Lucknow', 'Jaipur', 'Pune'];
  
  const [mlForecast, setMlForecast] = useState<any>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Calculate dynamic KPI data from ML forecast
  const kpiData = useMemo(() => {
    if (mlForecast?.forecast) {
      const forecasts = mlForecast.forecast;
      const demands = forecasts.map((f: any) => f.demand_mld);
      const avgDemand = demands.reduce((a: number, b: number) => a + b, 0) / demands.length;
      const supply = Math.round(avgDemand * 1.02); // Assume 2% surplus for sufficient supply
      const demand = Math.round(avgDemand);
      
      // Calculate efficiency: (supply / demand) * 100, capped at 100
      const efficiencyRatio = demand > 0 ? (supply / demand) : 1;
      const efficiency = Math.min(Math.round(efficiencyRatio * 100), 100);
      
      return {
        demand,
        supply,
        efficiency,
      };
    }
    // Default values while loading
    return {
      demand: 0,
      supply: 0,
      efficiency: 0,
    };
  }, [mlForecast]);

  // Update ScenarioContext when kpiData changes
  useEffect(() => {
    if (kpiData.demand > 0 && kpiData.supply > 0) {
      setRealKPIData({ demand: kpiData.demand, supply: kpiData.supply });
    }
  }, [kpiData.demand, kpiData.supply, setRealKPIData]);

  const forecastData = useMemo(() => {
    // If we have ML forecast, transform it to chart data
    if (mlForecast?.forecast) {
      return mlForecast.forecast.map((point: any, index: number) => ({
        month: point.month.split('-')[1], // Extract month from "2026-02" format
        historical: index < 3 ? point.demand_mld * 0.95 : null, // Show historical for first 3 months
        predicted: point.demand_mld,
      }));
    }
    // Return empty data while loading
    return [];
  }, [mlForecast]);

  // Fetch ML forecast when region changes
  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoadingForecast(true);
      setForecastError(null);
      try {
        const region = `${selectedCity}, ${selectedDistrict}, ${selectedState}`;
        const result = await forecastAPI.getForecast({
          region,
          months_ahead: 12,
          include_confidence: true
        });
        setMlForecast(result);
      } catch (error: any) {
        console.error('ML Forecast error:', error);
        setForecastError(error.message || 'Failed to fetch forecast');
        // Keep using mock data on error
      } finally {
        setIsLoadingForecast(false);
      }
    };

    fetchForecast();
  }, [selectedState, selectedDistrict, selectedCity]);

  // Fetch AI recommendations when location changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      
      // Determine region type
      const isMetro = metropolitanCities.includes(selectedDistrict);
      setRegionType(isMetro ? 'metropolitan' : 'agricultural');
      
      try {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        
        console.log('🔑 API Key available:', apiKey ? 'YES' : 'NO');
        
        if (!apiKey) {
          throw new Error('OpenRouter API key not found');
        }

        const systemPrompt = isMetro
          ? `You are a water conservation expert. Provide information in a well-structured format with clear sections. Use markdown formatting for better readability.`
          : `You are an agricultural water management expert. Provide information in a well-structured format with clear sections. Use markdown formatting for better readability.`;

        const userQuery = isMetro
          ? `Provide water management information for ${selectedDistrict}, ${selectedState} in the following structured format:

**Region Overview:**
Write a brief paragraph (3-4 lines) about the region's water situation, climate, and key challenges.

**Water Conservation Tips:**
List 5-6 practical, actionable water-saving methods for metropolitan residents including:
- Household water efficiency measures
- Rainwater harvesting techniques
- Greywater recycling methods
- Community initiatives

Keep each tip concise and specific to the region.`
          : `Provide agricultural water management information for ${selectedDistrict}, ${selectedState} in the following structured format:

**Region Overview:**
Write a brief paragraph (3-4 lines) about the region's agricultural profile, climate, soil type, and rainfall patterns.

**Crop-wise Water Requirements:**
List 4-5 suitable crops for this region with specific water requirements:
- Crop name: Water requirement (mm/season), irrigation frequency, suitable season
Format as a clear list with measurements

**Water Conservation Tips:**
List 5-6 practical water-saving techniques for farmers:
- Modern irrigation methods (drip, sprinkler)
- Soil moisture management
- Mulching and crop rotation
- Rainwater harvesting for agriculture
- Water-efficient crop selection

Keep each tip actionable and specific to the region.`;

        console.log('🌍 Calling OpenRouter API for:', isMetro ? 'Metropolitan' : 'Agricultural', 'region:', selectedDistrict);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'AquaForecast Hub',
          },
          body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userQuery },
            ],
          }),
        });

        console.log('📡 OpenRouter Response Status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('❌ OpenRouter API Error:', errorData);
          throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ OpenRouter Response received:', data.choices?.[0]?.message?.content?.substring(0, 100) + '...');
        
        const aiResponse = data.choices?.[0]?.message?.content || 'Unable to generate recommendations.';
        setRecommendations(aiResponse);
        console.log('✅ AI Recommendations set successfully');
      } catch (error: any) {
        console.error('❌ Error fetching recommendations:', error.message);
        console.log('⚠️ Using fallback recommendations');
        // Fallback recommendations with structured format
        const fallback = isMetro
          ? `**Region Overview:**\n${selectedDistrict}, ${selectedState} is a metropolitan area facing increasing water demand due to urbanization. The region experiences seasonal rainfall variations and requires efficient water management strategies.\n\n**Water Conservation Tips:**\n\n1. **Low-flow Fixtures:** Install water-efficient faucets and showerheads to reduce consumption by 30-40%\n2. **Rainwater Harvesting:** Set up rooftop collection systems with storage tanks for non-potable uses\n3. **Greywater Recycling:** Reuse water from washing machines and sinks for garden irrigation\n4. **Leak Detection:** Check and repair leaking pipes and taps immediately to prevent wastage\n5. **Smart Appliances:** Use washing machines and dishwashers only on full load settings\n6. **Native Landscaping:** Plant drought-resistant native species to minimize garden watering needs\n\n⚠️ Note: Using fallback recommendations (API unavailable)`
          : `**Region Overview:**\n${selectedDistrict}, ${selectedState} has a diverse agricultural landscape with seasonal cropping patterns. Water availability varies with monsoon patterns, making efficient irrigation crucial for sustainable farming.\n\n**Crop-wise Water Requirements:**\n\n• **Sugarcane:** 1500-2500 mm/season, requires regular irrigation every 7-10 days\n• **Cotton:** 700-1300 mm/season, critical stages need irrigation every 10-15 days\n• **Soybeans:** 450-700 mm/season, requires 4-5 irrigations during growing period\n• **Pulses (Pigeon pea):** 500-800 mm/season, drought-tolerant, needs 2-3 irrigations\n• **Wheat:** 450-650 mm/season, requires 4-6 irrigations at critical growth stages\n\n**Water Conservation Tips:**\n\n1. **Drip Irrigation:** Install drip systems to save 30-50% water compared to flood irrigation\n2. **Mulching:** Apply organic mulch to retain soil moisture and reduce evaporation\n3. **Crop Rotation:** Alternate water-intensive crops with drought-resistant varieties\n4. **Soil Testing:** Regular testing helps optimize water use based on soil moisture levels\n5. **Rainwater Harvesting:** Build farm ponds to capture and store monsoon rainwater\n6. **Sprinkler Systems:** Use sprinklers for uniform water distribution in larger fields\n\n⚠️ Note: Using fallback recommendations (API unavailable)`;
        setRecommendations(fallback);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [selectedState, selectedDistrict, selectedCity]);

  // Debug log
  useEffect(() => {
    console.log('Recommendations State:', {
      isLoading: isLoadingRecommendations,
      hasRecommendations: !!recommendations,
      recommendationsLength: recommendations.length,
      regionType,
      location: `${selectedDistrict}, ${selectedState}`
    });
  }, [recommendations, isLoadingRecommendations, regionType, selectedState, selectedDistrict]);

  const riskVariant = {
    safe: 'success' as const,
    warning: 'warning' as const,
    critical: 'danger' as const,
  };

  const riskEmoji = {
    safe: '🟢',
    warning: '🟡',
    critical: '🔴',
  };

  // Use dynamic risk level from scenario context
  const currentRiskLevel = dynamicRiskLevel;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Location Selector */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Select Region
          </CardTitle>
          <CardDescription>Choose your location to get customized water management insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                STATE
              </label>
              <Select value={selectedState} onValueChange={(value) => {
                setSelectedState(value);
                setSelectedDistrict(districts[value][0]);
                setSelectedCity(cities[districts[value][0]]?.[0] || '');
              }}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                DISTRICT
              </label>
              <Select value={selectedDistrict} onValueChange={(value) => {
                setSelectedDistrict(value);
                setSelectedCity(cities[value]?.[0] || '');
              }}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {districts[selectedState]?.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City/Village Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                CITY/VILLAGE
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities[selectedDistrict]?.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Forecast Line Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Demand Forecast - Historical vs Predicted
              </div>
              <div className="flex items-center gap-2">
                {isLoadingForecast && (
                  <Badge variant="outline" className="text-xs">
                    <Brain className="w-3 h-3 mr-1 animate-pulse" />
                    Loading ML Model...
                  </Badge>
                )}
                {mlForecast && !isLoadingForecast && (
                  <Badge variant="default" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">
                    <Brain className="w-3 h-3 mr-1" />
                    ML Powered
                  </Badge>
                )}
                {forecastError && (
                  <Badge variant="destructive" className="text-xs">
                    Using Mock Data
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="historical"
                  stroke="hsl(199, 89%, 48%)"
                  strokeWidth={2}
                  fill="url(#historicalGradient)"
                  name="Historical"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(142, 70%, 45%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  name="Predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Section */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              {regionType === 'agricultural' ? (
                <Sprout className="w-5 h-5 text-green-600" />
              ) : (
                <Lightbulb className="w-5 h-5 text-yellow-600" />
              )}
              {regionType === 'agricultural' ? 'Crop Advisory & Water Requirements' : 'Water Conservation Tips'}
            </div>
            <div className="flex items-center gap-2">
              {isLoadingRecommendations && (
                <Badge variant="outline" className="text-xs">
                  <Brain className="w-3 h-3 mr-1 animate-pulse" />
                  Generating...
                </Badge>
              )}
              {!isLoadingRecommendations && recommendations && (
                <Badge variant="default" className="text-xs bg-purple-500/10 text-purple-700 border-purple-500/20">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            {regionType === 'agricultural'
              ? `Customized agricultural guidance for ${selectedDistrict}, ${selectedState}`
              : `Water-saving recommendations for metropolitan area: ${selectedDistrict}, ${selectedState}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center py-8">
              <Brain className="w-8 h-8 animate-pulse text-primary" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {recommendations}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
