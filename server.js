/**
 * Entrypoint: TechPulse Modular E-Commerce Server
 * Inspired by MedusaJS Architecture + PostgreSQL (with automatic embedded PGlite fallback)
 */
require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/db');
const { seedDatabase } = require('./src/config/seed');
const orderService = require('./src/modules/order/orderService');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    console.log('⚡ Đang khởi động hệ thống ATELIER & CO. E-Commerce Engine...');

    const dbReadyPromise = (async () => {
      await initDatabase();
      await seedDatabase();
    })();

    app.locals.dbReadyPromise = dbReadyPromise;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 E-Commerce Server đang lắng nghe tại:`);
      console.log(`👉 http://localhost:${PORT}`);
      console.log(`🔑 Tài khoản Quản trị: admin@techpulse.vn (Pass: admin123)`);
      console.log(`👤 Tài khoản Khách hàng: user@techpulse.vn (Pass: user123)`);
      console.log(`======================================================\n`);
    });

    await dbReadyPromise;

    // Cron tự động thu hồi các đơn hàng chờ quét VietQR quá hạn (30 phút) mỗi 60 giây
    const expireTimer = setInterval(async () => {
      try {
        const res = await orderService.expireStaleVietQROrders(30);
        if (res.expiredCount > 0) {
          console.log(`⏰ [Auto-Expire Cron] Đã tự động hủy và giải phóng kho cho ${res.expiredCount} đơn VietQR quá hạn: ${res.expiredDisplayIds.join(', ')}`);
        }
      } catch (err) {
        console.error('⚠️ Lỗi tiến trình Auto-Expire VietQR:', err.message);
      }
    }, 60 * 1000);

    if (typeof expireTimer.unref === 'function') {
      expireTimer.unref();
    }
  } catch (err) {
    console.error('❌ Lỗi khởi động Server:', err);
    process.exit(1);
  }
}

bootstrap();
