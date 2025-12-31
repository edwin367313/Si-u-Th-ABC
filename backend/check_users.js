const { getPool, closePool, sql } = require('./src/config/database');

async function checkUsers() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, username, role, is_active FROM Users WHERE username = \'admin\'');
    console.log(result.recordset);
    await closePool();
  } catch (error) {
    console.error(error);
  }
}

checkUsers();