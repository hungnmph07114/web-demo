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
    `);

    // Kiem tra du lieu mau
    const countRes = await client.query('SELECT COUNT(*) FROM notes');
    if (parseInt(countRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO notes (title, content) VALUES
        ('Chào mừng bạn đến với Web App!', 'Dự án demo Fullstack kết nối Supabase PostgreSQL và Render đã sẵn sàng.'),
        ('Thử nghiệm ghi chú', 'Bạn có thể thử nhập ghi chú mới ở form bên trên để kiểm tra lưu dữ liệu vào Database thực tế.')
      `);
      console.log('🌱 Da tao du lieu mau ban dau vao Database.');
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

// Khởi chạy server tren dia chi 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server dang chay tai: http://localhost:${PORT}`);
  initDatabase();
});
