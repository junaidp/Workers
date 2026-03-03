# Deployment Guide for Render

## Prerequisites
- GitHub repository with your code
- Render account (https://render.com)
- Supabase account (for PostgreSQL database)

## Step 1: Database Setup (Supabase)

Your database is already configured:
```
postgresql://postgres.cyqtzorpufobdrqgobbz:isSR23FlsNEZhnAN@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

## Step 2: Backend Deployment on Render

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Build Settings**
   - **Name:** workers-marketplace-api
   - **Environment:** Node
   - **Region:** Choose closest to Pakistan (Singapore recommended)
   - **Branch:** main
   - **Root Directory:** server
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command:**
     ```bash
     npm start
     ```

3. **Add Environment Variables**
   ```
   DATABASE_URL=postgresql://postgres.cyqtzorpufobdrqgobbz:isSR23FlsNEZhnAN@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<generate-strong-secret-key>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=<your-frontend-url-from-step-3>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-gmail>
   EMAIL_PASSWORD=<your-gmail-app-password>
   EMAIL_FROM=noreply@workersmarketplace.com
   UPLOAD_DIR=./uploads
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., https://workers-marketplace-api.onrender.com)

5. **Run Database Seed** (After first deployment)
   - Go to Shell in Render dashboard
   - Run: `npx tsx src/utils/seedData.ts`

## Step 3: Frontend Deployment on Render

1. **Create Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Build Settings**
   - **Name:** workers-marketplace
   - **Branch:** main
   - **Root Directory:** client
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** dist

3. **Add Environment Variable**
   ```
   VITE_API_URL=<your-backend-url-from-step-2>
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Your site will be live at https://workers-marketplace.onrender.com

## Step 4: Update Backend Environment

1. Go back to your backend service on Render
2. Update `FRONTEND_URL` environment variable with your frontend URL
3. Click "Save Changes" to redeploy

## Step 5: Verify Deployment

1. **Test Backend API**
   ```bash
   curl https://workers-marketplace-api.onrender.com/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**
   - Visit your frontend URL
   - Homepage should load
   - Try registering as a customer
   - Check email/WhatsApp verification

3. **Login as Admin**
   - Mobile: 3001234567
   - Check admin dashboard
   - Verify tradesman approval workflow

## Step 6: Configure Custom Domain (Optional)

### For Frontend:
1. Go to Static Site settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

### For Backend:
1. Go to Web Service settings
2. Click "Custom Domains"
3. Add api.yourdomain.com
4. Update DNS records

## Production Checklist

- [ ] Database migrations applied
- [ ] Database seeded with services and admin user
- [ ] All environment variables set correctly
- [ ] Email configuration tested
- [ ] WhatsApp API configured (if available)
- [ ] File uploads working (check uploads directory)
- [ ] Payment gateway webhooks configured
- [ ] SSL certificates active (automatic on Render)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up
- [ ] Backup strategy in place

## Monitoring & Maintenance

### Logs
- Access logs via Render dashboard
- Backend: Web Service → Logs
- Frontend: Static Site → Logs

### Database Management
```bash
# Access Prisma Studio (locally)
cd server
npx prisma studio

# Run migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Backup Database
- Supabase provides automatic backups
- Access via Supabase Dashboard → Database → Backups

## Troubleshooting

### Backend Won't Start
1. Check environment variables
2. Verify DATABASE_URL is correct
3. Check build logs for errors
4. Ensure Prisma migrations ran successfully

### Frontend Can't Connect to Backend
1. Verify VITE_API_URL is set correctly
2. Check CORS configuration in backend
3. Verify backend is running

### Database Connection Issues
1. Check Supabase database status
2. Verify connection string
3. Check if IP is whitelisted (Supabase usually allows all)

### File Upload Issues
1. Check UPLOAD_DIR environment variable
2. Verify disk space on Render
3. Consider using cloud storage (AWS S3, Cloudinary)

## Scaling Considerations

### Backend
- Render auto-scales based on traffic
- Consider upgrading plan for:
  - More RAM
  - Dedicated instances
  - Better performance

### Database
- Monitor Supabase usage
- Upgrade Supabase plan if needed
- Consider connection pooling for high traffic

### File Storage
- Render has limited disk space
- For production, use:
  - AWS S3
  - Cloudinary
  - Google Cloud Storage

## Cost Estimation

### Free Tier
- Render: Free plan available (with limitations)
- Supabase: Free plan (500MB database, 2GB bandwidth)
- Total: $0/month

### Recommended Production
- Render Web Service: $7/month (Starter)
- Render Static Site: Free
- Supabase Pro: $25/month
- Total: ~$32/month

## Support

For deployment issues:
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- Contact: info@workershub.pk
