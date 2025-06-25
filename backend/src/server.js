import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import healthRoutes from './routes/health.js';
import articlesRoutes from './routes/articles.js';
import categoriesRoutes from './routes/categories.js';
import statesRoutes from './routes/states.js';
import videosRoutes from './routes/videos.js';
import liveStreamsRoutes from './routes/live-streams.js';
import newsletterRoutes from './routes/newsletter.js';
import aboutRoutes from './routes/about.js';
import supportRoutes from './routes/support.js';
import socialsRoutes from './routes/socials.js';
import analyticsRoutes from './routes/analytics.js';
import adsRoutes from './routes/ads.js';
import profilesRoutes from './routes/profiles.js';
import teamMembersRoutes from './routes/team-members.js';

// Import database config
import { testConnection } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/states', statesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/live-streams', liveStreamsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/socials', socialsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/team-members', teamMembersRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Voice of Bharat API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      articles: '/api/articles',
      'articles-breaking': '/api/articles/breaking',
      'articles-featured': '/api/articles/featured',
      categories: '/api/categories',
      states: '/api/states',
      videos: '/api/videos',
      'live-streams': '/api/live-streams',
      'live-streams-active': '/api/live-streams/active',
      newsletter: '/api/newsletter',
      about: '/api/about',
      support: '/api/support',
      socials: '/api/socials',
      analytics: '/api/analytics',
      ads: '/api/ads',
      profiles: '/api/profiles',
      'team-members': '/api/team-members',
      'health-db': '/api/health/db',
      'health-env': '/api/health/env'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your environment variables.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📰 Articles API: http://localhost:${PORT}/api/articles`);
      console.log(`📂 Categories API: http://localhost:${PORT}/api/categories`);
      console.log(`🗺️ States API: http://localhost:${PORT}/api/states`);
      console.log(`🎥 Videos API: http://localhost:${PORT}/api/videos`);
      console.log(`📺 Live Streams API: http://localhost:${PORT}/api/live-streams`);
      console.log(`📧 Newsletter API: http://localhost:${PORT}/api/newsletter`);
      console.log(`ℹ️ About API: http://localhost:${PORT}/api/about`);
      console.log(`💝 Support API: http://localhost:${PORT}/api/support`);
      console.log(`🔗 Socials API: http://localhost:${PORT}/api/socials`);
      console.log(`📈 Analytics API: http://localhost:${PORT}/api/analytics`);
      console.log(`📢 Ads API: http://localhost:${PORT}/api/ads`);
      console.log(`👥 Profiles API: http://localhost:${PORT}/api/profiles`);
      console.log(`👨‍👩‍👧‍👦 Team Members API: http://localhost:${PORT}/api/team-members`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer(); 