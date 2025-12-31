const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_HOST || 'EDWIN',
  database: process.env.DB_NAME || 'MultidimensionalProject4',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

async function testConnection() {
  console.log('🔄 Testing SQL Server connection...');
  console.log('📋 Configuration:');
  console.log('   Server:', config.server);
  console.log('   Database:', config.database);
  console.log('   User:', config.user);
  console.log('   Port:', config.port);
  console.log('');

  try {
    // Test connection
    const pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server successfully!');
    console.log('');

    // Test query - Get tables
    console.log('📊 Testing query - Getting table list...');
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('✅ Found', result.recordset.length, 'tables:');
    result.recordset.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.TABLE_NAME}`);
    });
    console.log('');

    // Test specific tables from the project
    const projectTables = ['Users', 'Products', 'Categories', 'Orders', 'Carts', 'Payments', 'Themes', 'Vouchers'];
    console.log('🔍 Checking project tables...');
    
    for (const tableName of projectTables) {
      const checkResult = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = '${tableName}'
      `);
      
      if (checkResult.recordset[0].count > 0) {
        const countResult = await pool.request().query(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`   ✅ ${tableName} (${countResult.recordset[0].total} rows)`);
      } else {
        console.log(`   ⚠️  ${tableName} (not found)`);
      }
    }

    // Close connection
    await pool.close();
    console.log('');
    console.log('✅ Connection test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('Please check:');
    console.error('   1. SQL Server is running');
    console.error('   2. Server name is correct (EDWIN)');
    console.error('   3. Database name is correct (MultidimensionalProject4)');
    console.error('   4. Username and password are correct');
    console.error('   5. SQL Server allows TCP/IP connections');
    process.exit(1);
  }
}

testConnection();
