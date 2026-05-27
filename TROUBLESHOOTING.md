# Post-Deployment Troubleshooting Guide

## Quick Diagnosis: Login & Signup Issues

### 1. SIGNUP/LOGIN NOT SUBMITTING

**Symptom:** Button click does nothing, page doesn't respond

**Fix:**
```bash
# Step 1: Check Network Tab
- Open F12 → Network tab
- Try signup/login
- Look for API request to /user/signup or /user/login

# Step 2: If no request appears
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Try incognito window

# Step 3: If still nothing
- Check browser console for JavaScript errors
- Verify environment variable is set in Vercel
  (Vercel Dashboard → Settings → Environment Variables)
```

---

### 2. NETWORK ERROR / "Cannot Reach Backend"

**Symptom:** Error message or timeout

**Fix:**
```bash
# Step 1: Verify Backend URL
- Visit: https://myntra-backend.onrender.com/
- Should see: "✅ Myntra backend in working"
- If not, backend is down

# Step 2: Check Render Logs
- Render Dashboard → myntra-backend → Logs
- Look for connection errors
- Look for PORT binding errors

# Step 3: Verify Environment Variable
- Vercel Dashboard → Settings → Environment Variables
- Check EXPO_PUBLIC_API_BASE_URL is correct
- Should be: https://myntra-backend.onrender.com (NO trailing slash)

# Step 4: Redeploy Frontend
- Vercel Dashboard → Deployments
- Click "⋯" on latest → "Redeploy"
- Wait for redeployment to complete
```

---

### 3. CORS ERROR in Console

**Symptom:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Fix:**
```bash
# Step 1: Verify Backend CORS
- Render Dashboard → myntra-backend → Logs
- Look for CORS configuration on startup

# Step 2: Check .env on Render
- Render Dashboard → myntra-backend → Environment
- Verify CORS_ORIGIN includes your Vercel URL
- Should be: https://your-domain.vercel.app

# Step 3: If Missing, Add to Render
- Environment Variables → Add New
- Key: CORS_ORIGIN
- Value: https://your-vercel-url.vercel.app

# Step 4: Restart Backend
- Render Dashboard → myntra-backend
- Click "Manual Deploy" button
```

---

### 4. "USER ALREADY EXISTS" ERROR

**Symptom:** Error on signup even with new email

**Fix:**
```bash
# Step 1: Verify Email Address
- Use completely different email: test2@example.com
- Check for typos in previous attempt

# Step 2: Check MongoDB
- MongoDB Atlas → Collections → users
- Find and delete the test user from previous attempt
- Try signup again

# Step 3: If Persistent
- Check for duplicate unique index in database
- MongoDB Atlas → Indexes
- Delete if duplicate exists
```

---

### 5. "INVALID CREDENTIALS" ON LOGIN

**Symptom:** Can't login even with correct credentials

**Fix:**
```bash
# Step 1: Verify Credentials
- Use exact email and password from signup
- Email is case-insensitive but password is NOT
- Check for spaces before/after email

# Step 2: Verify User Exists in DB
- MongoDB Atlas → Collections → users
- Search for your email
- Verify password hash is stored (should be long alphanumeric string)

# Step 3: Clear Browser Storage
- F12 → Application → Cookies → Delete all
- F12 → Application → Local Storage → Clear All
- Hard refresh: Ctrl+Shift+R
- Try login again

# Step 4: Check Backend Logs
- Render Dashboard → Logs
- Look for "Authentication failed" errors
- Check password comparison logic
```

---

### 6. AUTHENTICATION TOKEN NOT SAVING

**Symptom:** Login works but user logs out immediately

**Fix:**
```bash
# Step 1: Check Token Storage
- F12 → Application → Local Storage
- Look for 'auth_token' or 'user' key
- Should have non-empty value after login

# Step 2: Verify Token in Response
- F12 → Network → Click login request
- Go to Response tab
- Look for 'token' or 'authToken' field
- Should contain JWT token

# Step 3: Check AuthContext
- File: myntra/context/AuthContext.tsx
- Verify setUser() is being called after login
- Verify token is saved to localStorage

# Step 4: Browser Privacy
- Some browsers block localStorage in incognito
- Try in normal window
- Check browser storage settings

# Step 5: Check Secure/HttpOnly Flags
- F12 → Network → login request → Cookies
- Verify cookie has proper flags
- May need to adjust backend cookie settings
```

---

### 7. "RENDER BACKEND SPINNING UP" - Slow Response

**Symptom:** First request takes 30-60 seconds, then fast

