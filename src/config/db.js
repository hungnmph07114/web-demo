/**
 * Database Configuration & Connection Pool
 * PostgreSQL (Supabase) client with auto table initialization
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Bat buoc doi voi ket noi Supabase tren cloud
  }
});

// Xu ly su co bat ngo tren client PostgreSQL o trang thai cho (idle)
pool.on('error', (err) => {
  console.error('⚠️ Canh bao su co tren idle PostgreSQL client:', err.message);
});

// Khoi tao Database & Tao cac bang can thiet
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Ket noi Supabase PostgreSQL thanh cong!');

    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS math_leaderboard (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(100) NOT NULL,
        grade INT DEFAULT 1,
        score INT NOT NULL,
        stars INT DEFAULT 0,
        mode VARCHAR(50) DEFAULT 'practice',
        avatar VARCHAR(50) DEFAULT '🦉',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Kiem tra du lieu mau bang notes
    const countRes = await client.query('SELECT COUNT(*) FROM notes');
    if (parseInt(countRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO notes (title, content) VALUES
        ('Chào mừng đến với Toán Tư Duy Nhí!', 'Hệ thống học tập và rèn luyện tư duy toán cho học sinh cấp 1.'),
        ('Bé hãy chọn lớp học', 'Bắt đầu hành trình chinh phục các thử thách toán học hấp dẫn nhé!')
      `);
      console.log('🌱 Da tao du lieu mau ban dau cho bang notes.');
    }

    // Kiem tra du lieu mau bang math_leaderboard
    const mathCountRes = await client.query('SELECT COUNT(*) FROM math_leaderboard');
    if (parseInt(mathCountRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO math_leaderboard (player_name, grade, score, stars, mode, avatar) VALUES
        ('Bé Minh Khang', 3, 1250, 48, 'speed', '🦁'),
        ('Bé An Nhiên', 2, 1100, 42, 'practice', '🐰'),
        ('Bé Gia Bảo', 4, 980, 35, 'balance', '🤖'),
        ('Bé Linh Đan', 1, 920, 31, 'memory', '🐼'),
        ('Bé Tuấn Kiệt', 5, 870, 29, 'speed', '🦉')
      `);
      console.log('🌟 Da tao bang vinh danh mau ban dau.');
    }

    client.release();
  } catch (err) {
    console.error('❌ Loi ket noi Database:', err.message);
  }
}

module.exports = {
  pool,
  initDatabase
};
