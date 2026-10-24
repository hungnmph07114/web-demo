const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cau hinh ket noi PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Bat buoc doi voi ket noi Supabase tren cloud
  }
});

// Khoi tao Database & Tao bang neu chua ton tai
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

// 1. API Kiem tra trang thai Server & Database
app.get('/api/status', async (req, res) => {
  const startTime = Date.now();
  let dbStatus = 'Disconnected';
  let dbTime = null;
  let latency = 0;

  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db_name');
    dbStatus = 'Connected';
    dbTime = result.rows[0].now;
    latency = Date.now() - startTime;
  } catch (error) {
    dbStatus = `Error: ${error.message}`;
  }

  res.json({
    server: 'Online',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      latencyMs: latency,
      serverTime: dbTime
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime())
    }
  });
});

// 2. API Lay danh sach ghi chu
app.get('/api/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Khong the tai du lieu: ' + err.message });
  }
});

// 3. API Them ghi chu moi
app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Tieu de khong duoc de trong' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title.trim(), (content || '').trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Khong the luu du lieu: ' + err.message });
  }
});

// 4. API Xoa ghi chu theo ID
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    res.json({ success: true, message: 'Da xoa thanh cong' });
  } catch (err) {
    res.status(500).json({ error: 'Khong the xoa: ' + err.message });
  }
});

// ==========================================
// 5. TOÁN TƯ DUY APIs (LEADERBOARD & SCORES)
// ==========================================

// Lay top 10 bang vinh danh
app.get('/api/math/leaderboard', async (req, res) => {
  const { mode, grade } = req.query;
  try {
    let query = 'SELECT player_name, grade, score, stars, mode, avatar, created_at FROM math_leaderboard';
    const params = [];
    const conditions = [];

    if (mode && mode !== 'all') {
      params.push(mode);
      conditions.push(`mode = $${params.length}`);
    }
    if (grade && grade !== 'all') {
      params.push(parseInt(grade));
      conditions.push(`grade = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY score DESC, stars DESC, created_at DESC LIMIT 15';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Loi leaderboard:', err.message);
    res.status(500).json({ error: 'Khong the lay bang xep hang: ' + err.message });
  }
});

// Luu diem nguoi choi moi
app.post('/api/math/score', async (req, res) => {
  const { player_name, grade, score, stars, mode, avatar } = req.body;
  if (!player_name || !player_name.trim()) {
    return res.status(400).json({ error: 'Tên người chơi không được để trống' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO math_leaderboard (player_name, grade, score, stars, mode, avatar) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        player_name.trim().slice(0, 50),
        parseInt(grade) || 1,
        parseInt(score) || 0,
        parseInt(stars) || 0,
        (mode || 'practice').slice(0, 50),
        (avatar || '🦉').slice(0, 10)
      ]
    );
    res.status(201).json({ success: true, record: result.rows[0] });
  } catch (err) {
    console.error('Loi luu diem:', err.message);
    res.status(500).json({ error: 'Khong the luu diem: ' + err.message });
  }
});

// Thong ke chung
app.get('/api/math/stats', async (req, res) => {
  try {
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_plays,
        COALESCE(SUM(stars), 0) as total_stars,
        COALESCE(MAX(score), 0) as high_score
      FROM math_leaderboard
    `);
    res.json(statsRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Khong the lay thong ke: ' + err.message });
  }
});

// Khởi chạy server tren dia chi 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server dang chay tai: http://localhost:${PORT}`);
  initDatabase();
});
