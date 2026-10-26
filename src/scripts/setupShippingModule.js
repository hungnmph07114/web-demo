const { pool } = require('../config/db');

async function setup() {
  const client = await pool.connect();
  try {
    // 1. Them cac cot giao van vao bang orders neu chua co
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50) DEFAULT 'GHN',
      ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100),
      ADD COLUMN IF NOT EXISTS driver_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;
    `);
    console.log('✅ Added shipping columns to orders table.');

    // 2. Tao bang shipment_tracking_events
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipment_tracking_events (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        hub_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created shipment_tracking_events table.');

    // 3. Gan ma van don va khoi tao lo trinh cho cac don hang hien tai
    const { rows: orders } = await client.query('SELECT id, display_id, fulfillment_status FROM orders');
    for (const o of orders) {
      const code = `GHN-${o.display_id.replace('TP-', '')}${Math.floor(1000 + Math.random() * 9000)}`;
      await client.query(`
        UPDATE orders 
        SET 
          shipping_carrier = COALESCE(shipping_carrier, 'GHN'),
          tracking_code = COALESCE(tracking_code, $1),
          driver_name = COALESCE(driver_name, 'Nguyễn Văn Hùng (Bưu tá phụ trách)'),
          driver_phone = COALESCE(driver_phone, '0988.234.567'),
          estimated_delivery_date = COALESCE(estimated_delivery_date, NOW() + INTERVAL '2 days')
        WHERE id = $2
      `, [code, o.id]);

      // Tao event khoi tao neu chua co
      const { rows: events } = await client.query('SELECT id FROM shipment_tracking_events WHERE order_id = $1', [o.id]);
      if (events.length === 0) {
        await client.query(`
          INSERT INTO shipment_tracking_events (order_id, status, hub_name, description, created_at)
          VALUES 
            ($1, 'picked_up', 'Trung tâm kho TechPulse, Cầu Giấy, Hà Nội', 'Kiện hàng đã được đóng gói bọc chống sốc và bàn giao cho đơn vị vận chuyển GHN Express.', NOW() - INTERVAL '1 day'),
            ($1, 'in_sorting_hub', 'Kho phân loại tổng Cầu Giấy (SOC 01)', 'Kiện hàng đã qua máy quét phân loại tự động và đang trung chuyển đến bưu cục phát.', NOW() - INTERVAL '12 hours'),
            ($1, 'out_for_delivery', 'Bưu cục phát Đống Đa - Hoàn Kiếm', 'Bưu tá Nguyễn Văn Hùng (SĐT: 0988.234.567) đang giao kiện hàng đến bạn. Vui lòng chú ý điện thoại.', NOW() - INTERVAL '2 hours')
        `, [o.id]);
      }
    }
    console.log('✅ Backfilled carrier & tracking timeline for', orders.length, 'orders.');
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch((err) => {
  console.error('❌ Error setting up shipping module:', err);
  process.exit(1);
});
