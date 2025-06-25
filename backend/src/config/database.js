import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Direct PostgreSQL connection (alternative) - only if explicitly configured
let pool = null;

if (process.env.DATABASE_URL && process.env.USE_DIRECT_DB === 'true') {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  } catch (error) {
    console.warn('⚠️ Direct PostgreSQL pool creation failed:', error.message);
  }
}

export const db = pool;

// Test database connection
export const testConnection = async () => {
  try {
    // Always test Supabase connection first
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Only test direct PostgreSQL if explicitly enabled and pool exists
    if (pool && process.env.USE_DIRECT_DB === 'true') {
      console.log('🔍 Testing direct PostgreSQL connection...');
      try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Direct PostgreSQL connection successful');
      } catch (pgError) {
        console.warn('⚠️ Direct PostgreSQL connection failed:', pgError.message);
        console.log('ℹ️ Continuing with Supabase connection only');
      }
    } else {
      console.log('ℹ️ Direct PostgreSQL not configured, using Supabase only');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: 'connected',
      postgres: pool && process.env.USE_DIRECT_DB === 'true' ? 'available' : 'not_configured'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}; 