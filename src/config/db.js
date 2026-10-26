/**
 * Database Configuration & Connection Pool
 * Supports PostgreSQL (Supabase / Cloud SQL) with automatic embedded PGlite fallback
 * Modular E-Commerce Schema inspired by MedusaJS
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

let activeBackend = null; // 'pg' | 'pglite'
let pgPool = null;
let pgliteInstance = null;
let pgliteMutex = Promise.resolve();

function createExternalPgPool() {
  if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME) {
    return new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 8000
    });
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return new Pool({
      connectionString: process.env.DATABASE_URL.trim(),
      ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });
  }

  return null;
}

async function getPGlite() {
  if (pgliteInstance) return pgliteInstance;
  const { PGlite } = await import('@electric-sql/pglite');
  try {
    const dataDir = path.join(__dirname, '..', '..', '.pglite-data');
    pgliteInstance = new PGlite(dataDir);
    await pgliteInstance.waitReady;
  } catch (err) {
    // Fallback to pure in-memory PGlite if disk directory cannot be initialized
    pgliteInstance = new PGlite();
    await pgliteInstance.waitReady;
  }
  return pgliteInstance;
}

function sanitizeParams(params) {
  if (!Array.isArray(params)) return [];
  return params.map((v) => (v === undefined ? null : v));
}

async function ensureBackend() {
  if (activeBackend === 'pg' && pgPool) return;
  if (activeBackend === 'pglite' && pgliteInstance) return;

  const candidatePool = createExternalPgPool();
  if (candidatePool) {
    candidatePool.on('error', (err) => {
      console.error('⚠️ Cảnh báo sự cố trên idle PostgreSQL client:', err.message);
    });
    try {
      const testClient = await candidatePool.connect();
      testClient.release();
      pgPool = candidatePool;
      activeBackend = 'pg';
      console.log('✅ Kết nối PostgreSQL ngoại vi thành công!');
      return;
    } catch (err) {
      console.warn('⚠️ Không thể kết nối PostgreSQL ngoại vi, chuyển sang Embedded PostgreSQL (PGlite):', err.message);
      try {
        await candidatePool.end();
      } catch (_) {
        // ignore
      }
    }
  }

  await getPGlite();
  activeBackend = 'pglite';
  console.log('✅ Đã khởi tạo Embedded PostgreSQL Engine (PGlite) tự động dự phòng!');
}

const pool = {
  async query(text, params) {
    await ensureBackend();
    const cleanParams = sanitizeParams(params);
    if (activeBackend === 'pg') {
      return pgPool.query(text, cleanParams);
    }

    const db = await getPGlite();
    // Serialize top-level queries with active transactions
    let releaseLock;
    const prevLock = pgliteMutex;
    pgliteMutex = new Promise((resolve) => {
      releaseLock = resolve;
    });
    await prevLock;
    try {
      const res = await db.query(text, cleanParams);
      return { rows: res.rows || [], rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0) };
    } finally {
      releaseLock();
    }
  },

  async connect() {
    await ensureBackend();
    if (activeBackend === 'pg') {
      return pgPool.connect();
    }

    const db = await getPGlite();
    let releaseLock;
    const prevLock = pgliteMutex;
    pgliteMutex = new Promise((resolve) => {
      releaseLock = resolve;
    });
    await prevLock;

    let released = false;
    return {
      async query(text, params) {
        const cleanParams = sanitizeParams(params);
        const res = await db.query(text, cleanParams);
        return { rows: res.rows || [], rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0) };
      },
      release() {
        if (!released) {
          released = true;
          releaseLock();
        }
      }
    };
  },

  on(event, handler) {
    if (pgPool) {
      pgPool.on(event, handler);
    }
  },

  async end() {
    if (pgPool) {
      await pgPool.end();
    }
    if (pgliteInstance && typeof pgliteInstance.close === 'function') {
      await pgliteInstance.close();
    }
  }
};

async function initDatabase() {
  const client = await pool.connect();
  try {
    // 1. Bảng Users (Phân quyền JWT)
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

    // 2. Bảng Categories (Danh mục sản phẩm công nghệ)
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

    // 3. Bảng Products (Sản phẩm gốc)
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

    // 4. Bảng Product Options (Thuộc tính: Màu sắc, Dung lượng, ...)
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_options (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL
      );
    `);

    // 5. Bảng Product Variants (Biến thể sản phẩm kiểu Medusa: SKU, Giá riêng, Tồn kho riêng)
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

    // 6. Bảng Promotions (Mã giảm giá & Quy tắc khuyến mãi)
    await client.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        type VARCHAR(20) DEFAULT 'percentage',
        value NUMERIC(12, 2) NOT NULL,
        min_order_value NUMERIC(15, 2) DEFAULT 0,
        max_discount NUMERIC(15, 2) DEFAULT 0,
        usage_limit INT DEFAULT 100,
        usage_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Bảng Orders (Đơn hàng với Dual State Machine + Giao vận + Đối soát VietQR)
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
        payment_method VARCHAR(50) DEFAULT 'vietqr',
        payment_status VARCHAR(50) DEFAULT 'awaiting_vietqr',
        fulfillment_status VARCHAR(50) DEFAULT 'processing',
        promotion_code VARCHAR(50),
        vietqr_content VARCHAR(100),
        vietqr_image TEXT,
        transaction_ref VARCHAR(100),
        shipping_carrier VARCHAR(50) DEFAULT 'GHN',
        tracking_code VARCHAR(100),
        driver_name VARCHAR(150),
        driver_phone VARCHAR(50),
        estimated_delivery_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Đảm bảo tương thích ngược cho database đã tạo từ phiên bản cũ
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100),
      ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50) DEFAULT 'GHN',
      ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100),
      ADD COLUMN IF NOT EXISTS driver_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;
    `);

    // 8. Bảng Order Items (Chi tiết từng biến thể trong đơn hàng)
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

    // 9. Bảng Order Logs (Lịch sử chuyển đổi trạng thái đơn hàng)
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_logs (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Bảng Webhook Logs (Lịch sử giao dịch VietQR tự động — hợp nhất đầy đủ các cột)
    await client.query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        gateway VARCHAR(50) DEFAULT 'vietqr',
        order_id INT REFERENCES orders(id) ON DELETE SET NULL,
        display_id VARCHAR(50),
        order_display_id VARCHAR(50),
        amount NUMERIC(15, 2),
        transaction_ref VARCHAR(100),
        bank_name VARCHAR(100),
        content TEXT,
        response_message TEXT,
        status VARCHAR(50) DEFAULT 'success',
        raw_payload JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE webhook_logs
      ADD COLUMN IF NOT EXISTS order_display_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS content TEXT,
      ADD COLUMN IF NOT EXISTS response_message TEXT,
      ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100);
    `);

    // 11. Bảng Reviews (Đánh giá và chấm sao sản phẩm)
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        user_name VARCHAR(150) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT NOT NULL,
        verified_purchase BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. Bảng Wishlists (Danh sách sản phẩm yêu thích của khách hàng)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);

    // 13. Bảng Shipment Tracking Events (Lộ trình bưu tá & bưu cục giao vận)
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipment_tracking_events (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        hub_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 14. Bảng Email Logs (Nhật ký email thông báo hệ thống)
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE SET NULL,
        to_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        template_type VARCHAR(50) NOT NULL,
        preview_url TEXT,
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 15. Bảng Store Settings (Cấu hình Thương hiệu, Giao diện, Ngân hàng VietQR & Biểu phí Vận chuyển)
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id INT PRIMARY KEY DEFAULT 1,
        store_name VARCHAR(150) DEFAULT 'ATELIER & CO.',
        store_tagline VARCHAR(150) DEFAULT 'Curated Multi-Category Store',
        hero_badge VARCHAR(150) DEFAULT 'Nền tảng Bán lẻ Đa ngành Thế hệ mới',
        hero_title VARCHAR(255) DEFAULT 'Không Gian Mua Sắm Tuyển Chọn &',
        hero_highlight VARCHAR(255) DEFAULT 'Trải Nghiệm Đa Biến Thể',
        hero_subtitle TEXT DEFAULT 'Từ Thời trang thiết kế, Nội thất Bắc Âu, Mỹ phẩm thiên nhiên đến Cà phê thủ công và Thiết bị âm thanh — tùy chọn kích cỡ, chất liệu, dung tích linh hoạt cùng thanh toán VietQR 24/7 tức thì.',
        hero_image TEXT DEFAULT '/assets/editorial/hero-flagship.svg',
        default_theme VARCHAR(20) DEFAULT 'light',
        unit_label VARCHAR(50) DEFAULT 'sản phẩm',
        preset_key VARCHAR(50) DEFAULT 'multi_flagship',
        bank_id VARCHAR(50) DEFAULT 'MB',
        bank_name VARCHAR(150) DEFAULT 'MB Bank (Ngân hàng Quân Đội)',
        bank_account_no VARCHAR(100) DEFAULT '0345678910',
        bank_account_name VARCHAR(150) DEFAULT 'ATELIER RETAIL CORP',
        base_shipping_fee NUMERIC(15, 2) DEFAULT 30000,
        free_shipping_threshold NUMERIC(15, 2) DEFAULT 1000000,
        store_phone VARCHAR(50) DEFAULT '1900 8888',
        store_address TEXT DEFAULT '88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE store_settings
      ADD COLUMN IF NOT EXISTS bank_id VARCHAR(50) DEFAULT 'MB',
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150) DEFAULT 'MB Bank (Ngân hàng Quân Đội)',
      ADD COLUMN IF NOT EXISTS bank_account_no VARCHAR(100) DEFAULT '0345678910',
      ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(150) DEFAULT 'ATELIER RETAIL CORP',
      ADD COLUMN IF NOT EXISTS base_shipping_fee NUMERIC(15, 2) DEFAULT 30000,
      ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC(15, 2) DEFAULT 1000000,
      ADD COLUMN IF NOT EXISTS store_phone VARCHAR(50) DEFAULT '1900 8888',
      ADD COLUMN IF NOT EXISTS store_address TEXT DEFAULT '88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh';
    `);

    console.log('✨ Khởi tạo hệ thống cơ sở dữ liệu Modular E-Commerce thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initDatabase
};