**Fix:**
```bash
# This is NORMAL for Render free tier
# Backend spins down after 15 minutes inactivity
# First request wakes it up (takes 30-60 seconds)

# Options:
# 1. Wait for response (don't close request)
# 2. Upgrade Render to Starter plan ($7/month) - no spin-down
# 3. Keep-alive: Setup cron job to ping backend every 10 minutes
```

---

### 8. MONGODB CONNECTION ERROR

**Symptom:** Backend shows "Cannot connect to MongoDB"

**Fix:**
```bash
# Step 1: Verify Connection String
- Render Dashboard → Environment Variables
- Check MONGO_URI is complete and correct
- Should start with: mongodb+srv://

# Step 2: Check MongoDB Credentials
- MongoDB Atlas → Database Access
- Verify username and password are correct
- Password is case-sensitive, special chars encoded as %XX

# Step 3: Check IP Whitelist
- MongoDB Atlas → Network Access
- Verify Render's IP is allowed
- Should be 0.0.0.0/0 or specific Render IP

# Step 4: Test Connection Manually
- MongoDB Atlas → Clusters → Connect
- Test with your credentials
- Try connection string in compass app

# Step 5: Check Database Exists
- MongoDB Atlas → Collections
- Database should be named: myntra_clone
- Should have users, products, categories collections
```

---

### 9. PAGE BLANK / NO CONTENT LOADS

**Symptom:** Vercel page loads but shows nothing

**Fix:**
```bash
# Step 1: Check Browser Console
- F12 → Console tab
- Look for JavaScript errors
- Look for "Cannot GET /" errors

# Step 2: Check Vercel Logs
- Vercel Dashboard → Deployments → Latest
- Check build log for errors
- Look for "npm: not found" or build errors

# Step 3: Verify Build Output
- Vercel Dashboard → Settings → Build & Deployment
- Build Command should be: npx expo export --platform web
- Output Directory should be: dist

# Step 4: Redeploy
- Vercel Dashboard → Deployments
- Click "⋯" → "Redeploy"
- Wait for successful redeployment

# Step 5: Check Expo Export Locally
- Run: npm install
- Run: npx expo export --platform web
- Check if dist folder is created
- If fails, fix errors before deploying
```

---

### 10. PRODUCTS NOT LOADING

**Symptom:** Product page blank or shows skeleton

**Fix:**
```bash
# Step 1: Check API Call
- F12 → Network tab
- Look for /api/product request
- Check response status (200 = success)

# Step 2: Check MongoDB Data
- MongoDB Atlas → Collections
- Check 'products' collection exists
- Verify it has documents (should have 10+)

# Step 3: Check Backend Route
- Render Logs look for GET /product errors
- Verify route exists in backend/routes/Productroutes.js
- Check Product model is correctly defined

# Step 4: Seed Database
- Run locally: node seed.js
- Should insert 10 sample products
- Verify in MongoDB Atlas
```

---

## DATABASE MAINTENANCE

### Reset User Data (Testing)
```bash
# MongoDB Atlas → Collections → users → Delete All Documents
# Then test signup again with new user
```

### Backup Data
```bash
# MongoDB Atlas → Backup → Download
# Creates downloadable backup of all data
```

### View Current Users
```bash
# MongoDB Atlas → Collections → users
# Shows all registered users
# Click user to see signup details
```

---

## PERFORMANCE MONITORING

### Check Backend Health
```bash
curl -w "\n%{http_code}\n" https://myntra-backend.onrender.com/
# Response should be:
# ✅ Myntra backend in working
# 200
```

### Check Frontend Health
```bash
# Just open in browser
https://myntra-frontend.vercel.app
# Should load in < 3 seconds
```

### Monitor Real Users
- Vercel Analytics: Dashboard → Analytics
- See visitor count, page views, performance

---

## GETTING HELP

If still stuck:

1. **Check Logs:**
   - Vercel: https://vercel.com/dashboard
   - Render: https://render.com/dashboard
   - MongoDB: https://cloud.mongodb.com

2. **Common Solutions:**
   - Clear cache: Ctrl+Shift+Delete
   - Hard refresh: Ctrl+Shift+R
   - Restart backend: Render → Manual Deploy
   - Redeploy frontend: Vercel → Redeploy

3. **Test Locally First:**
   - Run locally to verify signup/login works
   - Run: npm start (backend and frontend)
   - Fix issues locally before redeploying

4. **Search Error Messages:**
   - Copy exact error message
   - Search on Stack Overflow
   - Check Render/Vercel documentation

---

**Last Updated:** 2026-05-27
**Status:** Ready for troubleshooting ✅
