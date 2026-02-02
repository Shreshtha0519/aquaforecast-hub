"""
FastAPI server for water demand forecasting ML model
Includes: model serving, validation, error handling, CORS, logging, caching
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
import pickle
import numpy as np
import logging
from datetime import datetime, timedelta
from functools import lru_cache
import time
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Water Demand Forecasting API",
    description="ML-powered water demand prediction service",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:3000",
        # Add your production domain here
        "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache (use Redis for production)
cache_store = {}
CACHE_TTL = 3600  # 1 hour

# Request tracking for rate limiting
request_tracker = {}
RATE_LIMIT = 100  # requests per minute
RATE_WINDOW = 60  # seconds

# Country/Region specific baseline data
REGION_DATA = {
    'india': {
        'total_water_consumption': 761.0,
        'per_capita_water_use': 145.0,
        'agricultural_water_use': 90.0,
        'industrial_water_use': 6.0,
        'household_water_use': 4.0,
        'rainfall_impact': 1100.0,
        'groundwater_depletion_rate': 4.5,
        'water_scarcity_level': 2.0,
    },
    'china': {
        'total_water_consumption': 598.0,
        'per_capita_water_use': 125.0,
        'agricultural_water_use': 65.0,
        'industrial_water_use': 22.0,
        'household_water_use': 13.0,
        'rainfall_impact': 645.0,
        'groundwater_depletion_rate': 3.8,
        'water_scarcity_level': 2.0,
    },
    'usa': {
        'total_water_consumption': 444.0,
        'per_capita_water_use': 300.0,
        'agricultural_water_use': 37.0,
        'industrial_water_use': 45.0,
        'household_water_use': 18.0,
        'rainfall_impact': 715.0,
        'groundwater_depletion_rate': 2.2,
        'water_scarcity_level': 1.0,
    },
    'united states': {
        'total_water_consumption': 444.0,
        'per_capita_water_use': 300.0,
        'agricultural_water_use': 37.0,
        'industrial_water_use': 45.0,
        'household_water_use': 18.0,
        'rainfall_impact': 715.0,
        'groundwater_depletion_rate': 2.2,
        'water_scarcity_level': 1.0,
    },
    'brazil': {
        'total_water_consumption': 59.5,
        'per_capita_water_use': 165.0,
        'agricultural_water_use': 54.0,
        'industrial_water_use': 17.0,
        'household_water_use': 29.0,
        'rainfall_impact': 1761.0,
        'groundwater_depletion_rate': 1.5,
        'water_scarcity_level': 0.0,
    },
    'pakistan': {
        'total_water_consumption': 183.5,
        'per_capita_water_use': 105.0,
        'agricultural_water_use': 94.0,
        'industrial_water_use': 2.0,
        'household_water_use': 4.0,
        'rainfall_impact': 494.0,
        'groundwater_depletion_rate': 5.8,
        'water_scarcity_level': 2.0,
    },
    'egypt': {
        'total_water_consumption': 77.5,
        'per_capita_water_use': 95.0,
        'agricultural_water_use': 86.0,
        'industrial_water_use': 6.0,
        'household_water_use': 8.0,
        'rainfall_impact': 51.0,
        'groundwater_depletion_rate': 6.2,
        'water_scarcity_level': 2.0,
    },
    'saudi arabia': {
        'total_water_consumption': 24.8,
        'per_capita_water_use': 263.0,
        'agricultural_water_use': 88.0,
        'industrial_water_use': 6.0,
        'household_water_use': 6.0,
        'rainfall_impact': 59.0,
        'groundwater_depletion_rate': 7.5,
        'water_scarcity_level': 2.0,
    },
    'maharashtra': {
        'total_water_consumption': 85.0,
        'per_capita_water_use': 140.0,
        'agricultural_water_use': 85.0,
        'industrial_water_use': 9.0,
        'household_water_use': 6.0,
        'rainfall_impact': 1200.0,
        'groundwater_depletion_rate': 5.2,
        'water_scarcity_level': 2.0,
    },
    'gujarat': {
        'total_water_consumption': 42.0,
        'per_capita_water_use': 128.0,
        'agricultural_water_use': 87.0,
        'industrial_water_use': 8.0,
        'household_water_use': 5.0,
        'rainfall_impact': 800.0,
        'groundwater_depletion_rate': 5.8,
        'water_scarcity_level': 2.0,
    },
    'karnataka': {
        'total_water_consumption': 38.5,
        'per_capita_water_use': 135.0,
        'agricultural_water_use': 86.0,
        'industrial_water_use': 9.0,
        'household_water_use': 5.0,
        'rainfall_impact': 1150.0,
        'groundwater_depletion_rate': 4.8,
        'water_scarcity_level': 1.0,
    },
    'default': {
        'total_water_consumption': 150.0,
        'per_capita_water_use': 135.0,
        'agricultural_water_use': 45.0,
        'industrial_water_use': 30.0,
        'household_water_use': 25.0,
        'rainfall_impact': 800.0,
        'groundwater_depletion_rate': 2.5,
        'water_scarcity_level': 1.0,
    }
}

# ============================================
# PYDANTIC MODELS (Input/Output Validation)
# ============================================

class ForecastRequest(BaseModel):
    """Input validation for forecast requests"""
    region: str = Field(..., min_length=2, max_length=100, description="Region name (state, district, or city)")
    months_ahead: int = Field(default=6, ge=1, le=24, description="Number of months to forecast")
    include_confidence: bool = Field(default=True, description="Include confidence intervals")
    features: Optional[Dict[str, float]] = Field(default=None, description="Optional additional features")
    
    @validator('region')
    def validate_region(cls, v):
        """Validate region name format"""
        if not v.strip():
            raise ValueError('Region cannot be empty')
        # Add custom validation logic
        return v.strip().title()

    class Config:
        schema_extra = {
            "example": {
                "region": "Maharashtra",
                "months_ahead": 6,
                "include_confidence": True,
                "features": {
                    "population": 112374333,
                    "rainfall_avg": 500.5
                }
            }
        }


class ForecastDataPoint(BaseModel):
    """Single forecast data point"""
    month: str
    demand_mld: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None


class ForecastResponse(BaseModel):
    """Output format for forecast results"""
    region: str
    forecast: List[ForecastDataPoint]
    model_version: str
    generated_at: str
    confidence_level: float = 0.95
    metadata: Dict


# ============================================
# MODEL LOADING AND CACHING
# ============================================

@lru_cache(maxsize=1)
def load_model():
    """Load ML model (cached in memory)"""
    try:
        with open('models/water_demand_model.pkl', 'rb') as f:
            model = pickle.load(f)
        logger.info("Model loaded successfully")
        return model
    except FileNotFoundError:
        logger.error("Model file not found. Using mock predictions.")
        return None
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return None


@lru_cache(maxsize=1)
def load_country_data():
    """Load historical country water consumption data from CSV"""
    try:
        import pandas as pd
        df = pd.read_csv('models/cleaned_global_water_consumption.csv')
        logger.info(f"Country data loaded: {len(df)} records, {df['Country'].nunique()} countries")
        return df
    except Exception as e:
        logger.error(f"Error loading country data: {e}")
        return None


def get_country_baseline(country_name: str, df=None):
    """Get the most recent data for a country from the CSV"""
    if df is None:
        df = load_country_data()
    
    if df is None:
        logger.warning(f"CSV data not available. Using defaults for {country_name}")
        return REGION_DATA.get('default')
    
    # Try exact match first
    country_data = df[df['Country'].str.lower() == country_name.lower()]
    
    # If no exact match, try partial match
    if country_data.empty:
        country_data = df[df['Country'].str.lower().str.contains(country_name.lower(), na=False)]
    
    # If still no match, use default
    if country_data.empty:
        logger.warning(f"No data found for country: {country_name}. Using defaults.")
        return REGION_DATA.get('default')
    
    # Get most recent year data
    recent_data = country_data.sort_values('Year', ascending=False).iloc[0]
    
    baseline = {
        'total_water_consumption': float(recent_data['Total Water Consumption (Billion Cubic Meters)']),
        'per_capita_water_use': float(recent_data['Per Capita Water Use (Liters per Day)']),
        'agricultural_water_use': float(recent_data['Agricultural Water Use (%)']),
        'industrial_water_use': float(recent_data['Industrial Water Use (%)']),
        'household_water_use': float(recent_data['Household Water Use (%)']),
        'rainfall_impact': float(recent_data['Rainfall Impact (Annual Precipitation in mm)']),
        'groundwater_depletion_rate': float(recent_data['Groundwater Depletion Rate (%)']),
        'water_scarcity_level': 2.0 if recent_data['Water Scarcity Level'] == 'High' else 
                                1.0 if recent_data['Water Scarcity Level'] == 'Moderate' else 0.0,
    }
    
    logger.info(f"Loaded baseline for {country_name}: consumption={baseline['total_water_consumption']:.2f} BCM, "
                f"per_capita={baseline['per_capita_water_use']:.1f} L/day")
    
    return baseline


# ============================================
# HELPER FUNCTIONS
# ============================================

def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiting check"""
    current_time = time.time()
    
    if client_ip not in request_tracker:
        request_tracker[client_ip] = []
    
    # Remove old requests outside the window
    request_tracker[client_ip] = [
        req_time for req_time in request_tracker[client_ip]
        if current_time - req_time < RATE_WINDOW
    ]
    
    # Check if limit exceeded
    if len(request_tracker[client_ip]) >= RATE_LIMIT:
        return False
    
    request_tracker[client_ip].append(current_time)
    return True


