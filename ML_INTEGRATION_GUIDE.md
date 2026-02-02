# Water Demand Forecasting ML Integration

## Complete Implementation Guide

This guide covers the end-to-end integration of a trained ML model with your TypeScript/React dashboard.

---

## 📋 Implementation Checklist

### ✅ BACKEND SETUP

#### 1. Save trained model as .pkl file
**Steps:**
```python
import pickle

# Save your trained model
with open('models/water_demand_model.pkl', 'wb') as f:
    pickle.dump(trained_model, f)
```

**Testing:**
```python
# Verify model loads correctly
with open('models/water_demand_model.pkl', 'rb') as f:
    loaded_model = pickle.load(f)
print(f"Model loaded: {type(loaded_model)}")
```

**Common Issues:**
- **Model size too large**: Use model compression or serve from cloud storage
- **Version mismatch**: Ensure same scikit-learn/library version in dev and prod

---

#### 2. Create FastAPI server
**Implementation:** See `ml-backend/app.py`

**Quick Start:**
```bash
cd ml-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Testing:**
```bash
# Health check
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","model_loaded":true,...}
```

---

#### 3. Build API endpoint: POST /api/forecast
**Already implemented in `app.py`**

**Test with curl:**
```bash
curl -X POST http://localhost:8000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Maharashtra",
    "months_ahead": 6,
    "include_confidence": true
  }'
```

**Expected response:**
```json
{
  "region": "Maharashtra",
  "forecast": [
    {"month": "2026-02", "demand_mld": 1050.23, ...}
  ],
  "model_version": "1.0.0",
  ...
}
```

---

#### 4-10. Additional Backend Features
All implemented in `ml-backend/app.py`:
- ✅ Input validation (Pydantic models)
- ✅ Error handling middleware
- ✅ CORS headers
- ✅ Request logging
- ✅ In-memory caching (TTL: 1 hour)
- ✅ Rate limiting (100 req/min per IP)
- ✅ Health check endpoint

**Testing Rate Limiting:**
```bash
# Rapid requests to test rate limit
for i in {1..105}; do
  curl -X POST http://localhost:8000/api/forecast \
    -H "Content-Type: application/json" \
    -d '{"region":"Test","months_ahead":3}'
done
# Should return 429 error after 100 requests
```

---

### ✅ FRONTEND SETUP

#### 1. Create API service file
**Location:** `src/services/forecastAPI.ts`

**Usage:**
```typescript
import forecastAPI from '@/services/forecastAPI';

// Get forecast
const data = await forecastAPI.getForecast({
  region: 'Maharashtra',
  months_ahead: 6
});

// Get regions
const regions = await forecastAPI.getRegions();

// Health check
const health = await forecastAPI.checkHealth();
```

---

#### 2. Define TypeScript types
**Already defined in** `src/services/forecastAPI.ts`

Key types:
- `ForecastRequest`
- `ForecastResponse`
- `ForecastDataPoint`
- `Region`
- `APIError`

---

#### 3-5. React Components
**Created:**
- `src/components/RegionSelectorComponent.tsx` - Region selection with search/filter
- `src/components/ForecastDisplay.tsx` - Chart, table, and stats display
- `src/pages/MLForecast.tsx` - Main integration page

---

#### 6. Custom React Hooks
**Location:** `src/hooks/useForecast.ts`

**Available hooks:**
```typescript
// Basic forecast fetching
const { data, loading, error, fetchForecast } = useForecast();

// Auto-fetch on region change
const { data, loading } = useAutoForecast({
  region: selectedRegion,
  monthsAhead: 6
});

// Get available regions
const { regions, loading, error } = useRegions();

// Monitor API health
const { health, checkHealth } = useAPIHealth();
```

---

#### 7-10. Additional Frontend Features
All implemented:
- ✅ Loading/error states
- ✅ Client-side caching (5-min TTL)
- ✅ Error boundaries
- ✅ Responsive layout
- ✅ Data export (CSV download)

---

### ✅ INTEGRATION TESTING

#### Test Scenarios

**1. Basic Forecast Request**
```bash
# Terminal 1: Start backend
cd ml-backend
python app.py

