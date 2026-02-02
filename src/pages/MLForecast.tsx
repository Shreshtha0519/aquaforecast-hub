/**
 * ML Forecast Page - Main page integrating all components
 */

import React, { useState } from 'react';
import { ForecastDisplay } from '@/components/ForecastDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw, MapPin, Globe } from 'lucide-react';
import { useForecast, useAPIHealth } from '@/hooks/useForecast';
import { Badge } from '@/components/ui/badge';
import { useRegion } from '@/contexts/RegionContext';

export const MLForecastPage: React.FC = () => {
  const [customCountry, setCustomCountry] = useState('');
  const [monthsAhead, setMonthsAhead] = useState(6);
  const { setForecastData } = useRegion();

  const { data, loading, error, fetchForecast, clearError } = useForecast();
  const { health } = useAPIHealth();

  const handleCustomCountrySubmit = async () => {
    if (!customCountry.trim()) return;
    clearError();
    const result = await fetchForecast({
      region: customCountry.trim(),
      months_ahead: monthsAhead,
      include_confidence: true,
    });
    // Store forecast data in context for Prediction page
    if (result) {
      setForecastData(result);
    }
  };

  const handleRefresh = () => {
    if (customCountry.trim()) {
      fetchForecast({
        region: customCountry.trim(),
        months_ahead: monthsAhead,
        include_confidence: true,
      });
    }
  };

  const handleExport = () => {
    if (!data) return;

    // Create CSV content
    const csvHeaders = ['Month', 'Demand (MLD)', 'Lower Bound', 'Upper Bound'];
    const csvRows = data.forecast.map((point) => [
      point.month,
      point.demand_mld.toFixed(2),
      point.confidence_lower?.toFixed(2) || '',
      point.confidence_upper?.toFixed(2) || '',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast_${data.region}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Water Demand Forecasting</h1>
          <p className="text-muted-foreground mt-1">
            ML-powered predictions for water demand planning
          </p>
        </div>
        {health && (
          <Badge
            variant={health.status === 'healthy' ? 'default' : 'destructive'}
          >
            {health.status === 'healthy' ? '✓ API Online' : '⚠ API Offline'}
          </Badge>
        )}
      </div>

      {/* API Health Warning */}
      {health && health.status === 'unhealthy' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ML forecast service is currently unavailable. Please check your backend server.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.error}
            <Button
              variant="link"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Country Input Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Enter Country/Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="e.g., Maharashtra, India"
                value={customCountry}
                onChange={(e) => setCustomCountry(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomCountrySubmit()}
              />
              <Button 
                onClick={handleCustomCountrySubmit} 
                disabled={!customCountry.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Get Forecast'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Forecast Display */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Generating forecast...</p>
              </div>
            </div>
          ) : data ? (
            <ForecastDisplay
              data={data}
              onRefresh={handleRefresh}
              onExport={handleExport}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Enter a country or region to view forecast</p>
                <p className="text-sm mt-2">
                  Type a location name on the left to generate ML predictions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLForecastPage;