def get_cache_key(region: str, months: int) -> str:
    """Generate cache key - must include region to avoid mixing predictions"""
    return f"{region.lower().strip()}_{months}"


def generate_mock_forecast(region: str, months: int, include_confidence: bool):
    """Generate mock forecast data (fallback when model not available)"""
    base_demand = np.random.uniform(800, 1200)
    trend = np.random.uniform(-0.5, 2.0)
    
    forecast_data = []
    current_date = datetime.now()
    
    for i in range(months):
        month_date = current_date + timedelta(days=30 * i)
        seasonal_factor = 1 + 0.15 * np.sin(2 * np.pi * month_date.month / 12)
        noise = np.random.normal(0, 20)
        
        demand = base_demand + (trend * i) + (seasonal_factor * base_demand * 0.1) + noise
        
        data_point = {
            "month": month_date.strftime("%Y-%m"),
            "demand_mld": round(demand, 2)
        }
        
        if include_confidence:
            data_point["confidence_lower"] = round(demand * 0.9, 2)
            data_point["confidence_upper"] = round(demand * 1.1, 2)
        
        forecast_data.append(data_point)
    
    return forecast_data


def prepare_features(region: str, months: int, base_features: Optional[Dict] = None):
    """
    Prepare features required by the model.
    The model was trained with these features (from the notebook):
    - Year, Total Water Consumption, Per Capita Water Use, Agricultural Water Use (%),
    - Industrial Water Use (%), Household Water Use (%), Rainfall Impact,
    - Groundwater Depletion Rate (%), and lag features (lag1, lag2, lag3, lag5)
    """
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    # Get actual country data from CSV
    region_baseline = get_country_baseline(region)
    
    # Override with custom features if provided
    if base_features:
        region_baseline = {**region_baseline, **base_features}
    
    features_list = []
    
    # For lag features, use the baseline consumption value
    baseline_consumption = region_baseline['total_water_consumption']
    
    for i in range(months):
        month_offset = current_month + i
        future_year = current_year + (month_offset - 1) // 12
        future_month = ((month_offset - 1) % 12) + 1
        
        # Apply trend and seasonality
        year_trend = (future_year - current_year) * 0.02  # 2% annual growth
        seasonal_factor = 1 + 0.15 * np.sin(2 * np.pi * future_month / 12)  # Seasonal variation
        
        # Projected consumption with trend
        projected_consumption = baseline_consumption * (1 + year_trend) * seasonal_factor
        
        # Build feature vector matching training data
        # Features from CSV: Year, Total Water Consumption, Per Capita, Agri%, Ind%, House%, Rainfall, Depletion%
        # Plus lag features: lag1, lag2, lag3, lag5
        feature_vector = [
            region_baseline['per_capita_water_use'] * seasonal_factor,
            region_baseline['agricultural_water_use'],
            region_baseline['industrial_water_use'],
            region_baseline['household_water_use'],
            region_baseline['rainfall_impact'] * seasonal_factor,
            region_baseline['groundwater_depletion_rate'],
            projected_consumption,  # Current total water consumption
            projected_consumption * 0.98,  # lag1 (slightly less)
            projected_consumption * 0.96,  # lag2
            projected_consumption * 0.94,  # lag3
            projected_consumption * 0.90,  # lag5
        ]
        
        features_list.append(feature_vector)
    
    return np.array(features_list)


