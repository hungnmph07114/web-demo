const { pool } = require('../config/db');

async function setup() {
  const client = await pool.connect();
  try {
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
    console.log('✅ Created email_logs table.');
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch((err) => {
  console.error('❌ Error setting up email_logs table:', err);
  process.exit(1);
});
