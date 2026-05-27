# ⚡ QUICK REFERENCE CARD - DEPLOYMENT IN 10 MINUTES

## 📌 ONE-PAGE DEPLOYMENT GUIDE

### BACKEND TO RENDER (5 mins)

```
1. https://render.com → Sign up with GitHub
2. New Web Service → Connect Myntra-clone repo
3. Settings:
   ├─ Name: myntra-backend
   ├─ Root Dir: backend
   ├─ Build: npm install
   ├─ Start: npm start
   └─ Plan: Free

4. Environment Variables:
   ├─ MONGO_URI: [from MongoDB Atlas]
   ├─ NODE_ENV: production
   └─ PORT: 5000

5. Create & Wait → 5-10 mins
6. Copy URL: https://myntra-backend.onrender.com ← SAVE THIS
```

---

### FRONTEND TO VERCEL (3 mins)

```
1. https://vercel.com → Sign up with GitHub
2. Import Project → Select Myntra-clone
3. Settings:
   ├─ Root Dir: ./myntra
   ├─ Build: npx expo export --platform web
   ├─ Output: dist
   └─ Framework: Other

4. Environment Variable:
   └─ EXPO_PUBLIC_API_BASE_URL: [paste Render URL from above]

5. Deploy & Wait → 3-5 mins
6. Copy URL: https://myntra-frontend.vercel.app ← YOUR APP
```

---

### TEST SIGNUP (2 mins)

```
1. Open: https://myntra-frontend.vercel.app
2. Click Sign Up
3. Email: test@example.com
4. Password: Test@123
5. Submit → Should succeed ✅

Check: F12 → Network → See /user/signup request
Check: MongoDB Atlas → See new user in 'users' collection
```

---

## 🎯 REQUIRED CREDENTIALS

| What | Where |
|------|-------|
| **MongoDB URL** | MongoDB Atlas → Cluster → Connect → Application |
| **Render URL** | Will be given after deployment |
| **Vercel URL** | Will be given after deployment |

---

## 🔐 ENVIRONMENT VARIABLES

### Render (Backend)
```
MONGO_URI=mongodb+srv://admin:PASSWORD@cluster.mongodb.net/myntra_clone
NODE_ENV=production
CORS_ORIGIN=https://[YOUR-VERCEL-URL].vercel.app
```

### Vercel (Frontend)  
```
EXPO_PUBLIC_API_BASE_URL=https://[YOUR-RENDER-URL].onrender.com
```

---

## ✅ FINAL CHECKLIST

| Task | Status |
|------|--------|
| Backend deployed on Render | ☐ |
| Render environment variables set | ☐ |
| Frontend deployed on Vercel | ☐ |
| Vercel environment variables set | ☐ |
| Tested signup successfully | ☐ |
| Tested login successfully | ☐ |
| User appears in MongoDB | ☐ |
| Products load correctly | ☐ |

---

## 🆘 QUICK FIXES

| Problem | Solution |
|---------|----------|
| "Cannot reach API" | Verify API URL in Vercel env vars |
| "CORS Error" | Add Vercel URL to Render CORS_ORIGIN |
| "Very slow first load" | Normal! Render free tier spins down. Wait 30-60s |
| "User already exists" | Use different email (test2@example.com) |
| "Wrong password" | Password is case-sensitive, no spaces |
| "Blank page on Vercel" | Hard refresh: Ctrl+Shift+R |
| "Backend error" | Check Render logs for details |

---

## 🔗 DIRECT LINKS

- Render Dashboard: https://render.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub Repo: https://github.com/Vedantraneopbhai/Myntra-clone

---

## 📊 AFTER DEPLOYMENT

```
USER FLOW:
1. User opens: myntra-frontend.vercel.app
2. Clicks Signup
3. Enters email & password
4. Frontend sends to: myntra-backend.onrender.com/user/signup
5. Backend saves to MongoDB Atlas
6. Returns success/token to frontend
7. Frontend stores token
8. User logged in! ✅

All HTTPS (secure)
All automatic scaling
Zero maintenance needed (initially)
```

---

## 💰 COSTS

- **Render Free Tier:** $0/month (spins down after 15 mins)
- **Vercel Free Tier:** $0/month (unlimited)
- **MongoDB Free Tier:** $0/month (512MB storage)
- **Total Cost:** $0/month for testing ✅

**For Production:**
- Render Starter: $7/month (no spin-down)
- MongoDB M2: $57/month (more storage)
- **Total: ~$65/month**

---

## 🚀 GO LIVE IN 3 STEPS

```
STEP 1: Deploy Backend to Render
        ↓ (5 minutes)
STEP 2: Deploy Frontend to Vercel (with API URL from Step 1)
        ↓ (3 minutes)
STEP 3: Test Signup/Login
        ↓ (2 minutes)
DONE! Your app is live 🎉
```

---

## 📞 IF STUCK

1. Check TROUBLESHOOTING.md in project root
2. Check deployment provider logs:
   - Render: Dashboard → Logs
   - Vercel: Deployments → Logs
3. Verify environment variables are set
4. Hard refresh browser: Ctrl+Shift+R
5. Clear cache: Ctrl+Shift+Delete

---

**Total Time:** 10-15 minutes
**Difficulty:** Easy ✅
**Current Version:** v11 (Production Ready)

🎉 **You're ready to deploy!**
