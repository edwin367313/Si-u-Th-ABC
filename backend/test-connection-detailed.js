const { getPool, closePool } = require('./src/config/database');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Starting Detailed Connection Test...');
  console.log('----------------------------------------');
  console.log('Environment Variables:');
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`DB_PORT: ${process.env.DB_PORT}`);
  console.log(`DB_INSTANCE: ${process.env.DB_INSTANCE}`);
  console.log('----------------------------------------');

  try {
    console.log('⏳ Attempting to connect via getPool()...');
    const pool = await getPool();
    console.log('✅ Connection SUCCESSFUL!');
    
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('📊 SQL Server Version:', result.recordset[0].version);
    
    await closePool();
    console.log('👋 Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection FAILED.');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    if (error.originalError) {
        console.error('Original Error:', error.originalError.message);
    }
    console.log('----------------------------------------');
    console.log('💡 Troubleshooting Tips:');
    console.log('1. Check if SQL Server is running.');
    console.log('2. Check if TCP/IP is enabled in SQL Server Configuration Manager.');
    console.log('3. Check if the port (1433) is correct and not blocked by firewall.');
    console.log('4. Check if the user/password are correct.');
    process.exit(1);
  }
}

testConnection();
