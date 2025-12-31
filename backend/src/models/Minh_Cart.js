const { sql } = require('../config/database');

class Cart {
  /**
   * Get user's cart with items
   */
  static async getByUserId(userId) {
    try {
      const pool = await require('../config/database').getPool();
      
      // Get or create cart
      let cartResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM Carts WHERE user_id = @userId');
      
      let cart = cartResult.recordset[0];

      if (!cart) {
        try {
          // Create new cart
          const newCartResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('INSERT INTO Carts (user_id) OUTPUT INSERTED.* VALUES (@userId)');
          cart = newCartResult.recordset[0];
        } catch (insertError) {
          // If insert fails due to unique constraint (race condition), try selecting again
          if (insertError.number === 2627 || insertError.number === 2601) {
             cartResult = await pool.request()
              .input('userId', sql.Int, userId)
              .query('SELECT * FROM Carts WHERE user_id = @userId');
             cart = cartResult.recordset[0];
          } else {
            throw insertError;
          }
        }
      }
      
      if (!cart) {
         throw new Error('Could not retrieve or create cart');
      }

      const cartId = cart.id;
      
      // Get cart items with product details
      const itemsResult = await pool.request()
        .input('cartId', sql.Int, cartId)
        .query(`
          SELECT ci.product_id as productId, ci.quantity, ci.price,
                 p.name, p.price as original_price, p.discount_percent, p.images as image_url, p.stock as stock_quantity,
                 (p.price * (100 - p.discount_percent) / 100) as discounted_price,
                 (ci.quantity * p.price * (100 - p.discount_percent) / 100) as subtotal
          FROM CartItems ci
          INNER JOIN Products p ON ci.product_id = p.id
          WHERE ci.cart_id = @cartId AND p.status = 'active'
        `);
      
      const items = itemsResult.recordset;

      // Calculate total
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      
      return {
        cart: cart,
        items: items,
        total,
        itemCount: items.length
      };
    } catch (error) {
      throw new Error(`Error getting cart: ${error.message}`);
    }
  }

  /**
   * Add item to cart
   */
  static async addItem(userId, productId, quantity = 1) {
    try {
      const pool = await require('../config/database').getPool();
      
      // Get or create cart
      let cartResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT id FROM Carts WHERE user_id = @userId');
      
      let cartId;
      if (cartResult.recordset.length === 0) {
        try {
          const newCart = await pool.request()
            .input('userId', sql.Int, userId)
            .query('INSERT INTO Carts (user_id) OUTPUT INSERTED.id VALUES (@userId)');
          cartId = newCart.recordset[0].id;
        } catch (insertError) {
           // Handle race condition
           if (insertError.number === 2627 || insertError.number === 2601) {
             cartResult = await pool.request()
              .input('userId', sql.Int, userId)
              .query('SELECT id FROM Carts WHERE user_id = @userId');
             cartId = cartResult.recordset[0].id;
           } else {
             throw insertError;
           }
        }
      } else {
        cartId = cartResult.recordset[0].id;
      }
      
      // Get product details for price
      const productResult = await pool.request()
        .input('productId', sql.Int, productId)
        .query('SELECT price, discount_percent FROM Products WHERE id = @productId');

      if (productResult.recordset.length === 0) {
        throw new Error('Product not found');
      }
      const product = productResult.recordset[0];
      const finalPrice = product.price * (1 - (product.discount_percent || 0) / 100);

      // Check if item already exists
      const existingItemResult = await pool.request()
        .input('cartId', sql.Int, cartId)
        .input('productId', sql.Int, productId)
        .query('SELECT * FROM CartItems WHERE cart_id = @cartId AND product_id = @productId');
      
      const existingItem = existingItemResult.recordset[0];

      if (existingItem) {
        // Update quantity
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .input('productId', sql.Int, productId)
          .input('quantity', sql.Int, quantity)
          .query(`
            UPDATE CartItems 
            SET quantity = quantity + @quantity, updated_at = GETDATE()
            WHERE cart_id = @cartId AND product_id = @productId
          `);
      } else {
        // Add new item
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .input('productId', sql.Int, productId)
          .input('quantity', sql.Int, quantity)
          .input('price', sql.Decimal(18, 2), finalPrice)
          .query('INSERT INTO CartItems (cart_id, product_id, quantity, price) VALUES (@cartId, @productId, @quantity, @price)');
      }
      
      // Update cart updated_at
      await pool.request()
        .input('cartId', sql.Int, cartId)
        .query('UPDATE Carts SET updated_at = GETDATE() WHERE id = @cartId');
      
      return await this.getByUserId(userId);
    } catch (error) {
      throw new Error(`Error adding item to cart: ${error.message}`);
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateItemQuantity(userId, productId, quantity) {
    try {
      const pool = await require('../config/database').getPool();
      
      const cartResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT id FROM Carts WHERE user_id = @userId');
      
      if (!cartResult.recordset[0]) {
        throw new Error('Cart not found');
      }
      
      const cartId = cartResult.recordset[0].id;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .input('productId', sql.Int, productId)
          .query('DELETE FROM CartItems WHERE cart_id = @cartId AND product_id = @productId');
      } else {
        // Update quantity
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .input('productId', sql.Int, productId)
          .input('quantity', sql.Int, quantity)
          .query(`
            UPDATE CartItems 
            SET quantity = @quantity, updated_at = GETDATE()
            WHERE cart_id = @cartId AND product_id = @productId
          `);
      }
      
      return await this.getByUserId(userId);
    } catch (error) {
      throw new Error(`Error updating cart item: ${error.message}`);
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId, productId) {
    try {
      const pool = await require('../config/database').getPool();
      
      const cartResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT id FROM Carts WHERE user_id = @userId');
      
      if (!cartResult.recordset[0]) {
        throw new Error('Cart not found');
      }
      
      const cartId = cartResult.recordset[0].id;
      
      await pool.request()
        .input('cartId', sql.Int, cartId)
        .input('productId', sql.Int, productId)
        .query('DELETE FROM CartItems WHERE cart_id = @cartId AND product_id = @productId');
      
      return await this.getByUserId(userId);
    } catch (error) {
      throw new Error(`Error removing item from cart: ${error.message}`);
    }
  }

  /**
   * Clear cart
   */
  static async clear(userId) {
    try {
      const pool = await require('../config/database').getPool();
      
      const cartResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT id FROM Carts WHERE user_id = @userId');
      
      if (cartResult.recordset[0]) {
        await pool.request()
          .input('cartId', sql.Int, cartResult.recordset[0].id)
          .query('DELETE FROM CartItems WHERE cart_id = @cartId');
      }
      
      return { message: 'Cart cleared successfully' };
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }
}

module.exports = Cart;
