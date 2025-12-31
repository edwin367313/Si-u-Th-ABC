const { sql } = require('../config/database');

class User {
  /**
   * Find user by ID
   */
  static async findById(userId) {
    try {
      const pool = await require('../config/database').getPool();
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT id, username, email, full_name, phone, role, avatar_url, is_active, created_at FROM Users WHERE id = @userId');
      
      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const pool = await require('../config/database').getPool();
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE email = @email');
      
      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    try {
      const pool = await require('../config/database').getPool();
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query('SELECT * FROM Users WHERE username = @username');
      
      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  /**
   * Create new user
   */
  static async create(userData) {
    try {
      const { username, email, password, full_name, phone, role = 'user' } = userData;
      
      const pool = await require('../config/database').getPool();
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, password)
        .input('full_name', sql.NVarChar, full_name)
        .input('phone', sql.NVarChar, phone)
        .input('role', sql.NVarChar, role)
        .query(`
          INSERT INTO Users (username, email, password_hash, full_name, phone, role, is_active)
          OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.role, INSERTED.created_at
          VALUES (@username, @email, @password, @full_name, @phone, @role, 1)
        `);
      
      return result[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Update user
   */
  static async update(userId, updateData) {
    try {
      const { full_name, phone, avatar_url } = updateData;
      
      const pool = await require('../config/database').getPool();
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('full_name', sql.NVarChar, full_name)
        .input('phone', sql.NVarChar, phone)
        .input('avatar_url', sql.NVarChar, avatar_url)
        .query(`
          UPDATE Users 
          SET full_name = COALESCE(@full_name, full_name),
              phone = COALESCE(@phone, phone),
              avatar_url = COALESCE(@avatar_url, avatar_url),
              updated_at = GETDATE()
          OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.phone, INSERTED.role
          WHERE id = @userId
        `);
      
      return result[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async delete(userId) {
    try {
      const pool = await require('../config/database').getPool();
      await pool.request()
        .input('userId', sql.Int, userId)
        .query('UPDATE Users SET is_active = 0, updated_at = GETDATE() WHERE id = @userId');
      
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAll(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const pool = await require('../config/database').getPool();
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(`
          SELECT id, username, email, full_name, phone, role, avatar_url, is_active, created_at
          FROM Users
          WHERE is_active = 1
          ORDER BY created_at DESC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .query('SELECT COUNT(*) as total FROM Users WHERE is_active = 1');
      
      return {
        users: result,
        total: countResult[0].total,
        page,
        totalPages: Math.ceil(countResult[0].total / limit)
      };
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }
}

module.exports = User;
