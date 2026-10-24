/**
 * Entrypoint: Server Bootstrap
 * Chạy ứng dụng Node.js Express kết nối Supabase PostgreSQL
 */
require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Khởi chạy server lắng nghe trên tất cả các interface mạng (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MathKids Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 Môi trường: ${process.env.NODE_ENV || 'development'}`);
  initDatabase();
});
