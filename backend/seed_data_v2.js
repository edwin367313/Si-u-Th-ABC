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
      { name: 'Bánh kẹo', description: 'Bánh kẹo các loại', image: '/uploads/categories/snacks.jpg' },
      { name: 'Gia vị', description: 'Gia vị nấu ăn', image: '/uploads/categories/spices.jpg' },
      { name: 'Đồ hộp', description: 'Thực phẩm đóng hộp', image: '/uploads/categories/canned.jpg' },
      { name: 'Sữa & Chế phẩm', description: 'Sữa tươi, sữa chua, phô mai', image: '/uploads/categories/dairy.jpg' }
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

    // 2. Seed Products (30 items)
    console.log('🌱 Seeding 30 Products...');
    const products = [
      // Rau củ quả
      { name: 'Cà chua', price: 25000, category: 'Rau củ quả', image: '/uploads/products/tomato.jpg' },
      { name: 'Rau muống', price: 10000, category: 'Rau củ quả', image: '/uploads/products/spinach.jpg' },
      { name: 'Cà rốt', price: 15000, category: 'Rau củ quả', image: '/uploads/products/carrot.jpg' },
      { name: 'Khoai tây', price: 20000, category: 'Rau củ quả', image: '/uploads/products/potato.jpg' },
      { name: 'Dưa leo', price: 12000, category: 'Rau củ quả', image: '/uploads/products/cucumber.jpg' },
      
      // Thịt trứng
      { name: 'Thịt ba chỉ', price: 150000, category: 'Thịt trứng', image: '/uploads/products/pork.jpg' },
      { name: 'Trứng gà ta', price: 35000, category: 'Thịt trứng', image: '/uploads/products/eggs.jpg' },
      { name: 'Thịt bò thăn', price: 250000, category: 'Thịt trứng', image: '/uploads/products/beef.jpg' },
      { name: 'Cánh gà', price: 80000, category: 'Thịt trứng', image: '/uploads/products/chicken_wings.jpg' },
      { name: 'Sườn non', price: 160000, category: 'Thịt trứng', image: '/uploads/products/ribs.jpg' },

      // Hải sản
      { name: 'Cá hồi', price: 350000, category: 'Hải sản', image: '/uploads/products/salmon.jpg' },
      { name: 'Tôm sú', price: 280000, category: 'Hải sản', image: '/uploads/products/shrimp.jpg' },
      { name: 'Mực ống', price: 220000, category: 'Hải sản', image: '/uploads/products/squid.jpg' },
      { name: 'Cá thu', price: 180000, category: 'Hải sản', image: '/uploads/products/mackerel.jpg' },
      { name: 'Nghêu', price: 40000, category: 'Hải sản', image: '/uploads/products/clams.jpg' },

      // Đồ uống
      { name: 'Coca Cola', price: 10000, category: 'Đồ uống', image: '/uploads/products/coke.jpg' },
      { name: 'Pepsi', price: 10000, category: 'Đồ uống', image: '/uploads/products/pepsi.jpg' },
      { name: 'Bia Tiger', price: 18000, category: 'Đồ uống', image: '/uploads/products/tiger.jpg' },
      { name: 'Nước cam ép', price: 25000, category: 'Đồ uống', image: '/uploads/products/orange_juice.jpg' },
      { name: 'Sữa đậu nành', price: 15000, category: 'Đồ uống', image: '/uploads/products/soymilk.jpg' },

      // Bánh kẹo
      { name: 'Bánh ChocoPie', price: 50000, category: 'Bánh kẹo', image: '/uploads/products/chocopie.jpg' },
      { name: 'Snack khoai tây', price: 12000, category: 'Bánh kẹo', image: '/uploads/products/snack.jpg' },
      { name: 'Kẹo dẻo', price: 20000, category: 'Bánh kẹo', image: '/uploads/products/gummy.jpg' },
      { name: 'Bánh quy bơ', price: 45000, category: 'Bánh kẹo', image: '/uploads/products/cookies.jpg' },
      { name: 'Socola', price: 60000, category: 'Bánh kẹo', image: '/uploads/products/chocolate.jpg' },

      // Sữa
      { name: 'Sữa tươi Vinamilk', price: 32000, category: 'Sữa & Chế phẩm', image: '/uploads/products/milk.jpg' },
      { name: 'Sữa chua', price: 6000, category: 'Sữa & Chế phẩm', image: '/uploads/products/yogurt.jpg' },
      { name: 'Phô mai', price: 40000, category: 'Sữa & Chế phẩm', image: '/uploads/products/cheese.jpg' },
      { name: 'Váng sữa', price: 55000, category: 'Sữa & Chế phẩm', image: '/uploads/products/custard.jpg' },
      { name: 'Sữa đặc', price: 22000, category: 'Sữa & Chế phẩm', image: '/uploads/products/condensed_milk.jpg' }
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
              VALUES (@name, @price, @categoryId, @image, 100, N'Mô tả sản phẩm mẫu cho ' + @name)
            `);
        }
      }
    }

    // 3. Seed Themes
    console.log('🌱 Seeding Themes...');
    const themes = [
      { 
        name: 'Mặc định', 
        primary_color: '#1890ff', 
        secondary_color: '#f0f2f5', 
        background_image: '', 
        falling_icon: null,
        is_active: true,
        event_name: 'default'
      },
      { 
        name: 'Tết Nguyên Đán', 
        primary_color: '#e60000', 
        secondary_color: '#ffeb3b', 
        background_image: '/uploads/themes/tet_bg.jpg', 
        falling_icon: '🌸', // Hoa đào
        is_active: false,
        event_name: 'tet'
      },
      { 
        name: 'Giáng Sinh', 
        primary_color: '#006400', 
        secondary_color: '#ff0000', 
        background_image: '/uploads/themes/xmas_bg.jpg', 
        falling_icon: '❄️', // Tuyết
        is_active: false,
        event_name: 'christmas'
      },
      { 
        name: 'Mùa Hè', 
        primary_color: '#ff9800', 
        secondary_color: '#4caf50', 
        background_image: '/uploads/themes/summer_bg.jpg', 
        falling_icon: '☀️', // Nắng
        is_active: false,
        event_name: 'summer'
      },
      { 
        name: 'Mùa Thu', 
        primary_color: '#d35400', 
        secondary_color: '#f39c12', 
        background_image: '/uploads/themes/autumn_bg.jpg', 
        falling_icon: '🍁', // Lá phong
        is_active: false,
        event_name: 'autumn'
      }
    ];

    // Check if Themes table has columns for falling_icon and event_name
    // If not, we might need to alter table or just insert what we can
    // For now, let's assume we need to create/alter the table first or just insert basic data
    // But since I can't easily alter table structure here without risk, I'll check if table exists and create if not
    
    // Let's try to insert. If it fails, we know why.
    // Actually, better to ensure table structure.
    
    try {
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Themes' AND COLUMN_NAME = 'falling_icon')
            BEGIN
                ALTER TABLE Themes ADD falling_icon NVARCHAR(50) NULL;
            END
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Themes' AND COLUMN_NAME = 'event_name')
            BEGIN
                ALTER TABLE Themes ADD event_name NVARCHAR(50) NULL;
            END
             IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Themes' AND COLUMN_NAME = 'primary_color')
            BEGIN
                ALTER TABLE Themes ADD primary_color NVARCHAR(50) NULL;
            END
             IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Themes' AND COLUMN_NAME = 'secondary_color')
            BEGIN
                ALTER TABLE Themes ADD secondary_color NVARCHAR(50) NULL;
            END
             IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Themes' AND COLUMN_NAME = 'background_image')
            BEGIN
                ALTER TABLE Themes ADD background_image NVARCHAR(500) NULL;
            END
        `);
        console.log('✅ Themes table schema updated');
    } catch (err) {
        console.log('⚠️ Could not update Themes schema, might already exist or permission denied');
    }

    for (const theme of themes) {
      const check = await pool.request()
        .input('name', sql.NVarChar, theme.name)
        .query('SELECT id FROM Themes WHERE name = @name');
      
      if (check.recordset.length === 0) {
        await pool.request()
          .input('name', sql.NVarChar, theme.name)
          .input('primary_color', sql.NVarChar, theme.primary_color)
          .input('secondary_color', sql.NVarChar, theme.secondary_color)
          .input('background_image', sql.NVarChar, theme.background_image)
          .input('falling_icon', sql.NVarChar, theme.falling_icon)
          .input('event_name', sql.NVarChar, theme.event_name)
          .input('is_active', sql.Bit, theme.is_active)
          .query(`
            INSERT INTO Themes (name, primary_color, secondary_color, background_image, falling_icon, event_name, is_active) 
            VALUES (@name, @primary_color, @secondary_color, @background_image, @falling_icon, @event_name, @is_active)
          `);
      }
    }

    // 4. Seed Admin User
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
