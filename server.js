/**
 * Entrypoint: TechPulse Modular E-Commerce Server
 * Inspired by MedusaJS Architecture + Supabase PostgreSQL
 */
require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/db');
const { seedDatabase } = require('./src/config/seed');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    console.log('⚡ Đang khởi động hệ thống TechPulse E-Commerce Engine...');
    await initDatabase();
    await seedDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 TechPulse E-Commerce Server đang chạy tại:`);
      console.log(`👉 http://localhost:${PORT}`);
      console.log(`🔑 Tài khoản Quản trị: admin@techpulse.vn (Pass: admin123)`);
      console.log(`👤 Tài khoản Khách hàng: user@techpulse.vn (Pass: user123)`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('❌ Lỗi khởi động Server:', err);
    process.exit(1);
  }
}

bootstrap();
