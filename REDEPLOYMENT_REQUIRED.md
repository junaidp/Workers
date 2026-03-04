# Redeployment Required - Environment Variable Update

## Current Situation
The deployed client is still calling: `https://workersplace.onrender.com/services/category/home-services` ❌

## Root Cause
The deployed client on Render is using the **old build** with the old environment variable:
- Old `VITE_API_URL`: `https://workersplace.onrender.com` (without /api)
- New `VITE_API_URL`: `https://workersplace.onrender.com/api` (with /api)

## Solution: Redeploy Client

### What Needs to Happen
1. ✅ **render.yaml updated** with correct `VITE_API_URL=https://workersplace.onrender.com/api`
2. ✅ **Local build tested** and working correctly
3. 🔄 **Client needs redeployment** on Render to pick up new environment variable

### How to Redeploy on Render
1. Go to your Render dashboard
2. Find the client service (static site)
3. Click "Manual Deploy" → "Deploy Latest Commit"
4. OR push a new commit to trigger automatic deployment

### Expected Result After Redeployment
- ✅ Client will use new `VITE_API_URL=https://workersplace.onrender.com/api`
- ✅ API calls will be: `https://workersplace.onrender.com/api/services/categories`
- ✅ Service categories will load correctly
- ✅ Job posting will work

### Verification
After redeployment, check browser dev tools:
- Request URL should be: `https://workersplace.onrender.com/api/services/category/home-services`
- Status should be: 200 OK

## Files Already Updated
- ✅ `render.yaml` - Updated VITE_API_URL
- ✅ `client/.env.example` - Updated with /api
- ✅ `client/src/lib/api.ts` - Already configured correctly

## API Calls Found in Code
All API calls are correctly using the `api` instance:
- `api.get('/services/categories')`
- `api.get('/services/category/${categorySlug}')`
- `api.get('/services/service/${serviceSlug}')`

These will work correctly once the environment variable is updated.
