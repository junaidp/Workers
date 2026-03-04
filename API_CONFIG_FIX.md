# API Configuration Fix

## Problem
The deployed client was trying to call `https://workers-zad5.onrender.com/api/services/categories` but getting 404 errors because it was using a relative URL `/api` instead of the full server URL.

## Solution

### 1. Updated API Configuration
**File**: `client/src/lib/api.ts`
```typescript
// Before
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// After  
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### 2. Updated Render Configuration
**File**: `render.yaml`
```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: VITE_API_URL
    value: https://workers-zad5.onrender.com
```

### 3. Created Environment Example
**File**: `client/.env.example`
```
VITE_API_URL=https://workers-zad5.onrender.com
```

## How It Works

1. **Development**: Uses Vite proxy (`/api` → `http://localhost:5000`)
2. **Production**: Uses `VITE_API_URL` environment variable
3. **Fallback**: If no environment variable is set, defaults to `/api`

## Environment Variables

- `VITE_API_URL`: Full URL to the deployed server
  - Development: Not needed (uses Vite proxy)
  - Production: Set to `https://workers-zad5.onrender.com`

## Testing

```bash
# Test build with environment variable
cd client
VITE_API_URL=https://workers-zad5.onrender.com npm run build
```

## Next Steps

1. Push the updated code to GitHub
2. Redeploy the client on Render
3. The environment variable will be automatically set from render.yaml
4. API calls should now work correctly

## Verification

After deployment, the client should:
- Load service categories from the server
- Allow job posting functionality
- Connect to the correct API endpoints
