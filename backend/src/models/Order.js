const { sql } = require('../config/database');

class Order {
  /**
   * Create new order from cart
   */
  static async create(userId, orderData) {
    try {
      const {
        shippingName,
        shippingAddress,
        shippingPhone,
        paymentMethod,
        voucherCode,
        note
      } = orderData;
      
      // Validate required fields
      if (!userId) throw new Error('User ID is missing');
      if (!shippingName) throw new Error('Shipping Name is missing');
      if (!shippingPhone) throw new Error('Shipping Phone is missing');
      if (!shippingAddress) throw new Error('Shipping Address is missing');

      const pool = await require('../config/database').getPool();
      const transaction = new sql.Transaction(pool);
      
      await transaction.begin();
      
      try {
        // Get cart items
        let request = new sql.Request(transaction);
        const cartResult = await request
          .input('userId', sql.Int, userId)
          .query('SELECT id FROM Carts WHERE user_id = @userId');
        
        if (!cartResult.recordset[0]) {
          throw new Error('Cart not found');
        }
        
        const cartId = cartResult.recordset[0].id;
        
        request = new sql.Request(transaction);
        const cartItemsResult = await request
          .input('cartId', sql.Int, cartId)
          .query(`
            SELECT ci.product_id, ci.quantity, p.price as product_price, p.discount_percent, p.name, p.stock as stock_quantity
            FROM CartItems ci
            INNER JOIN Products p ON ci.product_id = p.id
            WHERE ci.cart_id = @cartId AND p.status = 'active'
          `);
        
        const cartItems = cartItemsResult.recordset;
        
        if (cartItems.length === 0) {
          console.error(`[Order.create] Cart is empty for userId: ${userId}, cartId: ${cartId}`);
          throw new Error('Cart is empty');
        }
        
        // Calculate total
        let total = 0;
        console.log('Cart Items:', JSON.stringify(cartItems));
        for (const item of cartItems) {
          // Check stock
          if (item.stock_quantity < item.quantity) {
            throw new Error(`Sản phẩm ${item.name} không đủ hàng`);
          }
          
          const price = Number(item.product_price);
          const discountPercent = Number(item.discount_percent) || 0;
          const quantity = Number(item.quantity);

          if (isNaN(price)) throw new Error(`Invalid price for product ${item.product_id}: ${item.product_price}`);
          if (isNaN(quantity)) throw new Error(`Invalid quantity for product ${item.product_id}`);

          const discountedPrice = price * (100 - discountPercent) / 100;
          total += discountedPrice * quantity;
        }
        
        console.log('Calculated Total:', total);

        // Apply voucher if provided
        let discount_amount = 0;
        let voucher_id = null;
        if (voucherCode) {
          request = new sql.Request(transaction);
          const voucherResult = await request
            .input('code', sql.NVarChar, voucherCode)
            .query(`
              SELECT * FROM Vouchers 
              WHERE code = @code 
              AND status = 'active' 
              AND start_date <= GETDATE() 
              AND end_date >= GETDATE()
              AND (usage_limit IS NULL OR usage_limit > 0)
            `);
          
          const voucher = voucherResult.recordset[0];
          
          if (voucher) {
            voucher_id = voucher.id;
            const discountValue = Number(voucher.discount_value) || 0;
            
            if (voucher.discount_type === 'percent') {
                discount_amount = total * discountValue / 100;
            } else {
                discount_amount = discountValue;
            }
            
            const maxDiscount = Number(voucher.max_discount_amount) || 0;
            if (maxDiscount > 0 && discount_amount > maxDiscount) {
              discount_amount = maxDiscount;
            }
            
            if (voucher.usage_limit) {
                 request = new sql.Request(transaction);
                 await request
                  .input('voucherId', sql.Int, voucher_id)
                  .query('UPDATE Vouchers SET usage_limit = usage_limit - 1 WHERE id = @voucherId');
            }
          }
        }
        
        const final_total = total - discount_amount;
        
        console.log('Final Total Check:', { total, discount_amount, final_total });

        // Ensure final_total is a valid number
        const safe_total = isNaN(final_total) ? 0 : Math.max(0, final_total);

        if (isNaN(safe_total)) throw new Error(`Total Amount is invalid: ${final_total} (Total: ${total}, Discount: ${discount_amount})`);

        // Create order
        request = new sql.Request(transaction);
        const orderResult = await request
          .input('userId', sql.Int, userId)
          .input('fullName', sql.NVarChar(100), shippingName)
          .input('phone', sql.NVarChar(20), shippingPhone)
          .input('address', sql.NVarChar(255), shippingAddress)
          .input('totalAmount', sql.Decimal(18, 2), safe_total)
          .input('status', sql.NVarChar(20), 'pending')
          .input('paymentMethod', sql.NVarChar(50), paymentMethod || 'COD')
          .input('note', sql.NVarChar(500), note || '')
          .query(`
            INSERT INTO Orders (user_id, full_name, phone, address, total_amount, status, payment_method, note)
            OUTPUT INSERTED.*
            VALUES (@userId, @fullName, @phone, @address, @totalAmount, @status, @paymentMethod, @note)
          `);
        
        const orderId = orderResult.recordset[0].id;
        
        // Create order items and update stock
        for (const item of cartItems) {
          const price = Number(item.product_price);
          let discountedPrice = price * (100 - (item.discount_percent || 0)) / 100;
          
          // Ensure discountedPrice is a valid number
          if (isNaN(discountedPrice) || discountedPrice === null || discountedPrice === undefined) {
             discountedPrice = 0;
          }
          
          const totalPrice = discountedPrice * item.quantity;

          request = new sql.Request(transaction);
          await request
            .input('orderId', sql.Int, orderId)
            .input('productId', sql.Int, item.product_id)
            .input('quantity', sql.Int, item.quantity)
            .input('price', sql.Decimal(18, 2), discountedPrice)
            .input('totalPrice', sql.Decimal(18, 2), totalPrice)
            .query(`
              INSERT INTO OrderItems (order_id, product_id, quantity, price, total_price)
              VALUES (@orderId, @productId, @quantity, @price, @totalPrice)
            `);
          
          // Update product stock
          request = new sql.Request(transaction);
          await request
            .input('productId', sql.Int, item.product_id)
            .input('quantity', sql.Int, item.quantity)
            .query('UPDATE Products SET stock = stock - @quantity WHERE id = @productId');
        }
        
        // Clear cart
        request = new sql.Request(transaction);
        await request
          .input('cartId', sql.Int, cartId)
          .query('DELETE FROM CartItems WHERE cart_id = @cartId');
        
        await transaction.commit();
        
        return await this.findById(orderId);
      } catch (error) {
        await transaction.rollback();
        console.error("Transaction Error in Order.create:", error);
        throw error;
      }
    } catch (error) {
      console.error("Order.create Top Level Error:", error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  /**
   * Find order by ID
   */
  static async findById(orderId) {
    try {
      const pool = await require('../config/database').getPool();
      
      const orderResult = await pool.request()
        .input('orderId', sql.Int, orderId)
        .query('SELECT * FROM Orders WHERE id = @orderId');
      
      if (!orderResult.recordset[0]) {
        return null;
      }
      
      const itemsResult = await pool.request()
        .input('orderId', sql.Int, orderId)
        .query(`
          SELECT oi.*, p.name, p.images
          FROM OrderItems oi
          INNER JOIN Products p ON oi.product_id = p.id
          WHERE oi.order_id = @orderId
        `);
      
      return {
        ...orderResult.recordset[0],
        items: itemsResult.recordset
      };
    } catch (error) {
      throw new Error(`Error finding order: ${error.message}`);
    }
  }

  /**
   * Get user orders
   */
  static async getUserOrders(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const pool = await require('../config/database').getPool();
      
      const ordersResult = await pool.request()
        .input('userId', sql.Int, userId)
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(`
          SELECT * FROM Orders 
          WHERE user_id = @userId 
          ORDER BY created_at DESC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
      
      const countResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT COUNT(*) as total FROM Orders WHERE user_id = @userId');
      
      return {
        orders: ordersResult.recordset,
        total: countResult.recordset[0].total,
        page,
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      };
    } catch (error) {
      throw new Error(`Error getting user orders: ${error.message}`);
    }
  }

  /**
   * Update order status (Admin only)
   */
  static async updateStatus(orderId, status) {
    try {
      const pool = await require('../config/database').getPool();
      
      const result = await pool.request()
        .input('orderId', sql.Int, orderId)
        .input('status', sql.NVarChar, status)
        .query(`
          UPDATE Orders 
          SET status = @status, updated_at = GETDATE()
          WHERE id = @orderId;
          
          SELECT * FROM Orders WHERE id = @orderId;
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  /**
   * Get all orders (Admin only)
   */
  static async getAll(filters = {}) {
    try {
      const { page = 1, limit = 20, status } = filters;
      const offset = (page - 1) * limit;
      const pool = await require('../config/database').getPool();
      
      let query = 'SELECT o.*, u.username, u.email FROM Orders o LEFT JOIN Users u ON o.user_id = u.id WHERE 1=1';
      const request = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);
      
      if (status) {
        query += ' AND o.status = @status';
        request.input('status', sql.NVarChar, status);
      }
      
      query += ' ORDER BY o.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
      
      const ordersResult = await request.query(query);
      
      let countQuery = 'SELECT COUNT(*) as total FROM Orders WHERE 1=1';
      const countRequest = pool.request();
      
      if (status) {
        countQuery += ' AND status = @status';
        countRequest.input('status', sql.NVarChar, status);
      }
      
      const countResult = await countRequest.query(countQuery);
      
      return {
        orders: ordersResult.recordset,
        total: countResult.recordset[0].total,
        page,
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      };
    } catch (error) {
      throw new Error(`Error getting orders: ${error.message}`);
    }
  }
}

module.exports = Order;
