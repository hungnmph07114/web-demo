const { pool } = require('../../config/db');

class DashboardService {
  async getStats() {
    // Tối ưu hóa PERF-03: Thực thi đồng thời 6 truy vấn độc lập qua Promise.all
    const [
      revRes,
      prodCountRes,
      categoryStatsRes,
      recentOrdersRes,
      lowStockRes,
      topProductsRes
    ] = await Promise.all([
      // 1. Doanh thu & tổng đơn + phân bổ phương thức thanh toán
      pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN payment_status = 'captured' THEN total_amount ELSE 0 END), 0) as total_revenue,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN payment_status = 'awaiting_vietqr' AND fulfillment_status != 'canceled' THEN 1 END) as pending_payment_orders,
          COUNT(CASE WHEN fulfillment_status = 'delivered' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN fulfillment_status = 'canceled' THEN 1 END) as canceled_orders,
          COUNT(CASE WHEN payment_method = 'vietqr' THEN 1 END) as vietqr_orders,
          COUNT(CASE WHEN payment_method = 'cod' THEN 1 END) as cod_orders
        FROM orders;
      `),

      // 2. Tổng số lượng sản phẩm và biến thể
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM products WHERE is_published = true) as total_products,
          (SELECT COUNT(*) FROM product_variants WHERE is_active = true) as total_variants,
          (SELECT COUNT(*) FROM product_variants WHERE inventory_quantity <= 5 AND is_active = true) as low_stock_variants;
      `),

      // 3. Doanh số theo danh mục
      pool.query(`
        SELECT 
          c.name as category_name,
          c.icon as category_icon,
          COUNT(DISTINCT p.id) as product_count,
          COALESCE(SUM(oi.total_price), 0) as total_sales
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        LEFT JOIN order_items oi ON pv.id = oi.variant_id
        GROUP BY c.id
        ORDER BY total_sales DESC;
      `),

      // 4. Đơn hàng gần nhất
      pool.query(`
        SELECT id, display_id, customer_name, total_amount, payment_status, fulfillment_status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 5;
      `),

      // 5. Sản phẩm sắp hết hàng (cảnh báo kho)
      pool.query(`
        SELECT 
          v.id,
          v.product_id,
          v.title as variant_title,
          v.sku,
          v.price,
          v.inventory_quantity,
          p.title as product_title,
          p.thumbnail
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        WHERE v.inventory_quantity <= 8 AND v.is_active = true
        ORDER BY v.inventory_quantity ASC
        LIMIT 6;
      `),

      // 6. Top sản phẩm bán chạy nhất
      pool.query(`
        SELECT 
          oi.product_title,
          oi.variant_title,
          oi.sku,
          MAX(oi.thumbnail) as thumbnail,
          SUM(oi.quantity) as total_sold,
          SUM(oi.total_price) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.fulfillment_status != 'canceled'
        GROUP BY oi.product_title, oi.variant_title, oi.sku
        ORDER BY total_revenue DESC
        LIMIT 5;
      `)
    ]);

    const row = revRes.rows[0] || {};
    const pRow = prodCountRes.rows[0] || {};

    return {
      totalRevenue: parseFloat(row.total_revenue || 0),
      totalOrders: parseInt(row.total_orders || 0, 10),
      pendingPaymentOrders: parseInt(row.pending_payment_orders || 0, 10),
      completedOrders: parseInt(row.completed_orders || 0, 10),
      canceledOrders: parseInt(row.canceled_orders || 0, 10),
      vietqrOrders: parseInt(row.vietqr_orders || 0, 10),
      codOrders: parseInt(row.cod_orders || 0, 10),
      totalProducts: parseInt(pRow.total_products || 0, 10),
      totalVariants: parseInt(pRow.total_variants || 0, 10),
      lowStockVariants: parseInt(pRow.low_stock_variants || 0, 10),
      categoryStats: categoryStatsRes.rows.map((c) => ({
        categoryName: c.category_name,
        categoryIcon: c.category_icon,
        productCount: parseInt(c.product_count, 10),
        totalSales: parseFloat(c.total_sales)
      })),
      recentOrders: recentOrdersRes.rows,
      lowStockItems: lowStockRes.rows,
      topSellingProducts: topProductsRes.rows
    };
  }
}

module.exports = new DashboardService();
