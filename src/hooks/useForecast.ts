/**
 * Custom React hooks for forecast functionality
 */

import { useState, useEffect, useCallback } from 'react';
import forecastAPI, { 
  ForecastResponse, 
  ForecastRequest, 
  Region, 
  APIError,
  HealthStatus
} from '../services/forecastAPI';

// ============================================
// useForecast Hook
// ============================================

interface UseForecastResult {
  data: ForecastResponse | null;
  loading: boolean;
  error: APIError | null;
  fetchForecast: (request: ForecastRequest) => Promise<ForecastResponse | null>;
  clearError: () => void;
}

export function useForecast(): UseForecastResult {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const fetchForecast = useCallback(async (request: ForecastRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await forecastAPI.getForecast(request);
      setData(result);
      return result;
    } catch (err) {
      setError(err as APIError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { data, loading, error, fetchForecast, clearError };
}

// ============================================
// useRegions Hook
// ============================================

interface UseRegionsResult {
  regions: Region[];
  loading: boolean;
  error: APIError | null;
  refetch: () => Promise<void>;
}

export function useRegions(): UseRegionsResult {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await forecastAPI.getRegions();
      setRegions(result);
    } catch (err) {
      setError(err as APIError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return { regions, loading, error, refetch: fetchRegions };
}

// ============================================
// useAPIHealth Hook
// ============================================

interface UseAPIHealthResult {
  health: HealthStatus | null;
  loading: boolean;
  checkHealth: () => Promise<void>;
}

export function useAPIHealth(): UseAPIHealthResult {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      const result = await forecastAPI.checkHealth();
      setHealth(result);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Check health every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { health, loading, checkHealth };
}

// ============================================
// useAutoForecast Hook (Auto-fetch on region change)
// ============================================

interface UseAutoForecastOptions {
  region: string;
  monthsAhead?: number;
  enabled?: boolean;
}

export function useAutoForecast({
  region,
  monthsAhead = 6,
  enabled = true,
}: UseAutoForecastOptions): UseForecastResult {
  const { data, loading, error, fetchForecast, clearError } = useForecast();

  useEffect(() => {
    if (enabled && region) {
      fetchForecast({ region, months_ahead: monthsAhead });
    }
  }, [region, monthsAhead, enabled, fetchForecast]);

  return { data, loading, error, fetchForecast, clearError };
}
