const { pool } = require('../config/db');

async function setup() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);
    console.log('✅ Wishlists table created or already exists.');

    // Seed sample wishlist item for default user if empty
    const { rows: countRows } = await client.query('SELECT COUNT(*) FROM wishlists');
    if (parseInt(countRows[0].count) === 0) {
      const { rows: users } = await client.query("SELECT id FROM users WHERE email = 'user@techpulse.vn' LIMIT 1");
      const { rows: prods } = await client.query('SELECT id FROM products LIMIT 2');
      if (users.length > 0 && prods.length > 0) {
        for (const p of prods) {
          await client.query(`
            INSERT INTO wishlists (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, product_id) DO NOTHING
          `, [users[0].id, p.id]);
        }
        console.log('✅ Seeded initial wishlist items for user@techpulse.vn.');
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch((err) => {
  console.error('❌ Error setting up wishlists table:', err);
  process.exit(1);
});