# Terminal 2: Start frontend
npm run dev

# Browser: Navigate to ML Forecast page
# 1. Select a region
# 2. Choose forecast duration
# 3. Verify chart renders
# Expected: <2s response time
```

**2. Error Scenarios**
```bash
# Test with backend offline
# Expected: Clear error message, graceful degradation

# Test with invalid region
curl -X POST http://localhost:8000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{"region":"","months_ahead":6}'
# Expected: 400 Bad Request with validation error
```

**3. Performance Test**
```bash
# Install Apache Bench
apt-get install apache2-utils

# Load test (100 requests, 10 concurrent)
ab -n 100 -c 10 -p request.json -T application/json \
  http://localhost:8000/api/forecast

# Expected: <2s average response time
```

**4. Mobile Responsiveness**
- Open DevTools
- Toggle device toolbar
- Test on mobile/tablet viewports
- Verify chart adapts correctly

---

### ✅ DEPLOYMENT

#### Option 1: Docker Compose (Local/Staging)
```bash
# Build and start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:8081
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Option 2: Separate Deployments

**Backend (Heroku):**
```bash
# Install Heroku CLI
heroku login
heroku create my-forecast-api

# Deploy
cd ml-backend
echo "web: uvicorn app:app --host=0.0.0.0 --port=\$PORT" > Procfile
git add .
git commit -m "Deploy backend"
git push heroku main

# Set environment variables
heroku config:set MODEL_VERSION=1.0.0
```

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_ML_API_URL=https://your-forecast-api.herokuapp.com
```

**Backend (AWS Lambda + API Gateway):**
- Use Mangum adapter for FastAPI
- Package dependencies in Lambda layer
- Upload model to S3
- Configure API Gateway

---

## 🚀 Quick Start

**1. Backend:**
```bash
cd ml-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**2. Frontend:**
```bash
npm install
echo "VITE_ML_API_URL=http://localhost:8000" > .env
npm run dev
```

**3. Navigate to:** http://localhost:8081

---

## 📊 Monitoring & Logging

**Backend logs:**
```bash
# View logs in real-time
tail -f logs/api.log

# Check error rate
grep "ERROR" logs/api.log | wc -l
```

**Production monitoring:**
- Use Sentry for error tracking
- Add New Relic/DataDog for APM
- Setup CloudWatch/Stackdriver logs
- Configure uptime monitoring (UptimeRobot)

---

## 🐛 Common Issues & Solutions

**1. CORS Errors**
```
Error: Blocked by CORS policy
```
**Solution:** Add your frontend URL to `allow_origins` in `ml-backend/app.py`

**2. Model Not Loading**
```
FileNotFoundError: models/water_demand_model.pkl
```
**Solution:** Ensure model file exists in correct path, check working directory

**3. Slow Predictions**
**Solution:** 
- Enable caching (already implemented)
- Use model quantization
- Deploy model to GPU instance
- Implement batch predictions

**4. High Memory Usage**
**Solution:**
- Use model compression (pickle protocol 4+)
- Implement model lazy loading
- Use Redis for distributed caching
- Scale horizontally with load balancer

---

## 📈 Performance Optimization

**Backend:**
- Use Gunicorn with workers: `gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker`
- Enable Redis caching
- Optimize model inference (ONNX, TensorRT)
- Use CDN for static assets

**Frontend:**
- Code splitting: `lazy()` and `Suspense`
- Memoize expensive computations
- Virtualize long lists
- Optimize bundle size

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Query for API State](https://tanstack.com/query)
- [Recharts Documentation](https://recharts.org/)
- [Docker Deployment Guide](https://docs.docker.com/)

---

## 🆘 Support

For issues or questions:
1. Check logs for error details
2. Verify environment variables
3. Test API endpoints with curl
4. Check browser console for frontend errors
5. Review this guide's troubleshooting section

---

**Last Updated:** February 2, 2026  
**Version:** 1.0.0
