const { sql } = require('./src/config/database');

async function createNotificationsTable() {
  try {
    const pool = await require('./src/config/database').getPool();
    
    console.log('Creating Notifications table...');
    
    await pool.request().query(`
      IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.Notifications (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NULL, -- NULL means for all Admins
            title NVARCHAR(200) NOT NULL,
            message NVARCHAR(MAX) NOT NULL,
            type NVARCHAR(50) DEFAULT 'info',
            reference_id INT NULL,
            is_read BIT DEFAULT 0,
            created_at DATETIME DEFAULT GETDATE()
        );
        PRINT 'Notifications table created successfully.';
      END
      ELSE
      BEGIN
        PRINT 'Notifications table already exists.';
      END
    `);

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

createNotificationsTable();
