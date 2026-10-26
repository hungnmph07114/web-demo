/**
 * Database Seeder
 * Populates sample realistic technology data with options, variants, vouchers, and users
 */
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seedDatabase() {
  const client = await pool.connect();
  try {
    // 1. Kiem tra xem da co user chua
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('ℹ️ Du lieu da ton tai trong he thong, bo qua buoc seed.');
      return;
    }

    console.log('🌱 Dang khoi tao du lieu mau phong cach Medusa cho TechPulse...');

    // 2. Tao Users: Admin va Customer
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const adminUser = await client.query(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES 
      ('admin@techpulse.vn', $1, 'Nguyễn Mạnh Hùng (Admin)', '0987654321', 'admin'),
      ('user@techpulse.vn', $2, 'Trần Minh Khang (Customer)', '0912345678', 'customer')
      RETURNING id, email, role;
    `, [adminPassword, userPassword]);

    // 3. Tao Categories
    const categoriesRes = await client.query(`
      INSERT INTO categories (name, slug, description, icon)
      VALUES 
      ('Điện thoại thông minh', 'dien-thoai', 'Flagship cao cấp từ Apple, Samsung, Xiaomi với công nghệ đỉnh cao', '📱'),
      ('Laptop & Máy tính xách tay', 'laptop', 'MacBook, Dell XPS, ThinkPad dành cho lập trình viên và sáng tạo nội dung', '💻'),
      ('Máy tính bảng (Tablet)', 'tablet', 'iPad Pro, Galaxy Tab hiệu năng mạnh mẽ cho làm việc và giải trí', '📟'),
      ('Tai nghe & Âm thanh Hi-Fi', 'am-thanh', 'Tai nghe chống ồn chủ động ANC, loa Bluetooth cao cấp', '🎧'),
      ('Phụ kiện & Củ sạc nhanh', 'phu-kien', 'Sạc nhanh GaN, cáp bọc dù, hub chuyển đổi Type-C chuẩn Thunderbolt', '⚡')
      RETURNING id, slug;
    `);

    const catMap = {};
    categoriesRes.rows.forEach(c => { catMap[c.slug] = c.id; });

    // 4. Tao San pham 1: iPhone 15 Pro Max
    const p1 = await client.query(`
      INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
      VALUES (
        'iPhone 15 Pro Max',
        'Khung viền Titanium chuẩn hàng không vũ trụ, chip Apple A17 Pro 3nm đỉnh cao',
        'iphone-15-pro-max',
        'iPhone 15 Pro Max là chiếc điện thoại đỉnh cao nhất của Apple với thiết kế khung viền Titanium siêu bền và nhẹ, nút Action đa nhiệm thông minh, cụm camera zoom quang học 5x sắc nét và cổng sạc USB-C tốc độ 10Gbps.',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        $1
      ) RETURNING id;
    `, [catMap['dien-thoai']]);
    const p1Id = p1.rows[0].id;

    await client.query(`
      INSERT INTO product_options (product_id, title) VALUES
      ($1, 'Màu sắc'), ($1, 'Dung lượng');
    `, [p1Id]);

    await client.query(`
      INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
      VALUES 
      ($1, 'Titan Tự Nhiên / 256GB', 'IP15PM-NT-256', 29990000, 34990000, 15, '{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'),
      ($1, 'Titan Tự Nhiên / 512GB', 'IP15PM-NT-512', 35490000, 40990000, 8, '{"Màu sắc": "Titan Tự Nhiên", "Dung lượng": "512GB"}'::jsonb, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'),
      ($1, 'Titan Xanh / 256GB', 'IP15PM-BL-256', 29490000, 34990000, 12, '{"Màu sắc": "Titan Xanh", "Dung lượng": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1695048065053-bf2e330a109a?w=800&auto=format&fit=crop&q=80'),
      ($1, 'Titan Đen / 256GB', 'IP15PM-BK-256', 29990000, 34990000, 20, '{"Màu sắc": "Titan Đen", "Dung lượng": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80');
    `, [p1Id]);

    // 5. Tao San pham 2: MacBook Pro 14" M3 Pro
    const p2 = await client.query(`
      INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
      VALUES (
        'MacBook Pro 14" M3 Pro',
        'Sức mạnh xử lý quái thú cho Developer & Designer với màn hình Liquid Retina XDR 120Hz',
        'macbook-pro-14-m3-pro',
        'MacBook Pro 14 inch trang bị chip M3 Pro mang lại hiệu năng phi thường cùng thời lượng pin lên đến 22 giờ. Màu Đen Không Gian (Space Black) xử lý anodized hóa chống bám vân tay đỉnh cao.',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        $1
      ) RETURNING id;
    `, [catMap['laptop']]);
    const p2Id = p2.rows[0].id;

    await client.query(`
      INSERT INTO product_options (product_id, title) VALUES
      ($1, 'Màu sắc'), ($1, 'Cấu hình');
    `, [p2Id]);

    await client.query(`
      INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
      VALUES 
      ($1, 'Đen Không Gian / 18GB RAM / 512GB SSD', 'MBP14-M3P-18-512-SB', 49990000, 54990000, 7, '{"Màu sắc": "Đen Không Gian", "Cấu hình": "18GB RAM / 512GB SSD"}'::jsonb, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'),
      ($1, 'Đen Không Gian / 36GB RAM / 1TB SSD', 'MBP14-M3P-36-1TB-SB', 62490000, 68990000, 4, '{"Màu sắc": "Đen Không Gian", "Cấu hình": "36GB RAM / 1TB SSD"}'::jsonb, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'),
      ($1, 'Bạc Sang Trọng / 18GB RAM / 512GB SSD', 'MBP14-M3P-18-512-SL', 49990000, 54990000, 5, '{"Màu sắc": "Bạc Sang Trọng", "Cấu hình": "18GB RAM / 512GB SSD"}'::jsonb, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80');
    `, [p2Id]);

    // 6. Tao San pham 3: Samsung Galaxy S24 Ultra
    const p3 = await client.query(`
      INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
      VALUES (
        'Samsung Galaxy S24 Ultra 5G',
        'Kỷ nguyên Galaxy AI thông minh, Camera 200MP zoom mắt thần và bút S-Pen tích hợp',
        'samsung-galaxy-s24-ultra',
        'Galaxy S24 Ultra mở ra kỷ nguyên mới với trí tuệ nhân tạo Galaxy AI hỗ trợ dịch thuật cuộc gọi thời gian thực, khoanh vùng tìm kiếm Circle to Search và khung viền Titan siêu cứng cáp.',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
        $1
      ) RETURNING id;
    `, [catMap['dien-thoai']]);
    const p3Id = p3.rows[0].id;

    await client.query(`
      INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
      VALUES 
      ($1, 'Xám Titan / 256GB', 'S24U-GR-256', 27990000, 31990000, 10, '{"Màu sắc": "Xám Titan", "Dung lượng": "256GB"}'::jsonb, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'),
      ($1, 'Đen Titan / 512GB', 'S24U-BK-512', 31990000, 37490000, 6, '{"Màu sắc": "Đen Titan", "Dung lượng": "512GB"}'::jsonb, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80');
    `, [p3Id]);

    // 7. Tao San pham 4: Tai nghe Sony WH-1000XM5
    const p4 = await client.query(`
      INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
      VALUES (
        'Tai nghe Sony WH-1000XM5',
        'Trùm chống ồn chủ động dẫn đầu ngành công nghiệp với 8 microphone và chip V1/QN1',
        'sony-wh-1000xm5',
        'Tai nghe over-ear hàng đầu với chất lượng âm thanh Hi-Res Audio, đàm thoại siêu nét với AI lọc tiếng ồn gió, thời lượng pin 30 giờ và thiết kế công thái học siêu êm ái.',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        $1
      ) RETURNING id;
    `, [catMap['am-thanh']]);
    const p4Id = p4.rows[0].id;

    await client.query(`
      INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
      VALUES 
      ($1, 'Đen Nhám (Midnight Black)', 'WH1000XM5-BK', 7990000, 9490000, 25, '{"Màu sắc": "Đen Nhám"}'::jsonb, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'),
      ($1, 'Bạc Bạch Kim (Silver Platinum)', 'WH1000XM5-SL', 7990000, 9490000, 18, '{"Màu sắc": "Bạc Bạch Kim"}'::jsonb, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80');
    `, [p4Id]);

    // 8. Tao San pham 5: Cu sac Anker Prime 100W GaN
    const p5 = await client.query(`
      INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
      VALUES (
        'Củ sạc nhanh Anker Prime 100W GaN 3 cổng',
        'Công nghệ GaNPrime thế hệ mới, sạc đồng thời 2 MacBook và 1 iPhone cùng lúc',
        'cu-sac-anker-prime-100w-gan',
        'Sạc nhanh thông minh phân bổ nguồn điện ActiveShield 2.0 kiểm soát nhiệt độ an toàn, thiết kế siêu nhỏ gọn tiện lợi di chuyển.',
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        $1
      ) RETURNING id;
    `, [catMap['phu-kien']]);
    const p5Id = p5.rows[0].id;

    await client.query(`
      INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
      VALUES 
      ($1, 'Xám Kim Loại Titan', 'ANKER-PRIME-100W', 1490000, 1890000, 50, '{"Màu sắc": "Xám Kim Loại"}'::jsonb, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80');
    `, [p5Id]);

    // 9. Tao Promotions
    await client.query(`
      INSERT INTO promotions (code, description, type, value, min_order_value, max_discount, usage_limit)
      VALUES 
      ('TECHPULSE50K', 'Giảm trực tiếp 50.000đ cho đơn hàng từ 500.000đ', 'fixed', 50000, 500000, 50000, 200),
      ('VIP10', 'Giảm 10% tối đa 2.000.000đ cho đơn hàng từ 15.000.000đ', 'percentage', 10, 15000000, 2000000, 100),
      ('FREESHIP', 'Miễn phí giao hàng toàn quốc (trợ giá 30.000đ)', 'fixed', 30000, 300000, 30000, 500);
    `);

    // 10. Tao Mot vai Don hang mau voi 2 trang thai PaymentStatus va FulfillmentStatus
    const order1 = await client.query(`
      INSERT INTO orders (
        display_id, customer_name, customer_email, customer_phone, shipping_address,
        subtotal, discount_total, shipping_fee, total_amount, payment_method,
        payment_status, fulfillment_status, vietqr_content, vietqr_image
      ) VALUES (
        'TP-8801', 'Trần Minh Khang', 'user@techpulse.vn', '0912345678', 'Tòa nhà Landmark 81, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
        29990000, 50000, 0, 29940000, 'vietqr',
        'captured', 'delivered', 'TP-8801 0912345678',
        'https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=29940000&addInfo=TP-8801%200912345678&accountName=NGUYEN%20MANH%20HUNG'
      ) RETURNING id;
    `);

    await client.query(`
      INSERT INTO order_items (order_id, variant_id, product_title, variant_title, sku, unit_price, quantity, total_price, thumbnail)
      SELECT $1, id, 'iPhone 15 Pro Max', title, sku, price, 1, price, thumbnail
      FROM product_variants WHERE sku = 'IP15PM-NT-256' LIMIT 1;
    `, [order1.rows[0].id]);

    await client.query(`
      INSERT INTO order_logs (order_id, action, note) VALUES
      ($1, 'order.created', 'Khách hàng tạo đơn hàng qua cổng VietQR'),
      ($1, 'payment.captured', 'Quản trị viên đã đối soát biến động số dư và xác nhận nhận tiền thành công'),
      ($1, 'fulfillment.delivered', 'Đơn vị vận chuyển đã giao hàng thành công tới người nhận');
    `, [order1.rows[0].id]);

    const order2 = await client.query(`
      INSERT INTO orders (
        display_id, customer_name, customer_email, customer_phone, shipping_address,
        subtotal, discount_total, shipping_fee, total_amount, payment_method,
        payment_status, fulfillment_status, vietqr_content, vietqr_image
      ) VALUES (
        'TP-8802', 'Lê Hoàng Yến', 'hoangyen@gmail.com', '0933221100', '120 Hoàng Hoa Thám, Ba Đình, Hà Nội',
        7990000, 50000, 30000, 7970000, 'vietqr',
        'awaiting_vietqr', 'processing', 'TP-8802 0933221100',
        'https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=7970000&addInfo=TP-8802%200933221100&accountName=NGUYEN%20MANH%20HUNG'
      ) RETURNING id;
    `);

    await client.query(`
      INSERT INTO order_items (order_id, variant_id, product_title, variant_title, sku, unit_price, quantity, total_price, thumbnail)
      SELECT $1, id, 'Tai nghe Sony WH-1000XM5', title, sku, price, 1, price, thumbnail
      FROM product_variants WHERE sku = 'WH1000XM5-BK' LIMIT 1;
    `, [order2.rows[0].id]);

    await client.query(`
      INSERT INTO order_logs (order_id, action, note) VALUES
      ($1, 'order.created', 'Đơn hàng vừa được tạo, đang chờ khách quét VietQR thanh toán');
    `, [order2.rows[0].id]);

    console.log('✅ Đã nạp thành công bộ dữ liệu mẫu TechPulse cao cấp!');
  } catch (err) {
    console.error('❌ Lỗi nạp dữ liệu mẫu:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { seedDatabase };
