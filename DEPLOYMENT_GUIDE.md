# 🚀 Deployment Guide: Voice of Bharat Backend to Render

This guide will help you deploy your Node.js backend to Render using Supabase PostgreSQL as your database.

## 📋 Prerequisites

- ✅ GitHub repository with your code
- ✅ Supabase project with PostgreSQL database
- ✅ Render account (free tier available)

## 🔧 Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Copy these values**:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🌐 Step 2: Deploy to Render

### 2.1 Connect to Render

1. **Go to Render**: https://render.com
2. **Sign up/Login** with your GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repository**

### 2.2 Configure the Service

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `voice-of-bharat-api` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### 2.3 Set Environment Variables

Click **"Environment"** and add these variables:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_random_secret_key_here
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
USE_DIRECT_DB=false
```

**Important Notes:**
- **Supabase credentials are REQUIRED** - Get these from your Supabase dashboard
- **DATABASE_URL is OPTIONAL** - Only needed if you want direct PostgreSQL access
- **USE_DIRECT_DB=false** - Set to true only if you want to use direct PostgreSQL connection

### 2.4 Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Copy your service URL** (e.g., `https://voice-of-bharat-api.onrender.com`)

## 🧪 Step 3: Test Your Deployment

### 3.1 Health Check

Test if your API is running:

```bash
curl https://your-app.onrender.com/api/health
```

**Expected Response**:
```json
{
  "success": true,
  "message": "API is healthy",
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "supabase": "connected",
  "postgres": "not_configured"
}
```

### 3.2 Database Connection Test

Test database connectivity:

```bash
curl https://your-app.onrender.com/api/health/db
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### 3.3 Test Articles API

Test your articles endpoint:

```bash
curl https://your-app.onrender.com/api/articles
```

**Expected Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## 🔒 Step 4: Security Verification

### 4.1 SSL Connection

Your database connection should use SSL. Check the logs in Render dashboard:

1. **Go to your service in Render**
2. **Click "Logs"**
3. **Look for**: `✅ Supabase connection successful`

### 4.2 Environment Variables

Verify your environment variables are set correctly:

```bash
curl https://your-app.onrender.com/api/health/env
```

**Expected Response**:
```json
{
  "success": true,
  "nodeEnv": "production",
  "port": "10000",
  "hasSupabaseUrl": true,
  "hasSupabaseKey": true,
  "hasDatabaseUrl": false,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🔄 Step 5: Auto-Deploy Setup

### 5.1 Enable Auto-Deploy

1. **In Render dashboard**, go to your service
2. **Click "Settings"**
3. **Under "Build & Deploy"**, ensure:
   - ✅ **Auto-Deploy** is enabled
   - ✅ **Branch** is set to `master` (or your main branch)

### 5.2 Test Auto-Deploy

1. **Make a small change** to your backend code
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "test: auto-deploy"
   git push origin master
   ```
3. **Check Render dashboard** - you should see a new deployment starting

## 📊 Step 6: Monitoring

### 6.1 Health Monitoring

Set up health checks:

1. **In Render dashboard**, go to your service
2. **Click "Settings"**
3. **Under "Health Check Path"**, enter: `/api/health`
4. **Save changes**

### 6.2 Logs

Monitor your application logs:

1. **Go to your service in Render**
2. **Click "Logs"**
3. **Look for**:
   - ✅ `🚀 Server running on port 10000`
   - ✅ `✅ Supabase connection successful`
   - ❌ Any error messages

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptoms**: Health check returns `"status": "unhealthy"`

**Solutions**:
- ✅ Check Supabase credentials in environment variables
- ✅ Verify Supabase project is active
- ✅ Ensure service role key has proper permissions
- ✅ Remove DATABASE_URL if you're not using direct PostgreSQL

#### 2. CORS Errors

**Symptoms**: Frontend can't connect to API

**Solutions**:
- ✅ Set `CORS_ORIGIN` to your frontend domain
- ✅ Or use `CORS_ORIGIN=*` for development

#### 3. Build Failures

**Symptoms**: Deployment fails during build

**Solutions**:
- ✅ Check `package.json` has correct scripts
- ✅ Verify all dependencies are listed
- ✅ Check Node.js version compatibility

#### 4. Environment Variables Not Set

**Symptoms**: API returns configuration errors

**Solutions**:
- ✅ Double-check all environment variables in Render
- ✅ Ensure no typos in variable names
- ✅ Restart the service after adding variables

### Debug Commands

```bash
# Test API health
curl https://your-app.onrender.com/api/health

# Test database connection
curl https://your-app.onrender.com/api/health/db

# Check environment
curl https://your-app.onrender.com/api/health/env

# Test articles endpoint
curl https://your-app.onrender.com/api/articles

# Test specific article
curl https://your-app.onrender.com/api/articles/your-article-slug
```

## 📈 Performance Optimization

### 1. Enable Compression

Already configured in the backend with `compression` middleware.

### 2. Rate Limiting

Configured to 100 requests per 15 minutes per IP. Adjust if needed:

```env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=900000
```

### 3. Caching

Consider adding Redis for caching if needed.

## 🔗 Integration with Frontend

### Update Frontend API Base URL

In your frontend, update the API base URL:

```javascript
// src/integrations/api/client.js
const API_BASE_URL = 'https://your-app.onrender.com/api';

export const apiClient = {
  baseURL: API_BASE_URL,
  // ... rest of your API client config
};
```

### Test Integration

1. **Update your frontend** to use the new API
2. **Test all features** that use the backend
3. **Monitor for errors** in browser console

## ✅ Success Checklist

- [ ] Backend deployed to Render
- [ ] Health check returns `"status": "healthy"`
- [ ] Database connection successful
- [ ] Articles API working
- [ ] Environment variables configured
- [ ] Auto-deploy enabled
- [ ] SSL connection verified
- [ ] Frontend integration tested
- [ ] Monitoring set up

## 🆘 Support

If you encounter issues:

1. **Check Render logs** for detailed error messages
2. **Test health endpoints** to isolate the problem
3. **Verify environment variables** are set correctly
4. **Check Supabase dashboard** for database issues
5. **Review this guide** for common solutions

Your backend should now be successfully deployed and connected to Supabase! 🎉