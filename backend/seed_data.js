const { getPool, closePool, sql } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    const pool = await getPool();
    console.log('✅ Connected to database');

    // 1. Seed Categories
    console.log('🌱 Seeding Categories...');
    const categories = [
      { name: 'Rau củ quả', description: 'Rau củ quả tươi sạch', image: '/uploads/categories/vegetables.jpg' },
      { name: 'Thịt trứng', description: 'Thịt tươi, trứng gà, vịt', image: '/uploads/categories/meat.jpg' },
      { name: 'Hải sản', description: 'Cá, tôm, mực tươi sống', image: '/uploads/categories/seafood.jpg' },
      { name: 'Đồ uống', description: 'Nước ngọt, bia, rượu', image: '/uploads/categories/drinks.jpg' },
      { name: 'Bánh kẹo', description: 'Bánh kẹo các loại', image: '/uploads/categories/snacks.jpg' }
    ];

    for (const cat of categories) {
      const check = await pool.request()
        .input('name', sql.NVarChar, cat.name)
        .query('SELECT id FROM Categories WHERE name = @name');
      
      if (check.recordset.length === 0) {
        await pool.request()
          .input('name', sql.NVarChar, cat.name)
          .input('description', sql.NVarChar, cat.description)
          .input('image', sql.NVarChar, cat.image)
          .query('INSERT INTO Categories (name, description, image) VALUES (@name, @description, @image)');
      }
    }

    // 2. Seed Products
    console.log('🌱 Seeding Products...');
    const products = [
      { name: 'Cà chua', price: 25000, category: 'Rau củ quả', image: '/uploads/products/tomato.jpg' },
      { name: 'Rau muống', price: 10000, category: 'Rau củ quả', image: '/uploads/products/spinach.jpg' },
      { name: 'Thịt ba chỉ', price: 150000, category: 'Thịt trứng', image: '/uploads/products/pork.jpg' },
      { name: 'Trứng gà ta', price: 35000, category: 'Thịt trứng', image: '/uploads/products/eggs.jpg' },
      { name: 'Cá hồi', price: 350000, category: 'Hải sản', image: '/uploads/products/salmon.jpg' },
      { name: 'Coca Cola', price: 10000, category: 'Đồ uống', image: '/uploads/products/coke.jpg' },
      { name: 'Bánh ChocoPie', price: 50000, category: 'Bánh kẹo', image: '/uploads/products/chocopie.jpg' }
    ];

    for (const prod of products) {
      const catResult = await pool.request()
        .input('name', sql.NVarChar, prod.category)
        .query('SELECT id FROM Categories WHERE name = @name');
      
      if (catResult.recordset.length > 0) {
        const catId = catResult.recordset[0].id;
        
        const checkProd = await pool.request()
          .input('name', sql.NVarChar, prod.name)
          .query('SELECT id FROM Products WHERE name = @name');

        if (checkProd.recordset.length === 0) {
          await pool.request()
            .input('name', sql.NVarChar, prod.name)
            .input('price', sql.Decimal, prod.price)
            .input('categoryId', sql.Int, catId)
            .input('image', sql.NVarChar, prod.image)
            .query(`
              INSERT INTO Products (name, price, category_id, images, stock, description) 
              VALUES (@name, @price, @categoryId, @image, 100, N'Mô tả sản phẩm mẫu')
            `);
        }
      }
    }

    // 3. Seed Admin User
    console.log('🌱 Seeding Admin User...');
    const adminPass = await bcrypt.hash('123456', 10);
    const checkAdmin = await pool.request()
      .query("SELECT id FROM Users WHERE username = 'admin'");
    
    if (checkAdmin.recordset.length === 0) {
      await pool.request()
        .input('password', sql.NVarChar, adminPass)
        .query(`
          INSERT INTO Users (username, email, password, full_name, role) 
          VALUES ('admin', 'admin@sieuthiabc.com', @password, N'Administrator', 'admin')
        `);
      console.log('✅ Admin user created (pass: 123456)');
    } else {
        // Update admin password just in case
        await pool.request()
        .input('password', sql.NVarChar, adminPass)
        .query("UPDATE Users SET password = @password WHERE username = 'admin'");
        console.log('✅ Admin password reset to 123456');
    }

    console.log('✨ Seeding completed successfully!');
    await closePool();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
