# Myntra Clone - Deployment Guide

This guide covers deploying the backend to Render and frontend to Vercel.

---

## PART 1: BACKEND DEPLOYMENT (Render)

### Step 1: Prepare Backend for Render

1. **Create a `render.yaml` file** in the backend root:
   - This file tells Render how to build and deploy your app

2. **Environment Variables Setup:**
   - MongoDB Atlas connection string (already have: MONGO_URI)
   - PORT will be automatically set by Render

### Step 2: Create Render Account & Deploy

1. Go to https://render.com and sign up
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Configure:
   - **Name:** myntra-backend (or your choice)
   - **GitHub Repository:** Vedantraneopbhai/Myntra-clone
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Plan:** Free (or paid if needed)

5. Add Environment Variables in Render Dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: https://your-frontend-domain.vercel.app

6. Click "Deploy"
7. Note the backend URL (e.g., https://myntra-backend.onrender.com)

### Step 3: Important Notes for Backend

- Render free tier has limitations (30 mins inactivity = spin down)
- Use paid tier for production reliability
- MongoDB Atlas free tier is limited to 512MB
- Backend will take 1-2 mins to respond after inactivity (on free tier)

---

## PART 2: FRONTEND DEPLOYMENT (Vercel)

### Step 1: Build Frontend for Web

```bash
cd myntra
npm install
npx expo export --platform web
```

This creates a `dist` folder ready for deployment.

### Step 2: Update API Endpoint

Before deploying, update the API configuration:

**File:** `myntra/constants/api.ts`

```typescript
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = configuredBaseUrl || "https://myntra-backend.onrender.com";
```

### Step 3: Create Vercel Configuration

**File:** `myntra/vercel.json`

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": "expo",
  "env": {
    "EXPO_PUBLIC_API_BASE_URL": "@myntra_api_base_url"
  }
}
```

### Step 4: Deploy to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click "Import Project"
3. Select your GitHub repository (Vedantraneopbhai/Myntra-clone)
4. Configure:
   - **Framework Preset:** Expo
   - **Root Directory:** ./myntra
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`

5. Add Environment Variables:
   - `EXPO_PUBLIC_API_BASE_URL`: https://myntra-backend.onrender.com

6. Click "Deploy"

---

## PART 3: AFTER DEPLOYMENT - Testing Login & Signup

### Step 1: Test Connectivity

1. Open your Vercel frontend URL in browser
2. Open browser Developer Console (F12 → Network tab)
3. Try signup/login
4. Check if API calls go to your Render backend URL

### Step 2: Common Issues & Fixes

**Issue 1: CORS Error**
- **Solution:** Render backend already has CORS enabled for all origins
- If still getting CORS error, update server.js:
  ```javascript
  app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  }));
  ```

**Issue 2: "Cannot reach backend"**
- **Solution:** 
  - Check Render URL is correct in frontend
  - Check MongoDB connection in Render (go to Render Dashboard → Logs)
  - Render free tier may need 30-60 seconds first load

**Issue 3: "Auth token not persisting"**
- **Solution:**
  - Check browser cookies/localStorage (F12 → Application)
  - Verify secure/httpOnly flags are correct in backend

**Issue 4: "Signup/Login timeout"**
- **Solution:**
  - Render free tier spins down after 15 mins inactivity
  - First request takes 30-60 seconds
  - Consider upgrading to paid tier for production

### Step 3: Database Verification

1. Login to MongoDB Atlas: https://account.mongodb.com/account/login
2. Go to Collections
3. Verify `users` collection exists and has signup data
4. Check `products`, `categories` collections are properly seeded

---

## PART 4: PRODUCTION SETUP (Recommended)

### For Better Reliability:

**Backend on Render:**
- Upgrade from Free to Starter Plan ($7/month)
- Enables persistent database, no spin-down
- Add custom domain: `api.yourdomain.com`

**Frontend on Vercel:**
- Free tier is sufficient
- Add custom domain: `yourdomain.com`

**Database on MongoDB:**
- Free tier (512MB) is okay for development
- For production, upgrade to M2 Cluster ($57/month)
- Enable IP whitelist for your Render IP

### SSL/TLS & HTTPS:
- Both Render and Vercel provide free HTTPS
- No additional setup needed

---

## PART 5: ENVIRONMENT VARIABLES CHECKLIST

### Render Backend .env:
```
PORT=5000
MONGO_URI=mongodb+srv://admin:password@cluster.mongodb.net/myntra_clone
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Vercel Frontend .env:
```
EXPO_PUBLIC_API_BASE_URL=https://myntra-backend.onrender.com
```

---

## PART 6: MONITORING & LOGS

### Render:
1. Go to Render Dashboard
2. Select your web service
3. View "Logs" in real-time
4. Monitor for errors

### Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" → "Logs"
4. View build and runtime logs

### MongoDB Atlas:
1. Go to MongoDB Atlas Dashboard
2. Click "Database Access" → check user credentials
3. Click "Network Access" → verify IP whitelist

---

## QUICK DEPLOYMENT CHECKLIST

- [ ] Backend render.yaml file created
- [ ] MongoDB connection verified in Render
- [ ] Frontend API endpoint updated to Render URL
- [ ] Frontend vercel.json configured
- [ ] Vercel environment variables set
- [ ] Deployed to Render
- [ ] Deployed to Vercel
- [ ] Tested signup/login on Vercel frontend
- [ ] Verified API calls in Network tab
- [ ] Checked MongoDB Atlas for new users
- [ ] Tested on different devices/browsers

---

## FURTHER STEPS (Post-Deployment)

1. **Add Authentication Persistence:**
   - Implement JWT refresh tokens
   - Store auth token in secure storage

2. **Add API Rate Limiting:**
   - Prevent brute force attacks
   - Limit signup/login attempts per IP

3. **Setup Email Verification:**
   - Send verification email on signup
   - Verify email before allowing login

4. **Add Error Tracking:**
   - Integrate Sentry for error monitoring
   - Track production issues

5. **Setup CI/CD Pipeline:**
   - Auto-deploy on git push
   - Run tests before deployment

6. **Add Security Headers:**
   - HTTPS everywhere
   - CSP headers
   - X-Frame-Options

7. **Performance Optimization:**
   - Enable caching
   - Compress API responses
   - Optimize database queries

8. **Backup & Disaster Recovery:**
   - Setup MongoDB Atlas backup
   - Enable GitHub backups

---

## SUPPORT

If you encounter issues:
1. Check Render Logs: https://render.com/dashboard
2. Check Vercel Logs: https://vercel.com/dashboard
3. Check MongoDB Logs: https://cloud.mongodb.com
4. Test API directly: curl https://myntra-backend.onrender.com/
