const { pool } = require('../../config/db');

class ProductService {
  async listCategories() {
    const res = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    return res.rows;
  }

  async listProducts({ categorySlug, search } = {}) {
    let query = `
      SELECT 
        p.id,
        p.title,
        p.subtitle,
        p.slug,
        p.thumbnail,
        p.created_at,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon,
        COALESCE(MIN(v.price), 0) as min_price,
        COALESCE(MAX(v.price), 0) as max_price,
        COALESCE(SUM(v.inventory_quantity), 0) as total_inventory,
        COUNT(DISTINCT v.id) as variants_count,
        COALESCE(ROUND(AVG(r.rating), 1), 5.0) as average_rating,
        COUNT(DISTINCT r.id) as reviews_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants v ON p.id = v.product_id AND v.is_active = true
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.is_published = true
    `;
    const params = [];

    if (categorySlug && categorySlug !== 'all') {
      params.push(categorySlug);
      query += ` AND c.slug = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(p.title) LIKE $${params.length} OR LOWER(p.subtitle) LIKE $${params.length} OR LOWER(v.sku) LIKE $${params.length})`;
    }

    query += `
      GROUP BY p.id, c.id
      ORDER BY p.id DESC
    `;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async getProductDetails(idOrSlug) {
    const isNum = !isNaN(idOrSlug);
    const prodRes = await pool.query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon,
        COALESCE(ROUND(AVG(r.rating), 1), 5.0) as average_rating,
        COUNT(DISTINCT r.id) as reviews_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE ${isNum ? 'p.id = $1' : 'p.slug = $1'}
      GROUP BY p.id, c.id
    `, [idOrSlug]);

    if (prodRes.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy sản phẩm' };
    }

    const product = prodRes.rows[0];

    // Lay danh sach options
    const optionsRes = await pool.query(`
      SELECT id, title FROM product_options WHERE product_id = $1 ORDER BY id ASC
    `, [product.id]);

    // Lay danh sach variants
    const variantsRes = await pool.query(`
      SELECT * FROM product_variants 
      WHERE product_id = $1 AND is_active = true 
      ORDER BY price ASC
    `, [product.id]);

    product.options = optionsRes.rows;
    product.variants = variantsRes.rows;

    return product;
  }

  async createProduct({ title, subtitle, slug, description, thumbnail, category_id, options = [], variants = [] }) {
    if (!title || !slug) {
      throw { status: 400, message: 'Tiêu đề và đường dẫn (slug) sản phẩm là bắt buộc' };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const prodRes = await client.query(`
        INSERT INTO products (title, subtitle, slug, description, thumbnail, category_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `, [title, subtitle, slug, description, thumbnail, category_id || null]);
      const product = prodRes.rows[0];

      // Insert Options
      for (const optTitle of options) {
        if (optTitle && optTitle.trim()) {
          await client.query(`
            INSERT INTO product_options (product_id, title) VALUES ($1, $2);
          `, [product.id, optTitle.trim()]);
        }
      }

      // Insert Variants
      for (const v of variants) {
        await client.query(`
          INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [
          product.id,
          v.title || `${product.title} - Standard`,
          v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          v.price || 0,
          v.original_price || null,
          v.inventory_quantity || 10,
          JSON.stringify(v.options_json || {}),
          v.thumbnail || thumbnail
        ]);
      }

      await client.query('COMMIT');
      return product;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateProduct(id, { title, subtitle, description, thumbnail, category_id, is_published }) {
    const res = await pool.query(`
      UPDATE products
      SET 
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        description = COALESCE($3, description),
        thumbnail = COALESCE($4, thumbnail),
        category_id = COALESCE($5, category_id),
        is_published = COALESCE($6, is_published)
      WHERE id = $7
      RETURNING *;
    `, [title, subtitle, description, thumbnail, category_id, is_published, id]);

    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy sản phẩm cần cập nhật' };
    }
    return res.rows[0];
  }

  async deleteProduct(id) {
    const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy sản phẩm để xóa' };
    }
    return true;
  }

  async updateVariant(variantId, { price, inventory_quantity, title, sku }) {
    const res = await pool.query(`
      UPDATE product_variants
      SET 
        price = COALESCE($1, price),
        inventory_quantity = COALESCE($2, inventory_quantity),
        title = COALESCE($3, title),
        sku = COALESCE($4, sku)
      WHERE id = $5
      RETURNING *;
    `, [price, inventory_quantity, title, sku, variantId]);

    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy biến thể sản phẩm' };
    }
    return res.rows[0];
  }
}

module.exports = new ProductService();
