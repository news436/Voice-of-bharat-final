# Voice of Bharat Backend API

A Node.js/Express backend API for the Voice of Bharat news platform, designed to work with Supabase PostgreSQL.

## Features

- ✅ **Supabase Integration**: Direct connection to your existing Supabase database
- ✅ **RESTful API**: Clean, documented endpoints for articles and content
- ✅ **Security**: Helmet, CORS, rate limiting, and input validation
- ✅ **Health Checks**: Database connectivity and API health monitoring
- ✅ **Production Ready**: Optimized for deployment on Render

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

4. **Test the API**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Deploy to Render

1. **Push your code to GitHub** (including the backend folder)

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure the service**:
   - **Name**: `voice-of-bharat-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=*
   ```

5. **Deploy**: Click "Create Web Service"

## API Endpoints

### Health Checks
- `GET /api/health` - API health status
- `GET /api/health/db` - Database connection test
- `GET /api/health/env` - Environment info (debugging)

### Articles
- `GET /api/articles` - Get all published articles
- `GET /api/articles/:slug` - Get article by slug
- `GET /api/articles/:slug/related` - Get related articles
- `GET /api/articles/search?q=query` - Search articles

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category slug
- `state` - Filter by state slug

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | development |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | - |
| `DATABASE_URL` | Direct PostgreSQL URL (optional) | No | - |
| `JWT_SECRET` | JWT secret for authentication | No | auto-generated |
| `CORS_ORIGIN` | CORS allowed origins | No | * |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

## Database Connection

The backend supports two connection methods:

### 1. Supabase (Recommended)
Uses your existing Supabase setup:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Direct PostgreSQL (Alternative)
Direct connection to Supabase PostgreSQL:
```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?sslmode=require
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Request validation
- **SSL**: Secure database connections
- **Environment Variables**: Secure credential management

## Monitoring

### Health Check Endpoints
```bash
# API Health
curl https://your-app.onrender.com/api/health

# Database Connection
curl https://your-app.onrender.com/api/health/db

# Environment Info
curl https://your-app.onrender.com/api/health/env
```

### Expected Responses

**Healthy API**:
```json
{
  "success": true,
  "message": "API is healthy",
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "supabase": "connected",
  "postgres": "available"
}
```

**Database Connected**:
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase credentials
   - Verify network connectivity
   - Ensure SSL is enabled

2. **CORS Errors**
   - Update `CORS_ORIGIN` environment variable
   - Check frontend domain configuration

3. **Rate Limiting**
   - Increase `RATE_LIMIT_MAX_REQUESTS` if needed
   - Monitor usage patterns

### Logs
Check Render logs for detailed error information:
- Render Dashboard → Your Service → Logs

## Development

### Adding New Routes
1. Create route file in `src/routes/`
2. Import in `src/server.js`
3. Add middleware as needed

### Testing
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test articles endpoint
curl http://localhost:3000/api/articles

# Test specific article
curl http://localhost:3000/api/articles/your-article-slug
```

## Support

For issues or questions:
1. Check the logs in Render dashboard
2. Test health endpoints
3. Verify environment variables
4. Check Supabase dashboard for database issues 