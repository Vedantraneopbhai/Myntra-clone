# STEP-BY-STEP DEPLOYMENT CHECKLIST

## STEP 1: Prepare for Deployment (Local)

### 1.1 Update Frontend API Endpoint
```bash
# File: myntra/constants/api.ts
# Ensure it's configured to use environment variables
```

**Current Content Should Be:**
```typescript
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
export const API_BASE_URL = configuredBaseUrl || "http://localhost:5000";
```

**Action:** ✅ Already configured correctly

---

### 1.2 Update Vercel Configuration
```bash
# File: myntra/vercel.json
```

**New Content:**
```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": "expo",
  "env": {
    "EXPO_PUBLIC_API_BASE_URL": "@api_base_url"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Action:** ✅ Already created

---

### 1.3 Create Backend Render Config
```bash
# File: backend/render.yaml
```

**Action:** ✅ Already created

---

### 1.4 Commit Changes
```bash
cd c:\Users\VEDANT\OneDrive\Desktop\Myntra-clone
git add -A
git commit -m "v11: Deployment configuration for Render and Vercel"
git push origin main
```

---

## STEP 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize GitHub access

### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Select repository: `Vedantraneopbhai/Myntra-clone`
3. Choose "Connect"

### 2.3 Configure Deployment Settings
- **Name:** `myntra-backend`
- **Environment:** `Node`
- **Region:** `Oregon` (or closest to you)
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `backend`
- **Instance Type:** `Free` (for testing)

### 2.4 Add Environment Variables
In Render Dashboard → myntra-backend → Environment:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB connection string |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

**To Get MongoDB Connection String:**
1. Go to MongoDB Atlas: https://account.mongodb.com
2. Click "Cluster0"
3. Click "Connect" → "Connect Your Application"
4. Copy the connection string
5. Replace `<password>` with your MongoDB password

### 2.5 Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Once deployed, note the URL: `https://myntra-backend.onrender.com` (or similar)

### 2.6 Test Backend
```bash
# In terminal or browser
curl https://myntra-backend.onrender.com/

# Should see: "✅ Myntra backend in working"
```

---

## STEP 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize GitHub access

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Search for: `Myntra-clone`
3. Click "Import"

