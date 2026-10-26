const { pool } = require('../config/db');

async function cleanMockData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🧹 Bắt đầu dọn dẹp toàn bộ dữ liệu mẫu theo yêu cầu bàn giao...');

    // 1. Xóa toàn bộ dữ liệu đơn hàng và lịch sử vận hành
    await client.query('DELETE FROM shipment_tracking_events');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM order_logs');
    await client.query('DELETE FROM email_logs');
    await client.query('DELETE FROM webhook_logs');
    await client.query('DELETE FROM orders');
    console.log('✅ 1. Đã xóa toàn bộ Đơn hàng thử nghiệm, Nhật ký giao dịch và Vận đơn.');

    // 2. Xóa đánh giá và wishlist
    await client.query('DELETE FROM reviews');
    await client.query('DELETE FROM wishlists');
    console.log('✅ 2. Đã xóa toàn bộ Đánh giá (Reviews) & Danh sách yêu thích (Wishlists) mẫu.');

    // 3. Xóa biến thể, thuộc tính và sản phẩm
    await client.query('DELETE FROM product_variants');
    await client.query('DELETE FROM product_options');
    await client.query('DELETE FROM products');
    console.log('✅ 3. Đã xóa toàn bộ Sản phẩm & Biến thể mẫu (Kho hàng sạch 100%).');

    // 4. Xóa tài khoản khách hàng demo (Giữ lại duy nhất tài khoản Admin)
    await client.query(`DELETE FROM users WHERE role != 'admin'`);
    console.log('✅ 4. Đã xóa tài khoản khách hàng thử nghiệm (Giữ lại tài khoản Quản trị Admin).');

    // 5. Reset các sequence tự tăng về 1
    try {
      await client.query(`ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1`);
      await client.query(`ALTER SEQUENCE IF EXISTS order_items_id_seq RESTART WITH 1`);
      await client.query(`ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1`);
      await client.query(`ALTER SEQUENCE IF EXISTS product_variants_id_seq RESTART WITH 1`);
      await client.query(`ALTER SEQUENCE IF EXISTS reviews_id_seq RESTART WITH 1`);
      await client.query(`ALTER SEQUENCE IF EXISTS email_logs_id_seq RESTART WITH 1`);
    } catch (_) {
      // Ignore sequence reset if non-existent in certain environments
    }

    await client.query('COMMIT');
    console.log('\n🎉 TOÀN BỘ DỮ LIỆU MẪU ĐÃ ĐƯỢC DỌN DẸP SẠCH SẼ SẴN SÀNG BÀN GIAO CHO KHÁCH HÀNG!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi dọn dẹp dữ liệu:', err);
    throw err;
  } finally {
    client.release();
  }
}

cleanMockData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
