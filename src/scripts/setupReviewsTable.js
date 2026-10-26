const { pool } = require('../config/db');

async function setup() {
  const client = await pool.connect();
  try {
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
    console.log('✅ Reviews table created or already exists.');

    // Check count
    const { rows: countRows } = await client.query('SELECT COUNT(*) FROM reviews');
    if (parseInt(countRows[0].count) === 0) {
      const { rows: prods } = await client.query('SELECT id, title FROM products LIMIT 10');
      for (const p of prods) {
        await client.query(`
          INSERT INTO reviews (product_id, user_name, rating, title, comment, verified_purchase, created_at)
          VALUES 
            ($1, 'Nguyễn Minh Quân', 5, 'Chất lượng xuất sắc vượt tầm giá!', 'Máy hoàn thiện cực kỳ tỉ mỉ, màn hình 120Hz mượt mà, thời lượng pin trâu ấn tượng. Giao hàng 2 tiếng nội thành rất ưng ý!', true, NOW() - INTERVAL '3 days'),
            ($1, 'Trần Thu Hà', 5, 'Rất đáng đồng tiền bát gạo', 'Đóng gói bọc xốp chống sốc dày dặn, quét mã VietQR tự động xác nhận sau 2 giây. Rất chuyên nghiệp!', true, NOW() - INTERVAL '7 days'),
            ($1, 'Lê Hoàng Nam', 4, 'Trải nghiệm mượt mà, cấu hình mạnh', 'Màu sắc rất đẹp, phụ kiện đầy đủ. Tản nhiệt tốt khi render video hoặc chơi game tác vụ nặng.', true, NOW() - INTERVAL '12 days')
        `, [p.id]);
      }
      console.log('✅ Seeded initial reviews for products.');
    }
    const { rows } = await client.query('SELECT COUNT(*) FROM reviews');
    console.log('✅ Total reviews now:', rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch((err) => {
  console.error('❌ Error setting up reviews table:', err);
  process.exit(1);
});
