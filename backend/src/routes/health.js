import express from 'express';
import { healthCheck, testConnection } from '../config/database.js';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = await healthCheck();
    
    if (health.status === 'healthy') {
      res.json({
        success: true,
        message: 'API is healthy',
        ...health
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'API is unhealthy',
        ...health
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Database connection test
router.get('/db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Environment info (for debugging)
router.get('/env', (req, res) => {
  res.json({
    success: true,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString()
  });
});

export default router; 