### 3.3 Configure Project Settings
- **Project Name:** `myntra-frontend`
- **Framework Preset:** `Other` (since it's Expo)
- **Root Directory:** `./myntra`
- **Build Command:** `npx expo export --platform web`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.4 Add Environment Variables
Before deploying, add:

| Key | Value |
|-----|-------|
| `EXPO_PUBLIC_API_BASE_URL` | `https://myntra-backend.onrender.com` |

(Replace with your actual Render backend URL)

### 3.5 Deploy
- Click "Deploy"
- Wait for deployment (3-5 minutes)
- Once deployed, you'll get a URL like: `https://myntra-frontend.vercel.app`

---

## STEP 4: Test Authentication Flow

### 4.1 Open Frontend in Browser
```
https://myntra-frontend.vercel.app
```

### 4.2 Test Signup
1. Click on "Sign Up" / "Register"
2. Fill in details:
   - **Email:** test@example.com
   - **Password:** Test@123
   - **Confirm Password:** Test@123
3. Click "Submit"

### 4.3 Check Console for Errors
1. Open Developer Tools: `F12`
2. Go to "Console" tab
3. Look for any error messages
4. Go to "Network" tab
5. Check if API call went to your Render backend (should see POST to `/user/signup`)

### 4.4 Verify in MongoDB
1. Go to MongoDB Atlas Dashboard
2. Click "Collections" on your cluster
3. Select `myntra_clone` database
4. Check `users` collection
5. You should see your new signup record

### 4.5 Test Login
1. Go back to frontend
2. Click "Login"
3. Enter email and password from signup
4. Should login successfully

### 4.6 Check for Common Issues

**Issue: "Cannot connect to API"**
- [ ] Check Render backend is running (visit backend URL)
- [ ] Verify API_BASE_URL in Vercel env matches your Render URL
- [ ] Check CORS is enabled (should be in backend)

**Issue: "Email already exists"**
- [ ] Database has duplicate user (expected on second signup with same email)
- [ ] Try different email address

**Issue: "Auth token not saving"**
- [ ] Check browser cookies (F12 → Application → Cookies)
- [ ] Verify localStorage has auth token
- [ ] Check if token is secure/httpOnly

**Issue: "Render backend not responding"**
- [ ] Render free tier spins down after 15 mins inactivity
- [ ] First request takes 30-60 seconds
- [ ] Refresh page and wait

---

## STEP 5: Additional Configuration

### 5.1 Add Custom Domain (Optional)
**Vercel:**
1. Go to Vercel Dashboard → myntra-frontend
2. Settings → Domains
3. Add your domain (requires DNS setup)

**Render:**
1. Go to Render Dashboard → myntra-backend
2. Settings → Custom Domain
3. Add your domain (requires DNS setup)

### 5.2 Setup Monitoring
**Vercel:**
- Automatically monitors deployments
- Go to Deployments tab to see logs

**Render:**
- Go to Logs tab to see real-time logs
- Set up alerts (paid feature)

### 5.3 Enable Analytics
**Vercel:**
1. Settings → Analytics
2. Enable Web Analytics
3. View performance metrics

---

## STEP 6: Monitor Logs for Errors

### Backend Logs (Render)
1. Go to Render Dashboard
2. Select "myntra-backend"
3. Click "Logs"
4. Watch for errors on signup/login

### Frontend Logs (Vercel)
1. Go to Vercel Dashboard
2. Select "myntra-frontend"
3. Click "Deployments" → "View Logs"
4. Check for build or runtime errors

### Database Logs (MongoDB)
1. Go to MongoDB Atlas Dashboard
2. Click your cluster
3. View activity and connection logs

---

## STEP 7: Troubleshooting Guide

### Signup Not Working

**Error: "Network Error"**
```
✅ Solution:
1. Check if Render backend URL is correct
2. Verify CORS_ORIGIN includes your Vercel URL
3. Wait 30-60 seconds if Render is spinning up
```

**Error: "Invalid Email"**
```
✅ Solution:
1. Check email format validation in backend
2. Use valid email (e.g., user@example.com)
```

**Error: "Password Too Weak"**
```
✅ Solution:
1. Password must be at least 6 characters
2. Include mix of uppercase, lowercase, numbers
```

**Error: "User Already Exists"**
```
✅ Solution:
1. Use different email address
2. Or delete user from MongoDB Atlas
```

### Login Not Working

**Error: "Invalid Credentials"**
```
✅ Solution:
1. Check email is exactly as registered
2. Check password is exactly correct
3. Clear browser cache/cookies
```

**Error: "Auth Token Invalid"**
```
✅ Solution:
1. Clear localStorage (F12 → Application)
2. Login again
3. Try incognito/private browser window
```

**Error: "Session Expired"**
```
✅ Solution:
1. Implementation needed: JWT refresh tokens
2. For now: logout and login again
```

### API Not Reaching Backend

**In Network Tab, No API Calls Seen:**
```
✅ Solution:
1. Check Environment Variable is set in Vercel
2. Redeploy Vercel (Settings → Deployments → Redeploy)
3. Hard refresh browser (Ctrl+Shift+R)
```

**API Calls Return 404:**
```
✅ Solution:
1. Check backend route exists (/user/signup)
2. Verify route is properly registered in server.js
3. Check Render logs for server startup errors
```

**API Calls Return 500:**
```
✅ Solution:
1. Check MongoDB connection in Render logs
2. Verify MONGO_URI is correct
3. Check database credentials haven't changed
```

---

## STEP 8: Next Steps After Deployment

### Immediate (Next Day)
- [ ] Monitor backend logs for errors
- [ ] Test signup/login from different browsers
- [ ] Test on mobile device via QR code
- [ ] Verify all products are loading
- [ ] Check recommendation engine works

### Short Term (1 Week)
- [ ] Setup email notifications
- [ ] Add error tracking (Sentry)
- [ ] Enable rate limiting on API
- [ ] Setup database backups
- [ ] Monitor Render costs

### Medium Term (1 Month)
- [ ] Upgrade Render to Starter plan ($7/month)
- [ ] Add custom domain
- [ ] Setup SSL certificate
- [ ] Implement JWT refresh tokens
- [ ] Add email verification on signup

### Long Term (Production)
- [ ] Upgrade MongoDB to paid tier
- [ ] Setup redundant backups
- [ ] Add comprehensive logging
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

---

## QUICK REFERENCE

**Frontend URL:** https://myntra-frontend.vercel.app
**Backend URL:** https://myntra-backend.onrender.com
**MongoDB:** https://cloud.mongodb.com
**Render Dashboard:** https://render.com/dashboard
**Vercel Dashboard:** https://vercel.com/dashboard

**Critical Environment Variables:**
- Backend: `MONGO_URI`
- Frontend: `EXPO_PUBLIC_API_BASE_URL`

**Testing:**
- Signup Email: test@example.com
- Signup Password: Test@123
- Check: MongoDB Atlas Collections → users

---

**Status:** Ready for Deployment ✅
**Last Updated:** 2026-05-27