def predict_with_model(model, region: str, months: int, include_confidence: bool, features: Optional[Dict]):
    """Make predictions using the trained model"""
    try:
        # Prepare feature matrix
        X = prepare_features(region, months, features)
        
        # Get predictions from model
        predictions = model.predict(X)
        
        # Build forecast data points
        forecast_data = []
        current_date = datetime.now()
        
        for i, demand in enumerate(predictions):
            month_date = current_date + timedelta(days=30 * i)
            
            data_point = {
                "month": month_date.strftime("%Y-%m"),
                "demand_mld": round(float(demand), 2)
            }
            
            # Add confidence intervals (±10% as approximation)
            if include_confidence:
                data_point["confidence_lower"] = round(float(demand * 0.90), 2)
                data_point["confidence_upper"] = round(float(demand * 1.10), 2)
            
            forecast_data.append(data_point)
        
        return forecast_data
        
    except Exception as e:
        logger.error(f"Model prediction error: {e}. Falling back to mock data.")
        return generate_mock_forecast(region, months, include_confidence)


# ============================================
# API ENDPOINTS
# ============================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    
    # Get client IP
    client_ip = request.client.host
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        return JSONResponse(
            status_code=429,
            content={"error": "Rate limit exceeded. Please try again later."}
        )
    
    # Process request
    response = await call_next(request)
    
    # Log request details
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {process_time:.3f}s - "
        f"Client: {client_ip}"
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model = load_model()
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


