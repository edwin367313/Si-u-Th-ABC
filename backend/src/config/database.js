const sql = require('mssql');
require('dotenv').config();

// SQL Server configuration
const config = {
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'SieuThiABC',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
    instanceName: process.env.DB_INSTANCE || undefined
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Connection pool
let pool = null;

/**
 * Get database connection pool
 */
const getPool = async () => {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('✅ Connected to SQL Server successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      throw error;
    }
  }
  return pool;
};

/**
 * Close database connection
 */
const closePool = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('🔌 Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

/**
 * Execute query with parameters
 */
const query = async (queryString, params = {}) => {
  try {
    const poolConnection = await getPool();
    const request = poolConnection.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(queryString);
    return result.recordset;
  } catch (error) {
    console.error('❌ Query execution error:', error.message);
    throw error;
  }
};

/**
 * Execute stored procedure
 */
const executeProcedure = async (procedureName, params = {}) => {
  try {
    const poolConnection = await getPool();
    const request = poolConnection.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error('❌ Stored procedure execution error:', error.message);
    throw error;
  }
};

module.exports = {
  config,
  sql,
  getPool,
  closePool,
  query,
  executeProcedure
};
