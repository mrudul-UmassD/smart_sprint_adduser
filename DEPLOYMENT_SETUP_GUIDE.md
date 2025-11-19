# Free Hosting Deployment Guide for Smart Sprint

This guide will walk you through deploying Smart Sprint for **FREE** using MongoDB Atlas and Render.com.

## Table of Contents
1. [MongoDB Atlas Setup (Free Database)](#mongodb-atlas-setup)
2. [Backend Deployment on Render (Free)](#backend-deployment-render)
3. [Frontend Deployment on Render (Free)](#frontend-deployment-render)
4. [Environment Configuration](#environment-configuration)
5. [Testing Your Deployment](#testing-deployment)
6. [Troubleshooting](#troubleshooting)

---

## MongoDB Atlas Setup (Free Database)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Complete the registration process

### Step 2: Create a Free Cluster

1. Click **"Build a Database"** or **"Create"**
2. Choose **"M0 Shared"** (FREE tier)
   - 512 MB storage
   - Shared RAM
   - Perfect for development and small apps
3. Select a cloud provider and region:
   - Choose **AWS**, **Google Cloud**, or **Azure**
   - Pick a region closest to your users (e.g., `us-east-1`)
4. Name your cluster (e.g., `smart-sprint-cluster`)
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Configure Database Access

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and strong password
   - Example: Username: `smartsprintuser`, Password: `YourSecurePassword123!`
   - **IMPORTANT:** Save these credentials securely!
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Render.com to connect
   - MongoDB Atlas has built-in security, so this is safe
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your credentials
7. Add your database name before the `?`:
   ```
   mongodb+srv://smartsprintuser:YourSecurePassword123!@cluster0.xxxxx.mongodb.net/smart-sprint?retryWrites=true&w=majority
   ```

**Example Connection String:**
```
mongodb+srv://smartsprintuser:YourPassword123@smartsprintcluster.abc12.mongodb.net/smart-sprint?retryWrites=true&w=majority
```

---

## Backend Deployment on Render (Free)

### Step 1: Create Render Account

1. Go to [Render.com](https://render.com/)
2. Sign up with GitHub (recommended) or email
3. Authorize Render to access your GitHub repositories

### Step 2: Prepare Your Repository

Make sure your changes are committed and pushed to GitHub:

```bash
cd c:\Users\MRUDUL\Desktop\Study\Project\smart_sprint_adduser
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 3: Create Backend Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `smart_sprint_adduser`
3. Configure the service:

**Basic Settings:**
- **Name:** `smart-sprint-backend`
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** (512 MB RAM, sleeps after 15 min inactivity)

### Step 4: Configure Backend Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `MONGODB_URI` | `mongodb+srv://username:password@...` | Your Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-2024` | Generate a strong random key |
| `PORT` | `5000` | Required |
| `FRONTEND_URL` | (leave empty for now) | Will add after frontend deployment |

**Generate a Strong JWT Secret:**
```bash
# Run this in PowerShell to generate a random secret:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Step 5: Deploy Backend

1. Click **"Create Web Service"**
2. Render will start building and deploying (takes 5-10 minutes)
3. Once deployed, you'll get a URL like: `https://smart-sprint-backend.onrender.com`
4. **Save this URL!**

### Step 6: Initialize Database

After deployment, run the database initialization:

1. Go to your service in Render
2. Click **"Shell"** tab
3. Run: `node initDB.js`
4. This creates the admin user and initial data

---

## Frontend Deployment on Render (Free)

### Step 1: Update Frontend API Configuration

First, update your frontend to use the backend URL:

Edit `frontend/src/utils/axiosConfig.js` or where your API base URL is configured:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://smart-sprint-backend.onrender.com/api';
```

Commit and push this change:

```bash
git add frontend/src/utils/axiosConfig.js
git commit -m "Update API URL for production"
git push origin main
```

### Step 2: Create Frontend Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository: `smart_sprint_adduser`
3. Configure the service:

**Basic Settings:**
- **Name:** `smart-sprint-frontend`
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `build`

### Step 3: Configure Frontend Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://smart-sprint-backend.onrender.com/api` |

### Step 4: Deploy Frontend

1. Click **"Create Static Site"**
2. Render will build and deploy (takes 5-10 minutes)
3. Once deployed, you'll get a URL like: `https://smart-sprint-frontend.onrender.com`

### Step 5: Update Backend with Frontend URL

1. Go back to your backend service in Render
2. Go to **"Environment"** tab
3. Update/Add `FRONTEND_URL`: `https://smart-sprint-frontend.onrender.com`
4. Click **"Save Changes"** (backend will redeploy automatically)

---

## Environment Configuration

### Backend .env (for Production)

Your backend on Render should have these environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-sprint?retryWrites=true&w=majority
JWT_SECRET=your-generated-secret-key-here
PORT=5000
FRONTEND_URL=https://smart-sprint-frontend.onrender.com
```

### Frontend Environment Variables

Your frontend on Render should have:

```env
REACT_APP_API_URL=https://smart-sprint-backend.onrender.com/api
```

---

## Testing Your Deployment

### Test Backend Health

1. Open browser and go to: `https://smart-sprint-backend.onrender.com/api/health`
2. You should see: `{"status":"ok"}`

### Test Frontend

1. Go to: `https://smart-sprint-frontend.onrender.com`
2. You should see the login page
3. Login with default admin credentials:
   - Username: `admin`
   - Password: `admin123`

### Test Full Integration

1. After logging in, try:
   - Creating a project
   - Adding tasks
   - Viewing dashboard widgets
2. Check browser console for any errors

---

## Troubleshooting

### Backend Issues

**Problem:** "Cannot connect to MongoDB"
- **Solution:** 
  - Verify MongoDB Atlas connection string is correct
  - Check that Network Access allows 0.0.0.0/0
  - Ensure database user credentials are correct

**Problem:** "Service won't start"
- **Solution:**
  - Check Render logs in the **"Logs"** tab
  - Verify `package.json` has correct `start` script
  - Ensure all dependencies are in `package.json`, not just `devDependencies`

**Problem:** "CORS errors"
- **Solution:**
  - Verify `FRONTEND_URL` environment variable is set correctly
  - Check that frontend URL matches exactly (no trailing slash)

### Frontend Issues

**Problem:** "API requests failing"
- **Solution:**
  - Verify `REACT_APP_API_URL` is set correctly
  - Check browser console for exact error
  - Ensure backend service is running

**Problem:** "Build fails"
- **Solution:**
  - Check Render build logs
  - Verify all dependencies are in `package.json`
  - Try building locally: `npm run build`

### Free Tier Limitations

**Problem:** "Service is slow or unresponsive"
- **Cause:** Free tier services sleep after 15 minutes of inactivity
- **Solution:** 
  - First request may take 30-60 seconds to wake up
  - Consider using a service like [UptimeRobot](https://uptimerobot.com/) to ping your app every 5 minutes
  - Upgrade to paid tier ($7/month) for always-on service

---

## Cost Breakdown (All FREE! 🎉)

| Service | Plan | Cost | What You Get |
|---------|------|------|--------------|
| **MongoDB Atlas** | M0 Shared | FREE | 512 MB storage, shared resources |
| **Render (Backend)** | Free Web Service | FREE | 512 MB RAM, 750 hrs/month, sleeps after 15 min |
| **Render (Frontend)** | Free Static Site | FREE | 100 GB bandwidth/month, CDN included |
| **TOTAL** | | **$0/month** | Perfect for portfolio projects! |

---

## Next Steps After Deployment

1. **Change Admin Password:** Login and change the default admin password immediately
2. **Add Custom Domain (Optional):** Render allows custom domains on free tier
3. **Set Up Monitoring:** Use Render's built-in metrics or external services
4. **Enable HTTPS:** Automatic with Render (included free)
5. **Configure Backups:** MongoDB Atlas has automatic backups on free tier

---

## Alternative Free Hosting Options

If you prefer different platforms:

### Backend Alternatives:
- **Railway.app** - $5 free credit, good for ~500 hours
- **Fly.io** - Free tier with 256 MB RAM
- **Heroku** - No longer has free tier (starts at $7/month)

### Frontend Alternatives:
- **Vercel** - Excellent for React, unlimited bandwidth
- **Netlify** - 100 GB bandwidth, continuous deployment
- **GitHub Pages** - Free static hosting (backend must be separate)

---

## Security Checklist

Before going live:

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] MongoDB Atlas has proper user credentials
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled (automatic on Render)
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled (already in code)
- [ ] No sensitive data in GitHub repository

---

## Need Help?

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Render Docs:** https://render.com/docs
- **GitHub Issues:** Report bugs in your repository
- **Community Support:** MongoDB and Render have active Discord communities

---

## Quick Reference URLs

After deployment, bookmark these:

- **Frontend:** `https://smart-sprint-frontend.onrender.com`
- **Backend API:** `https://smart-sprint-backend.onrender.com/api`
- **Backend Health:** `https://smart-sprint-backend.onrender.com/api/health`
- **MongoDB Atlas:** `https://cloud.mongodb.com/`
- **Render Dashboard:** `https://dashboard.render.com/`

---

**Congratulations!** 🎉 Your Smart Sprint app is now live and accessible from anywhere in the world!
