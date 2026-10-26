const { pool } = require('../../config/db');

class DashboardService {
  async getStats() {
    // 1. Doanh thu & tong don
    const revRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'captured' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(*) as total_orders,
        COUNT(CASE WHEN payment_status = 'awaiting_vietqr' THEN 1 END) as pending_payment_orders,
        COUNT(CASE WHEN fulfillment_status = 'delivered' THEN 1 END) as completed_orders
      FROM orders;
    `);

    // 2. Tong so luong san pham va bien the
    const prodCountRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE is_published = true) as total_products,
        (SELECT COUNT(*) FROM product_variants WHERE is_active = true) as total_variants,
        (SELECT COUNT(*) FROM product_variants WHERE inventory_quantity <= 5 AND is_active = true) as low_stock_variants;
    `);

    // 3. Doanh so theo danh muc
    const categoryStatsRes = await pool.query(`
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
    `);

    // 4. Don hang gan nhat
    const recentOrdersRes = await pool.query(`
      SELECT id, display_id, customer_name, total_amount, payment_status, fulfillment_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    // 5. San pham sap het hang (canh bao kho)
    const lowStockRes = await pool.query(`
      SELECT 
        v.id,
        v.title as variant_title,
        v.sku,
        v.inventory_quantity,
        p.title as product_title,
        p.thumbnail
      FROM product_variants v
      JOIN products p ON v.product_id = p.id
      WHERE v.inventory_quantity <= 6 AND v.is_active = true
      ORDER BY v.inventory_quantity ASC
      LIMIT 6;
    `);

    return {
      revenue: parseFloat(revRes.rows[0].total_revenue),
      totalOrders: parseInt(revRes.rows[0].total_orders),
      pendingPaymentOrders: parseInt(revRes.rows[0].pending_payment_orders),
      completedOrders: parseInt(revRes.rows[0].completed_orders),
      totalProducts: parseInt(prodCountRes.rows[0].total_products),
      totalVariants: parseInt(prodCountRes.rows[0].total_variants),
      lowStockVariantsCount: parseInt(prodCountRes.rows[0].low_stock_variants),
      categoryStats: categoryStatsRes.rows,
      recentOrders: recentOrdersRes.rows,
      lowStockItems: lowStockRes.rows
    };
  }
}

module.exports = new DashboardService();
