/**
 * TypeScript API Service for ML Model Integration
 * Handles all forecast API calls with type safety, error handling, and caching
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ForecastDataPoint {
  month: string;
  demand_mld: number;
  confidence_lower?: number;
  confidence_upper?: number;
}

export interface ForecastRequest {
  region: string;
  months_ahead?: number;
  include_confidence?: boolean;
  features?: Record<string, number>;
}

export interface ForecastResponse {
  region: string;
  forecast: ForecastDataPoint[];
  model_version: string;
  generated_at: string;
  confidence_level: number;
  metadata: {
    months_forecasted: number;
    features_used: string[];
    cached: boolean;
  };
}

export interface Region {
  name: string;
  type: 'state' | 'district' | 'city';
}

export interface APIError {
  error: string;
  status: number;
  details?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  model_loaded: boolean;
  timestamp: string;
  version: string;
}

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate cache key from request parameters
 */
function getCacheKey(region: string, months: number): string {
  return `${region.toLowerCase()}_${months}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Handle API errors with detailed messages
 */
function handleAPIError(error: any): never {
  if (error.name === 'AbortError') {
    throw {
      error: 'Request timeout',
      status: 408,
      details: 'The request took too long to complete'
    } as APIError;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw {
      error: 'Network error',
      status: 0,
      details: 'Unable to connect to the forecast service. Please check your network connection.'
    } as APIError;
  }

  throw {
    error: error.message || 'Unknown error',
    status: error.status || 500,
    details: error.details
  } as APIError;
}

// ============================================
// API SERVICE CLASS
// ============================================

export class ForecastAPIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get water demand forecast for a region
   */
  async getForecast(request: ForecastRequest): Promise<ForecastResponse> {
    const cacheKey = getCacheKey(request.region, request.months_ahead || 6);

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      console.log(`[Cache Hit] ${request.region}`);
      return cached.data;
    }

    try {
      const response = await fetchWithTimeout(
        `${this.baseURL}/api/forecast`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            region: request.region,
            months_ahead: request.months_ahead || 6,
            include_confidence: request.include_confidence ?? true,
            features: request.features,
          }),
        },
        REQUEST_TIMEOUT
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          error: errorData.detail || 'Forecast request failed',
          status: response.status,
          details: errorData.error
        };
      }

      const data: ForecastResponse = await response.json();

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      console.log(`[API Success] Forecast for ${request.region}`);
      return data;

    } catch (error) {
      console.error('[API Error]', error);
      handleAPIError(error);
    }
  }

  /**
   * Get list of available regions
   */
  async getRegions(): Promise<Region[]> {
    const cacheKey = 'regions_list';
    const cached = cache.get(cacheKey);

    if (cached && isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const response = await fetchWithTimeout(
        `${this.baseURL}/api/regions`,
        { method: 'GET' },
        REQUEST_TIMEOUT
      );

      if (!response.ok) {
        throw new Error('Failed to fetch regions');
      }

      const data = await response.json();
      const regions = data.regions as Region[];

      cache.set(cacheKey, {
        data: regions,
        timestamp: Date.now(),
      });

      return regions;

    } catch (error) {
      console.error('[API Error] Failed to fetch regions', error);
      handleAPIError(error);
    }
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await fetchWithTimeout(
        `${this.baseURL}/health`,
        { method: 'GET' },
        5000
      );

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return await response.json();

    } catch (error) {
      console.error('[API Error] Health check failed', error);
      return {
        status: 'unhealthy',
        model_loaded: false,
        timestamp: new Date().toISOString(),
        version: 'unknown'
      };
    }
  }

  /**
   * Clear cache (useful for forcing fresh data)
   */
  clearCache(): void {
    cache.clear();
    console.log('[Cache] Cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const forecastAPI = new ForecastAPIService();

// Export default for convenient imports
export default forecastAPI;
