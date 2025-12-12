# 🚀 QUICK DEPLOY GUIDE - Fix "No Salons Found" Issue

## The Problem
Your frontend (on AWS Amplify) can't connect to your backend because **the backend isn't deployed yet** - it's only running locally.

## ✅ FASTEST SOLUTION: Deploy to Render.com (FREE & 5 Minutes)

### Step 1: Sign Up & Connect GitHub
1. Go to **https://render.com**
2. Sign up with GitHub
3. Authorize Render to access your repos

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect repository: `Daniel-a-Guerrero/CS-490-GP-Backend`
3. Configure:
   - **Name**: `stygo-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables
Click **"Advanced"** and add these variables (get values from your local `.env` file):

```
NODE_ENV=production
PORT=10000
JWT_SECRET=your_jwt_secret_here
MYSQL_HOST=your_mysql_host (RDS endpoint or remote DB)
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=salon_platform
FRONTEND_URLS=https://main.d9mc2y9b3gxgw.amplifyapp.com
CUSTOMER_PORTAL_URL=https://main.d9mc2y9b3gxgw.amplifyapp.com
CUSTOMER_PASSWORD_SETUP_PATH=/customer/setup-password
CUSTOMER_APPOINTMENT_PATH=/customer/appointments
CUSTOMER_SIGNIN_PATH=/sign-in
CUSTOMER_PORTAL_TOKEN_TTL=7d
EMAIL_USER=stygo.notifications@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=StyGo <stygo.notifications@gmail.com>
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
CLICKSEND_USERNAME=your_clicksend_username
CLICKSEND_APIKEY=your_clicksend_key
CLICKSEND_FROM_NUMBER=+18339034543
OTP_FROM_NAME=StyGo
```

### Step 4: Deploy!
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://stygo-backend.onrender.com`

### Step 5: Update Frontend
1. Go to **AWS Amplify Console**
2. Select your app: `main.d9mc2y9b3gxgw.amplifyapp.com`
3. Click **"Environment variables"** (left sidebar)
4. Add/Update:
   - **Variable**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://stygo-backend.onrender.com` (your actual Render URL)
5. Go to **"Deployments"** tab
6. Click **"Redeploy this version"**

### Step 6: Test!
Wait 2-3 minutes for frontend redeploy, then:
1. Go to your frontend: `https://main.d9mc2y9b3gxgw.amplifyapp.com`
2. Login with any salon owner account (see `QUICK_LOGIN_REFERENCE.txt`)
3. **All 4 professional salons should now appear!** 🎉

---

## 🔍 Verify Deployment

Test your deployed backend:

```bash
# Health check
curl https://stygo-backend.onrender.com/health

# Test salons (after login to get token)
curl https://stygo-backend.onrender.com/api/salons \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Important Notes

1. **Database**: Your backend needs to connect to a cloud MySQL database (not localhost)
   - Use AWS RDS, PlanetScale, or another hosted MySQL
   - Update `MYSQL_HOST` with the remote endpoint

2. **Free Tier Limits** (Render.com):
   - Sleeps after 15 min of inactivity
   - First request after sleep takes 30-60 seconds
   - Upgrade to paid tier ($7/mo) for always-on service

3. **Render Auto-Deploy**:
   - Every `git push` to `main` branch auto-deploys
   - Check deployment logs at: https://dashboard.render.com

---

## 🆘 Troubleshooting

**"No salons found" still showing?**
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Amplify
- Make sure you redeployed the frontend after adding the env var

**Backend health check fails?**
- Check Render dashboard logs
- Verify all environment variables are set
- Make sure database is accessible from Render's IP

**CORS errors?**
- Ensure `FRONTEND_URLS` includes your Amplify URL
- Check Render logs for CORS-related errors

---

## 📚 Alternative: AWS Elastic Beanstalk
See full `DEPLOYMENT.md` for AWS EB deployment instructions.

---

**Need help?** Check the Render logs or AWS Amplify build logs for specific errors.

