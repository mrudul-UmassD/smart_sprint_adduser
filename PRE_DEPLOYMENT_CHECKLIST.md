# Pre-Deployment Checklist for Smart Sprint

## Before You Start

### 1. MongoDB Atlas Setup
- [ ] Created MongoDB Atlas account
- [ ] Created free M0 cluster
- [ ] Created database user with password
- [ ] Set network access to 0.0.0.0/0
- [ ] Copied connection string
- [ ] Connection string tested locally

### 2. GitHub Repository
- [ ] All changes committed
- [ ] Code pushed to main branch
- [ ] Repository is public or Render has access
- [ ] No sensitive data in repository (passwords, secrets)

### 3. Environment Variables Ready
- [ ] MongoDB connection string ready
- [ ] JWT secret generated (32+ characters)
- [ ] Frontend and backend URLs planned

---

## Testing Locally with Production Settings

### Test with MongoDB Atlas (Recommended before deploying)

1. Update your backend `.env` file:
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_generated_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

2. Start backend:
```bash
cd backend
npm start
```

3. Start frontend:
```bash
cd frontend
npm start
```

4. Test the application thoroughly:
   - Login/logout
   - Create projects
   - Add tasks
   - Dashboard widgets
   - All major features

---

## Deployment Steps Summary

### Phase 1: Database (10 minutes)
1. Set up MongoDB Atlas cluster
2. Get connection string
3. Test connection locally

### Phase 2: Backend (15 minutes)
1. Create Render account
2. Connect GitHub repository
3. Create Web Service for backend
4. Set environment variables
5. Deploy and test
6. Initialize database with admin user

### Phase 3: Frontend (15 minutes)
1. Create Static Site for frontend
2. Set API URL environment variable
3. Deploy and test
4. Update backend with frontend URL

### Phase 4: Testing (10 minutes)
1. Test complete user flow
2. Check all features work
3. Verify security settings

**Total Time: ~50 minutes**

---

## Quick Commands

### Generate JWT Secret
```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Test MongoDB Connection
```bash
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_CONNECTION_STRING').then(() => console.log('✓ Connected')).catch(err => console.error('✗ Error:', err.message))"
```

### Build Frontend Locally
```bash
cd frontend
npm run build
```

### Check for Build Errors
```bash
cd frontend
npm run build 2>&1 | Select-String "error"
```

---

## Common Pre-Deployment Issues

### Issue: Build fails locally
**Fix:** Run `npm run build` in frontend directory and fix any errors

### Issue: MongoDB connection fails
**Fix:** 
- Check connection string format
- Verify username/password
- Ensure Network Access is set to 0.0.0.0/0

### Issue: CORS errors
**Fix:**
- Ensure FRONTEND_URL is set in backend
- Verify URLs don't have trailing slashes

---

## Security Checklist

Before deploying:
- [ ] No `.env` files in repository
- [ ] No hardcoded passwords or secrets
- [ ] MongoDB connection string uses environment variables
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Default admin password will be changed after first login
- [ ] Rate limiting is enabled (already in code)

---

## Post-Deployment Tasks

After successful deployment:
1. [ ] Login with admin credentials
2. [ ] Change admin password immediately
3. [ ] Create test user accounts
4. [ ] Test all major features
5. [ ] Bookmark application URLs
6. [ ] Set up monitoring (optional)
7. [ ] Share with team/users

---

## URLs to Save

Fill these in after deployment:

- **MongoDB Atlas Dashboard:** https://cloud.mongodb.com/
- **Render Dashboard:** https://dashboard.render.com/
- **Backend Service:** `https://YOUR-BACKEND.onrender.com`
- **Frontend Site:** `https://YOUR-FRONTEND.onrender.com`
- **API Health Check:** `https://YOUR-BACKEND.onrender.com/api/health`

---

## Support Resources

- **Deployment Guide:** See DEPLOYMENT_SETUP_GUIDE.md
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Render Docs:** https://render.com/docs
- **API Documentation:** See API_DOCUMENTATION.md

---

## Rollback Plan

If deployment fails:

1. Keep local version running
2. Check Render logs for errors
3. Verify environment variables
4. Test MongoDB connection separately
5. Redeploy after fixing issues

**Remember:** Free tier services sleep after 15 minutes of inactivity. First request may take 30-60 seconds to wake up!
