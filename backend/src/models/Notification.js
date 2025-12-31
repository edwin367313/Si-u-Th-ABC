const { sql } = require('../config/database');

class Notification {
  static async create(data) {
    try {
      const { userId, title, message, type, referenceId } = data;
      const pool = await require('../config/database').getPool();
      
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('title', sql.NVarChar, title)
        .input('message', sql.NVarChar, message)
        .input('type', sql.NVarChar, type)
        .input('referenceId', sql.Int, referenceId)
        .query(`
          INSERT INTO Notifications (user_id, title, message, type, reference_id)
          VALUES (@userId, @title, @message, @type, @referenceId)
        `);
        
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getForAdmin(limit = 20, offset = 0) {
    try {
      const pool = await require('../config/database').getPool();
      
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(`
          SELECT * FROM Notifications 
          WHERE user_id IS NULL 
          ORDER BY created_at DESC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
        
      const count = await pool.request()
        .query('SELECT COUNT(*) as total FROM Notifications WHERE user_id IS NULL');
        
      return {
        notifications: result.recordset,
        total: count.recordset[0].total
      };
    } catch (error) {
      throw error;
    }
  }

  static async markAsRead(id) {
    try {
      const pool = await require('../config/database').getPool();
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE Notifications SET is_read = 1 WHERE id = @id');
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async markAllAsRead() {
      try {
        const pool = await require('../config/database').getPool();
        await pool.request()
          .query('UPDATE Notifications SET is_read = 1 WHERE user_id IS NULL');
        return true;
      } catch (error) {
        throw error;
      }
    }
}

module.exports = Notification;