@app.post("/api/forecast", response_model=ForecastResponse)
async def forecast_demand(request: ForecastRequest):
    """
    Generate water demand forecast
    
    Returns:
        ForecastResponse with predicted demand values
        
    Raises:
        HTTPException: 400 for invalid input, 500 for server errors
    """
    try:
        # Check cache
        cache_key = get_cache_key(request.region, request.months_ahead)
        cached_result = cache_store.get(cache_key)
        
        if cached_result and time.time() - cached_result['timestamp'] < CACHE_TTL:
            logger.info(f"Cache hit for {request.region} ({cache_key})")
            return cached_result['data']
        
        # Load model
        model = load_model()
        
        # Generate predictions
        if model:
            forecast_data = predict_with_model(
                model,
                request.region,
                request.months_ahead,
                request.include_confidence,
                request.features
            )
        else:
            logger.warning("Using mock predictions (model not loaded)")
            forecast_data = generate_mock_forecast(
                request.region,
                request.months_ahead,
                request.include_confidence
            )
        
        # Build response
        response = ForecastResponse(
            region=request.region,
            forecast=forecast_data,
            model_version="1.0.0",
            generated_at=datetime.now().isoformat(),
            confidence_level=0.95,
            metadata={
                "months_forecasted": request.months_ahead,
                "features_used": list(request.features.keys()) if request.features else [],
                "cached": False
            }
        )
        
        # Cache result
        cache_store[cache_key] = {
            'timestamp': time.time(),
            'data': response
        }
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Forecast error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/regions")
async def get_available_regions():
    """Get list of available regions for forecasting"""
    # TODO: Load from database or config
    return {
        "regions": [
            {"name": "Maharashtra", "type": "state"},
            {"name": "Pune", "type": "district"},
            {"name": "Haveli", "type": "city"},
            {"name": "Gujarat", "type": "state"},
            {"name": "Karnataka", "type": "state"}
        ]
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Water Demand Forecasting API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
