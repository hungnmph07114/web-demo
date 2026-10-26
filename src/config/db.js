/**
 * Database Configuration & Connection Pool
 * PostgreSQL (Supabase) client with auto table initialization
 * Modular E-Commerce Schema inspired by MedusaJS
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('⚠️ Canh bao su co tren idle PostgreSQL client:', err.message);
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('✅ Ket noi Supabase PostgreSQL thanh cong!');

    // 1. Bang Users (Phan quyen JWT)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Bang Categories (Danh muc san pham cong nghe)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT '💻',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Bang Products (San pham goc)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        thumbnail TEXT,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Bang Product Options (Thuoc tinh: Mau sac, Dung luong, ...)
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_options (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL
      );
    `);

    // 5. Bang Product Variants (Bien the san pham kieu Medusa: SKU, Gia rieng, Ton kho rieng)
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        price NUMERIC(15, 2) NOT NULL,
        original_price NUMERIC(15, 2),
        inventory_quantity INT DEFAULT 10,
        options_json JSONB DEFAULT '{}'::jsonb,
        thumbnail TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Bang Promotions (Ma giam gia & Quy tac khuyen mai)
    await client.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' hoac 'fixed'
        value NUMERIC(12, 2) NOT NULL,
        min_order_value NUMERIC(15, 2) DEFAULT 0,
        max_discount NUMERIC(15, 2) DEFAULT 0,
        usage_limit INT DEFAULT 100,
        usage_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Bang Orders (Don hang voi 2 trang thai doc lap: PaymentStatus & FulfillmentStatus)
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        display_id VARCHAR(50) UNIQUE NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        shipping_address TEXT NOT NULL,
        note TEXT,
        subtotal NUMERIC(15, 2) NOT NULL,
        discount_total NUMERIC(15, 2) DEFAULT 0,
        shipping_fee NUMERIC(15, 2) DEFAULT 0,
        total_amount NUMERIC(15, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'vietqr', -- 'vietqr' | 'cod'
        payment_status VARCHAR(50) DEFAULT 'awaiting_vietqr', -- 'awaiting_vietqr' | 'captured' | 'refunded'
        fulfillment_status VARCHAR(50) DEFAULT 'processing', -- 'processing' | 'packing' | 'shipped' | 'delivered' | 'canceled'
        promotion_code VARCHAR(50),
        vietqr_content VARCHAR(100),
        vietqr_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Bang Order Items (Chi tiet tung bien the trong don hang)
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
        product_title VARCHAR(255) NOT NULL,
        variant_title VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        unit_price NUMERIC(15, 2) NOT NULL,
        quantity INT NOT NULL,
        total_price NUMERIC(15, 2) NOT NULL,
        thumbnail TEXT
      );
    `);

    // 9. Bang Order Logs (Lich su chuyen doi trang thai don hang)
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_logs (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✨ Khoi tao he thong co so du lieu TechPulse Modular E-Commerce thanh cong!');
  } catch (error) {
    console.error('❌ Loi khi khoi tao Database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initDatabase
};
