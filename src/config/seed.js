/**
 * Database Seeder
 * Populates multi-category retail flagship data (Fashion, Home & Living, Beauty, Artisanal Coffee, Lifestyle Audio)
 * and ensures existing tech-only databases automatically upgrade to the multi-department catalog.
 */
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seedMultiCategoryCatalog(client, customerUserId) {
  // 1. Khởi tạo cấu hình cửa hàng mặc định (Store Settings)
  await client.query(`
    INSERT INTO store_settings (
      id, store_name, store_tagline, hero_badge, hero_title, hero_highlight,
      hero_subtitle, hero_image, default_theme, unit_label, preset_key
    )
    VALUES (
      1,
      'ATELIER & CO.',
      'Curated Multi-Category Store',
      'Nền tảng Bán lẻ Đa ngành Thế hệ mới',
      'Không Gian Mua Sắm Tuyển Chọn &',
      'Trải Nghiệm Đa Biến Thể',
      'Từ Thời trang thiết kế, Nội thất Bắc Âu, Mỹ phẩm thiên nhiên đến Cà phê thủ công và Thiết bị âm thanh — tùy chọn kích cỡ, chất liệu, dung tích linh hoạt cùng thanh toán VietQR 24/7 tức thì.',
      '/assets/editorial/hero-flagship.svg',
      'light',
      'sản phẩm',
      'multi_flagship'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 2. Xóa các danh mục/sản phẩm chỉ thuần công nghệ cũ nếu chưa có danh mục đa ngành
  const checkMultiCat = await client.query(`SELECT COUNT(*) FROM categories WHERE slug = 'thoi-trang'`);
  if (parseInt(checkMultiCat.rows[0].count) > 0) {
    return;
  }

  console.log('🌿 Đang nâng cấp danh mục sản phẩm sang Cửa hàng Đa ngành (Multi-Category Flagship)...');

  // Làm mới bảng sản phẩm & danh mục để nạp bộ sưu tập đa ngành chuẩn Editorial
  await client.query('DELETE FROM products');
  await client.query('DELETE FROM categories');

  const categoriesRes = await client.query(`
    INSERT INTO categories (name, slug, description, icon)
    VALUES 
      ('Thời trang & Phụ kiện', 'thoi-trang', 'Trang phục thiết kế tối giản, chất liệu Linen hữu cơ và phụ kiện da thủ công', '🧥'),
      ('Nội thất & Đời sống', 'noi-that', 'Nội thất gỗ sồi Bắc Âu, đèn trang trí kiến trúc và vật dụng không gian sống', '🪑'),
      ('Mỹ phẩm & Hương thơm', 'my-pham', 'Tinh chất dưỡng da thảo mộc, nước hoa thủ công và nến thơm thiên nhiên', '🧴'),
      ('Ẩm thực & Cà phê', 'am-thuc', 'Cà phê Arabica đặc sản rang mộc, trà đạo và dụng cụ pha chế thủ công', '☕'),
      ('Thiết bị & Âm thanh', 'cong-nghe', 'Tai nghe chống ồn Studio Hi-Fi, loa không dây và phụ kiện thông minh', '🎧')
    RETURNING id, slug;
  `);

  const catMap = {};
  categoriesRes.rows.forEach((c) => {
    catMap[c.slug] = c.id;
  });

  // Sản phẩm 1: Áo Khoác Trench Coat Linen Unisex (Thời trang)
  const p1 = await client.query(`
    INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
    VALUES (
      'Áo Khoác Trench Coat Linen Hữu Cơ',
      'Phom dáng Relaxed Fit thanh lịch, vải Linen Pháp thoáng khí tự nhiên cho 4 mùa',
      'ao-khoac-trench-coat-linen-huu-co',
      'Thiết kế lấy cảm hứng từ kiến trúc đương đại với đường cắt may tỉ mỉ, khuy sừng tự nhiên và đai thắt eo linh hoạt. Chất liệu 100% French Flax Linen đã qua xử lý mềm mịn, giữ phom bền bỉ.',
      '/assets/editorial/fashion-trench.svg',
      $1
    ) RETURNING id;
  `, [catMap['thoi-trang']]);
  const p1Id = p1.rows[0].id;

  await client.query(`
    INSERT INTO product_options (product_id, title) VALUES ($1, 'Màu sắc'), ($1, 'Kích cỡ');
  `, [p1Id]);

  await client.query(`
    INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
    VALUES 
      ($1, 'Be Cát Tự Nhiên / Size S', 'TRENCH-SAND-S', 1390000, 1690000, 18, '{"Màu sắc": "Be Cát Tự Nhiên", "Kích cỡ": "Size S"}'::jsonb, '/assets/editorial/fashion-trench.svg'),
      ($1, 'Be Cát Tự Nhiên / Size M', 'TRENCH-SAND-M', 1390000, 1690000, 24, '{"Màu sắc": "Be Cát Tự Nhiên", "Kích cỡ": "Size M"}'::jsonb, '/assets/editorial/fashion-trench.svg'),
      ($1, 'Be Cát Tự Nhiên / Size L', 'TRENCH-SAND-L', 1450000, 1690000, 12, '{"Màu sắc": "Be Cát Tự Nhiên", "Kích cỡ": "Size L"}'::jsonb, '/assets/editorial/fashion-trench.svg'),
      ($1, 'Đen Than Chì / Size M', 'TRENCH-CHAR-M', 1450000, 1750000, 15, '{"Màu sắc": "Đen Than Chì", "Kích cỡ": "Size M"}'::jsonb, '/assets/editorial/fashion-trench.svg');
  `, [p1Id]);

  // Sản phẩm 2: Ghế Bành Gỗ Sồi Bắc Âu Nordic Lounge (Nội thất)
  const p2 = await client.query(`
    INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
    VALUES (
      'Ghế Bành Gỗ Sồi Bắc Âu Nordic Lounge',
      'Khung gỗ sồi trắng nguyên khối kết hợp đệm vải dệt Bouclé êm ái chuẩn Scandinavian',
      'ghe-banh-go-soi-bac-au-nordic-lounge',
      'Tác phẩm nội thất điểm nhấn cho phòng khách hoặc phòng đọc sách. Khung ghế chế tác từ gỗ sồi Bắc Mỹ sấy tiêu chuẩn chống cong vênh, đệm ngồi bọc vải dệt Bouclé cao cấp nâng đỡ cột sống tối ưu.',
      '/assets/editorial/living-chair.svg',
      $1
    ) RETURNING id;
  `, [catMap['noi-that']]);
  const p2Id = p2.rows[0].id;

  await client.query(`
    INSERT INTO product_options (product_id, title) VALUES ($1, 'Chất liệu đệm'), ($1, 'Màu gỗ');
  `, [p2Id]);

  await client.query(`
    INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
    VALUES 
      ($1, 'Vải Bouclé Kem / Gỗ Sồi Tự Nhiên', 'CHAIR-BOUCLE-OAK', 4890000, 5600000, 9, '{"Chất liệu đệm": "Vải Bouclé Kem", "Màu gỗ": "Gỗ Sồi Tự Nhiên"}'::jsonb, '/assets/editorial/living-chair.svg'),
      ($1, 'Vải Bouclé Kem / Gỗ Óc Chó Trầm', 'CHAIR-BOUCLE-WAL', 5290000, 5990000, 4, '{"Chất liệu đệm": "Vải Bouclé Kem", "Màu gỗ": "Gỗ Óc Chó Trầm"}'::jsonb, '/assets/editorial/living-chair.svg'),
      ($1, 'Da Thuộc Cognac / Gỗ Sồi Tự Nhiên', 'CHAIR-LEATHER-OAK', 6490000, 7200000, 5, '{"Chất liệu đệm": "Da Thuộc Cognac", "Màu gỗ": "Gỗ Sồi Tự Nhiên"}'::jsonb, '/assets/editorial/living-chair.svg');
  `, [p2Id]);

  // Sản phẩm 3: Tinh Chất Thảo Mộc Botanical Serum & Nến Thơm (Mỹ phẩm)
  const p3 = await client.query(`
    INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
    VALUES (
      'Tinh Chất Thảo Mộc Botanical Repair & Nến Thơm',
      'Chiết xuất hoa trà trắng, gỗ tuyết tùng và Niacinamide thuần chay phục hồi chuyên sâu',
      'tinh-chat-thao-moc-botanical-serum',
      'Công thức dưỡng ẩm sâu không chứa paraben hay hương liệu nhân tạo, đựng trong chai thủy tinh hổ phách chống tia UV. Kết hợp hoàn hảo cùng nến thơm sáp đậu nành hương gỗ Hinoki thư giãn.',
      '/assets/editorial/beauty-serum.svg',
      $1
    ) RETURNING id;
  `, [catMap['my-pham']]);
  const p3Id = p3.rows[0].id;

  await client.query(`
    INSERT INTO product_options (product_id, title) VALUES ($1, 'Dung tích & Phiên bản');
  `, [p3Id]);

  await client.query(`
    INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
    VALUES 
      ($1, 'Chai Tiêu Chuẩn 30ml', 'SERUM-BOT-30ML', 420000, 490000, 35, '{"Dung tích & Phiên bản": "Chai Tiêu Chuẩn 30ml"}'::jsonb, '/assets/editorial/beauty-serum.svg'),
      ($1, 'Chai Lớn Tiết Kiệm 50ml', 'SERUM-BOT-50ML', 650000, 780000, 22, '{"Dung tích & Phiên bản": "Chai Lớn Tiết Kiệm 50ml"}'::jsonb, '/assets/editorial/beauty-serum.svg'),
      ($1, 'Giftset Serum 50ml + Nến Thơm Hinoki', 'SERUM-GIFTSET-01', 920000, 1150000, 14, '{"Dung tích & Phiên bản": "Giftset Serum 50ml + Nến Thơm Hinoki"}'::jsonb, '/assets/editorial/beauty-serum.svg');
  `, [p3Id]);

  // Sản phẩm 4: Bộ Pha Cà Phê Thủ Công Pour-Over & Hạt Arabica Cầu Đất (Ẩm thực)
  const p4 = await client.query(`
    INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
    VALUES (
      'Bộ Pha Cà Phê Pour-Over Gốm Thủ Công & Arabica',
      'Hạt Arabica Cầu Đất sơ chế Honey rang mộc cùng phễu lọc gốm nung nhiệt độ cao',
      'bo-pha-ca-phe-pour-over-arabica',
      'Trải nghiệm hương vị cà phê đặc sản với nốt hương hoa trắng, cam thảo và hậu vị ngọt thanh. Phễu gốm thủ công giữ nhiệt ổn định giúp chiết xuất trọn vẹn tinh hoa hạt cà phê.',
      '/assets/editorial/coffee-roast.svg',
      $1
    ) RETURNING id;
  `, [catMap['am-thuc']]);
  const p4Id = p4.rows[0].id;

  await client.query(`
    INSERT INTO product_options (product_id, title) VALUES ($1, 'Tùy chọn bộ'), ($1, 'Mức xay');
  `, [p4Id]);

  await client.query(`
    INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
    VALUES 
      ($1, 'Túi Hạt Arabica 250g / Nguyên Hạt', 'COFFEE-250G-WHOLE', 260000, 310000, 50, '{"Tùy chọn bộ": "Túi Hạt Arabica 250g", "Mức xay": "Nguyên Hạt"}'::jsonb, '/assets/editorial/coffee-roast.svg'),
      ($1, 'Túi Hạt Arabica 250g / Xay Pha Phin & Pour-Over', 'COFFEE-250G-DRIP', 260000, 310000, 40, '{"Tùy chọn bộ": "Túi Hạt Arabica 250g", "Mức xay": "Xay Pha Phin & Pour-Over"}'::jsonb, '/assets/editorial/coffee-roast.svg'),
      ($1, 'Trọn Bộ Phễu Gốm V60 + Bình Thủy Tinh + 250g Hạt', 'COFFEE-FULLSET-V60', 890000, 1050000, 16, '{"Tùy chọn bộ": "Trọn Bộ Phễu Gốm V60 + Bình + Hạt", "Mức xay": "Nguyên Hạt"}'::jsonb, '/assets/editorial/coffee-roast.svg');
  `, [p4Id]);

  // Sản phẩm 5: Túi Tote Da Thuộc Minimalist Everyday (Thời trang)
  const p5 = await client.query(`
    INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
    VALUES (
      'Túi Tote Da Thuộc Minimalist Everyday',
      'Da bò lớp đầu (Full-Grain Leather) khâu tay thủ công, ngăn chứa vừa tài liệu & laptop 15"',
      'tui-tote-da-thuoc-minimalist-everyday',
      'Phụ kiện đồng hành bền bỉ theo năm tháng với bề mặt da tự nhiên càng dùng càng bóng đẹp. Thiết kế tối giản không logo phô trương, phù hợp cả môi trường công sở lẫn dạo phố cuối tuần.',
      '/assets/editorial/leather-tote.svg',
      $1
    ) RETURNING id;
  `, [catMap['thoi-trang']]);
  const p5Id = p5.rows[0].id;

  await client.query(`
    INSERT INTO product_options (product_id, title) VALUES ($1, 'Màu da');
  `, [p5Id]);

  await client.query(`
    INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
    VALUES 
      ($1, 'Nâu Espresso Cổ Điển', 'TOTE-ESP-01', 1850000, 2200000, 14, '{"Màu da": "Nâu Espresso Cổ Điển"}'::jsonb, '/assets/editorial/leather-tote.svg'),
      ($1, 'Đen Obsidian Nhám', 'TOTE-BLK-02', 1850000, 2200000, 3, '{"Màu da": "Đen Obsidian Nhám"}'::jsonb, '/assets/editorial/leather-tote.svg');
  `, [p5Id]);

  // Sản phẩm 6: Tai Nghe Chống Ồn Studio Acoustic Reference (Thiết bị & Âm thanh)
  const p6 = await client.query(`
    INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
    VALUES (
      'Tai Nghe Không Dây Studio Acoustic ANC',
      'Âm thanh Hi-Res chuẩn phòng thu, khử tiếng ồn chủ động đa tầng và đệm tai da cừu non',
      'tai-nghe-khong-day-studio-acoustic-anc',
      'Sự giao thoa giữa thiết kế tối giản đương đại và kỹ thuật âm học chính xác. Thời lượng pin 36 giờ liên tục, hỗ trợ kết nối đa điểm và sạc nhanh USB-C.',
      '/assets/editorial/audio-studio.svg',
      $1
    ) RETURNING id;
  `, [catMap['cong-nghe']]);
  const p6Id = p6.rows[0].id;

  await client.query(`
    INSERT INTO product_options (product_id, title) VALUES ($1, 'Phiên bản màu');
  `, [p6Id]);

  await client.query(`
    INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
    VALUES 
      ($1, 'Đen Graphite Nhám', 'STUDIO-ANC-BLK', 4590000, 5290000, 11, '{"Phiên bản màu": "Đen Graphite Nhám"}'::jsonb, '/assets/editorial/audio-studio.svg'),
      ($1, 'Bạc Champagne', 'STUDIO-ANC-SLV', 4590000, 5290000, 5, '{"Phiên bản màu": "Bạc Champagne"}'::jsonb, '/assets/editorial/audio-studio.svg');
  `, [p6Id]);

  // Đánh giá mẫu đa ngành
  await client.query('DELETE FROM reviews');
  await client.query(`
    INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, verified_purchase)
    VALUES
      ($1, $2, 'Trần Minh Khang', 5, 'Chất vải Linen rất mát và đứng phom!', 'Mình chọn màu Be Cát Size M mặc vừa vặn, đường kim mũi chỉ cực kỳ sắc sảo. Thanh toán VietQR tự động xác nhận ngay lập tức.', true),
      ($3, NULL, 'Nguyễn Thảo Vy', 5, 'Ghế ngồi êm, gỗ sồi thật rất chắc chắn', 'Đặt ở góc đọc sách nhìn sang hẳn cả căn phòng. Giao hàng đóng gói kỹ lưỡng.', true),
      ($4, NULL, 'Lê Hoàng Yến', 5, 'Mùi hương thảo mộc tự nhiên rất dễ chịu', 'Serum thấm nhanh, không nhờn rít, nến thơm tặng kèm trong bộ Giftset thơm dịu nhẹ.', true),
      ($5, NULL, 'Phạm Quốc Bảo', 5, 'Hạt Arabica Cầu Đất rang mới cực thơm', 'Phễu gốm dày dặn, pha buổi sáng rất tiện và chuẩn vị.', true);
  `, [p1Id, customerUserId, p2Id, p3Id, p4Id]);
}

async function seedDatabase() {
  const client = await pool.connect();
  try {
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    let customerUserId = null;

    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('🌱 Đang khởi tạo tài khoản và dữ liệu mẫu cho hệ thống...');

      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('user123', 10);

      const usersRes = await client.query(`
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES 
        ('admin@techpulse.vn', $1, 'Nguyễn Mạnh Hùng (Admin)', '0987654321', 'admin'),
        ('user@techpulse.vn', $2, 'Trần Minh Khang (Khách hàng)', '0912345678', 'customer')
        RETURNING id, email, role;
      `, [adminPassword, userPassword]);

      customerUserId = usersRes.rows[1]?.id || null;

      await seedMultiCategoryCatalog(client, customerUserId);

      // Tạo Promotions
      await client.query(`
        INSERT INTO promotions (code, description, type, value, min_order_value, max_discount, usage_limit)
        VALUES 
        ('WELCOME50K', 'Giảm trực tiếp 50.000đ cho đơn hàng từ 300.000đ', 'fixed', 50000, 300000, 50000, 200),
        ('TECHPULSE50K', 'Giảm trực tiếp 50.000đ cho đơn hàng từ 400.000đ', 'fixed', 50000, 400000, 50000, 200),
        ('VIP10', 'Giảm 10% tối đa 1.000.000đ cho đơn hàng từ 1.500.000đ', 'percentage', 10, 1500000, 1000000, 100),
        ('FREESHIP', 'Miễn phí giao hàng toàn quốc (trợ giá 30.000đ)', 'fixed', 30000, 250000, 30000, 500)
        ON CONFLICT (code) DO NOTHING;
      `);

      // Tạo Đơn hàng mẫu kèm thông tin Giao vận & Lộ trình bưu cục
      const order1 = await client.query(`
        INSERT INTO orders (
          display_id, user_id, customer_name, customer_email, customer_phone, shipping_address,
          subtotal, discount_total, shipping_fee, total_amount, payment_method,
          payment_status, fulfillment_status, promotion_code, vietqr_content, vietqr_image,
          transaction_ref, shipping_carrier, tracking_code, driver_name, driver_phone, estimated_delivery_date
        ) VALUES (
          'TP-8801', $1, 'Trần Minh Khang', 'user@techpulse.vn', '0912345678', 'Tòa nhà Landmark 81, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
          1390000, 50000, 0, 1340000, 'vietqr',
          'captured', 'delivered', 'WELCOME50K', 'TP-8801 0912345678',
          'https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=1340000&addInfo=TP-8801%200912345678&accountName=NGUYEN%20MANH%20HUNG',
          'FT262998801', 'GHN', 'GHN-88019421', 'Nguyễn Văn Hùng (Bưu tá phụ trách)', '0988.234.567', CURRENT_TIMESTAMP + INTERVAL '1 day'
        ) RETURNING id;
      `, [customerUserId]);

      const order1Id = order1.rows[0].id;

      await client.query(`
        INSERT INTO order_items (order_id, variant_id, product_title, variant_title, sku, unit_price, quantity, total_price, thumbnail)
        SELECT $1, id, 'Áo Khoác Trench Coat Linen Hữu Cơ', title, sku, price, 1, price, thumbnail
        FROM product_variants WHERE sku = 'TRENCH-SAND-M' LIMIT 1;
      `, [order1Id]);

      await client.query(`
        INSERT INTO order_logs (order_id, action, note) VALUES
        ($1, 'order.created', 'Khách hàng tạo đơn hàng qua cổng VietQR'),
        ($1, 'payment.captured', 'Cổng VietQR 24/7 tự động đối soát biến động số dư và xác nhận nhận tiền thành công'),
        ($1, 'fulfillment.delivered', 'Đơn vị vận chuyển đã giao hàng thành công tới người nhận');
      `, [order1Id]);

      await client.query(`
        INSERT INTO shipment_tracking_events (order_id, status, hub_name, description, created_at)
        VALUES
          ($1, 'picked_up', 'Trung tâm điều phối Kho Trung Tâm', 'Kiện hàng đã được đóng gói tiêu chuẩn và bàn giao cho đơn vị vận chuyển GHN Express.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
          ($1, 'in_sorting_hub', 'Trung tâm khai thác & phân loại tự động SOC 01', 'Kiện hàng đã qua băng chuyền phân loại tự động và trung chuyển vào TP. Hồ Chí Minh.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
          ($1, 'out_for_delivery', 'Bưu cục phát Bình Thạnh', 'Bưu tá Nguyễn Văn Hùng (SĐT: 0988.234.567) đang mang kiện hàng đi giao.', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
          ($1, 'delivered', 'Tòa nhà Landmark 81, Q. Bình Thạnh', 'Giao hàng thành công! Khách hàng Trần Minh Khang đã kiểm tra và ký nhận.', CURRENT_TIMESTAMP - INTERVAL '1 hour');
      `, [order1Id]);

      const order2 = await client.query(`
        INSERT INTO orders (
          display_id, customer_name, customer_email, customer_phone, shipping_address,
          subtotal, discount_total, shipping_fee, total_amount, payment_method,
          payment_status, fulfillment_status, promotion_code, vietqr_content, vietqr_image,
          shipping_carrier, tracking_code, driver_name, driver_phone, estimated_delivery_date
        ) VALUES (
          'TP-8802', 'Lê Hoàng Yến', 'hoangyen@gmail.com', '0933221100', '120 Hoàng Hoa Thám, Ba Đình, Hà Nội',
          920000, 50000, 30000, 900000, 'vietqr',
          'awaiting_vietqr', 'processing', 'WELCOME50K', 'TP-8802 0933221100',
          'https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=900000&addInfo=TP-8802%200933221100&accountName=NGUYEN%20MANH%20HUNG',
          'GHTK', 'GHTK-88027165', 'Phạm Quốc Khánh (Bưu tá GHTK)', '0977.112.334', CURRENT_TIMESTAMP + INTERVAL '2 days'
        ) RETURNING id;
      `);

      const order2Id = order2.rows[0].id;

      await client.query(`
        INSERT INTO order_items (order_id, variant_id, product_title, variant_title, sku, unit_price, quantity, total_price, thumbnail)
        SELECT $1, id, 'Tinh Chất Thảo Mộc Botanical Repair & Nến Thơm', title, sku, price, 1, price, thumbnail
        FROM product_variants WHERE sku = 'SERUM-GIFTSET-01' LIMIT 1;
      `, [order2Id]);

      await client.query(`
        INSERT INTO order_logs (order_id, action, note) VALUES
        ($1, 'order.created', 'Đơn hàng vừa được tạo, đang chờ khách quét VietQR thanh toán');
      `, [order2Id]);

      await client.query(`
        INSERT INTO shipment_tracking_events (order_id, status, hub_name, description, created_at)
        VALUES
          ($1, 'order_received', 'Hệ thống Điều phối Kho Trung Tâm', 'Đơn hàng đã được ghi nhận trên hệ thống và đang chuẩn bị xuất kho.', CURRENT_TIMESTAMP - INTERVAL '10 minutes');
      `, [order2Id]);

      console.log('✅ Đã nạp thành công bộ dữ liệu mẫu Cửa hàng Đa ngành (Multi-Category Flagship)!');
    } else {
      // Nếu database đã có user từ phiên bản cũ, đảm bảo nâng cấp lên bộ danh mục đa ngành & store_settings
      const custRes = await client.query(`SELECT id FROM users WHERE role = 'customer' LIMIT 1`);
      customerUserId = custRes.rows[0]?.id || null;
      await seedMultiCategoryCatalog(client, customerUserId);
      await client.query(`
        INSERT INTO promotions (code, description, type, value, min_order_value, max_discount, usage_limit)
        VALUES ('WELCOME50K', 'Giảm trực tiếp 50.000đ cho đơn hàng từ 300.000đ', 'fixed', 50000, 300000, 50000, 200)
        ON CONFLICT (code) DO NOTHING;
      `);
    }
  } catch (err) {
    console.error('❌ Lỗi nạp dữ liệu mẫu:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { seedDatabase };
