# Backend Deployment Guide

## 🚀 Deploy Backend to AWS Elastic Beanstalk

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- EB CLI installed (`pip install awsebcli`)

### Quick Deployment Steps

#### 1. Install EB CLI
```bash
pip install awsebcli --upgrade --user
```

#### 2. Initialize Elastic Beanstalk
```bash
cd /path/to/CS-490-GP-Backend
eb init
```

**Select:**
- Region: `us-east-1` (or your preferred region)
- Application name: `stygo-backend`
- Platform: `Node.js`
- Platform branch: `Node.js 18 running on 64bit Amazon Linux 2023` (or latest)
- SSH: `yes` (optional, for debugging)

#### 3. Create Environment
```bash
eb create stygo-backend-prod
```

This will:
- Create an EC2 instance
- Set up load balancer
- Configure auto-scaling
- Deploy your application
- Give you a URL like: `http://stygo-backend-prod.us-east-1.elasticbeanstalk.com`

#### 4. Set Environment Variables
```bash
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  JWT_SECRET=your_secret_here \
  MYSQL_HOST=your-rds-endpoint.rds.amazonaws.com \
  MYSQL_USER=admin \
  MYSQL_PASSWORD=your_password \
  MYSQL_DATABASE=salon_platform \
  FRONTEND_URLS=https://main.d9mc2y9b3gxgw.amplifyapp.com \
  CUSTOMER_PORTAL_URL=https://main.d9mc2y9b3gxgw.amplifyapp.com \
  EMAIL_USER=stygo.notifications@gmail.com \
  EMAIL_PASS=your_app_password \
  EMAIL_FROM="StyGo <stygo.notifications@gmail.com>" \
  FIREBASE_PROJECT_ID=your_project_id \
  FIREBASE_CLIENT_EMAIL=your_client_email \
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key\n-----END PRIVATE KEY-----\n" \
  CLICKSEND_USERNAME=your_clicksend_username \
  CLICKSEND_APIKEY=your_clicksend_key
```

#### 5. Deploy Updates
```bash
eb deploy
```

#### 6. Get Your Backend URL
```bash
eb status
```

Look for the `CNAME` - this is your backend URL!

---

## 🔧 Update Frontend with Backend URL

Once deployed, you'll get a URL like:
`http://stygo-backend-prod.us-east-1.elasticbeanstalk.com`

### Update Frontend Environment Variables

1. Go to **AWS Amplify Console**
2. Select your frontend app
3. Go to **"Environment variables"**
4. Add/Update:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `http://stygo-backend-prod.us-east-1.elasticbeanstalk.com` (your actual URL)
5. **Redeploy** your frontend

---

## Alternative: Quick Deploy with Render.com (FREE)

If you want a quick free deployment:

### 1. Go to [Render.com](https://render.com)

### 2. Create New Web Service
- Connect your GitHub repo: `https://github.com/Daniel-a-Guerrero/CS-490-GP-Backend`
- Name: `stygo-backend`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `node app.js`

### 3. Add Environment Variables
Add all your `.env` variables in the Render dashboard

### 4. Deploy
Render will give you a URL like: `https://stygo-backend.onrender.com`

### 5. Update Frontend
Update your Amplify environment variable:
- `NEXT_PUBLIC_API_URL` = `https://stygo-backend.onrender.com`

---

## ✅ Testing Deployment

After deployment, test with:

```bash
# Replace with your actual deployed URL
curl https://your-backend-url.com/health

# Test login
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sophia@luxebeauty.com","password":"Luxe2024!"}'

# Test salons endpoint
curl -X GET https://your-backend-url.com/api/salons \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔒 Important: Database Setup

Your backend needs a **cloud MySQL database**. Options:

### AWS RDS (Recommended)
1. Create RDS MySQL instance
2. Use the endpoint in your `MYSQL_HOST` environment variable
3. Import your database schema

### Or use existing RDS if you have one

---

## 📝 Useful Commands

```bash
# Check deployment status
eb status

# View logs
eb logs

# SSH into instance (if enabled)
eb ssh

# Open app in browser
eb open

# Terminate environment (careful!)
eb terminate stygo-backend-prod
```

---

## 🎯 Next Steps

1. Deploy backend to AWS EB or Render
2. Get the deployment URL
3. Update frontend `NEXT_PUBLIC_API_URL` in Amplify
4. Redeploy frontend
5. Test that salons are loading!

