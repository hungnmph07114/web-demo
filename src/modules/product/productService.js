const { pool } = require('../../config/db');

class ProductService {
  async getStoreSettings() {
    const res = await pool.query('SELECT * FROM store_settings WHERE id = 1 LIMIT 1');
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    const insertRes = await pool.query(`
      INSERT INTO store_settings (id, store_name, store_tagline)
      VALUES (1, 'ATELIER & CO.', 'Curated Multi-Category Store')
      ON CONFLICT (id) DO UPDATE SET store_name = EXCLUDED.store_name
      RETURNING *;
    `);
    return insertRes.rows[0];
  }

  async updateStoreSettings({
    store_name,
    store_tagline,
    hero_badge,
    hero_title,
    hero_highlight,
    hero_subtitle,
    hero_image,
    default_theme,
    unit_label,
    preset_key,
    bank_id,
    bank_name,
    bank_account_no,
    bank_account_name,
    base_shipping_fee,
    free_shipping_threshold,
    store_phone,
    store_address
  }) {
    await this.getStoreSettings();
    const res = await pool.query(
      `
      UPDATE store_settings
      SET
        store_name = COALESCE($1, store_name),
        store_tagline = COALESCE($2, store_tagline),
        hero_badge = COALESCE($3, hero_badge),
        hero_title = COALESCE($4, hero_title),
        hero_highlight = COALESCE($5, hero_highlight),
        hero_subtitle = COALESCE($6, hero_subtitle),
        hero_image = COALESCE($7, hero_image),
        default_theme = COALESCE($8, default_theme),
        unit_label = COALESCE($9, unit_label),
        preset_key = COALESCE($10, preset_key),
        bank_id = COALESCE($11, bank_id),
        bank_name = COALESCE($12, bank_name),
        bank_account_no = COALESCE($13, bank_account_no),
        bank_account_name = COALESCE($14, bank_account_name),
        base_shipping_fee = COALESCE($15, base_shipping_fee),
        free_shipping_threshold = COALESCE($16, free_shipping_threshold),
        store_phone = COALESCE($17, store_phone),
        store_address = COALESCE($18, store_address),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *;
    `,
      [
        store_name,
        store_tagline,
        hero_badge,
        hero_title,
        hero_highlight,
        hero_subtitle,
        hero_image,
        default_theme,
        unit_label,
        preset_key,
        bank_id,
        bank_name,
        bank_account_no,
        bank_account_name,
        base_shipping_fee !== undefined && base_shipping_fee !== '' ? parseFloat(base_shipping_fee) : null,
        free_shipping_threshold !== undefined && free_shipping_threshold !== '' ? parseFloat(free_shipping_threshold) : null,
        store_phone,
        store_address
      ]
    );
    return res.rows[0];
  }

  async listCategories() {
    const res = await pool.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT p.id)::int AS products_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    return res.rows;
  }

  async createCategory({ name, slug, description, icon }) {
    if (!name || !name.trim()) {
      throw { status: 400, message: 'Tên danh mục không được để trống' };
    }
    const cleanSlug =
      (slug && slug.trim()) ||
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

    const res = await pool.query(
      `
      INSERT INTO categories (name, slug, description, icon)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [name.trim(), cleanSlug, description || '', icon || '🛍️']
    );
    return res.rows[0];
  }

  async deleteCategory(id) {
    const res = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy danh mục cần xóa' };
    }
    return true;
  }

  async listProducts({ categorySlug, search, priceRange, inStockOnly, sortBy, includeUnpublished, page, limit } = {}) {
    const showAll = includeUnpublished === 'true' || includeUnpublished === true;
    let query = `
      SELECT 
        p.id,
        p.title,
        p.subtitle,
        p.slug,
        p.description,
        p.thumbnail,
        p.is_published,
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
      WHERE ${showAll ? '1=1' : 'p.is_published = true'}
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
    `;

    const havingClauses = [];
    if (priceRange === 'under500k') {
      havingClauses.push('COALESCE(MIN(v.price), 0) < 500000');
    } else if (priceRange === '500kTo2m') {
      havingClauses.push('COALESCE(MIN(v.price), 0) >= 500000 AND COALESCE(MIN(v.price), 0) <= 2000000');
    } else if (priceRange === '2mTo10m') {
      havingClauses.push('COALESCE(MIN(v.price), 0) > 2000000 AND COALESCE(MIN(v.price), 0) <= 10000000');
    } else if (priceRange === 'over10m') {
      havingClauses.push('COALESCE(MIN(v.price), 0) > 10000000');
    } else if (priceRange === 'under10m') {
      havingClauses.push('COALESCE(MIN(v.price), 0) < 10000000');
    } else if (priceRange === '10to30m') {
      havingClauses.push('COALESCE(MIN(v.price), 0) >= 10000000 AND COALESCE(MIN(v.price), 0) <= 30000000');
    } else if (priceRange === 'over30m') {
      havingClauses.push('COALESCE(MIN(v.price), 0) > 30000000');
    }

    if (inStockOnly === 'true' || inStockOnly === true) {
      havingClauses.push('COALESCE(SUM(v.inventory_quantity), 0) > 0');
    }

    if (havingClauses.length > 0) {
      query += ` HAVING ${havingClauses.join(' AND ')}`;
    }

    if (sortBy === 'price_asc') {
      query += ' ORDER BY COALESCE(MIN(v.price), 0) ASC, p.id DESC';
    } else if (sortBy === 'price_desc') {
      query += ' ORDER BY COALESCE(MIN(v.price), 0) DESC, p.id DESC';
    } else if (sortBy === 'rating_desc') {
      query += ' ORDER BY COALESCE(ROUND(AVG(r.rating), 1), 5.0) DESC, COUNT(DISTINCT r.id) DESC, p.id DESC';
    } else {
      query += ' ORDER BY p.id DESC';
    }

    if (limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * pageSize;
      params.push(pageSize, offset);
      query += ` LIMIT ${params.length - 1} OFFSET ${params.length}`;
    }

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

    const optionsRes = await pool.query(`
      SELECT id, title FROM product_options WHERE product_id = $1 ORDER BY id ASC
    `, [product.id]);

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

      for (const optTitle of options) {
        if (optTitle && optTitle.trim()) {
          await client.query(`
            INSERT INTO product_options (product_id, title) VALUES ($1, $2);
          `, [product.id, optTitle.trim()]);
        }
      }

      for (const v of variants) {
        await client.query(`
          INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [
          product.id,
          v.title || `${product.title} - Tiêu chuẩn`,
          v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          v.price || 0,
          v.original_price || null,
          v.inventory_quantity ?? 10,
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
    `, [
      title !== undefined ? title : null,
      subtitle !== undefined ? subtitle : null,
      description !== undefined ? description : null,
      thumbnail !== undefined ? thumbnail : null,
      category_id !== undefined && category_id !== '' ? parseInt(category_id, 10) : null,
      typeof is_published === 'boolean' ? is_published : null,
      id
    ]);

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

  async updateVariant(variantId, { price, original_price, inventory_quantity, title, sku }) {
    const res = await pool.query(`
      UPDATE product_variants
      SET 
        price = COALESCE($1, price),
        original_price = $2,
        inventory_quantity = COALESCE($3, inventory_quantity),
        title = COALESCE($4, title),
        sku = COALESCE($5, sku)
      WHERE id = $6
      RETURNING *;
    `, [
      price !== undefined ? parseFloat(price) : null,
      original_price !== undefined && original_price !== '' && original_price !== null ? parseFloat(original_price) : null,
      inventory_quantity !== undefined ? parseInt(inventory_quantity, 10) : null,
      title || null,
      sku || null,
      variantId
    ]);

    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy biến thể sản phẩm' };
    }
    return res.rows[0];
  }

  async createVariant(productId, { title, sku, price, original_price, inventory_quantity, options_json, thumbnail }) {
    if (!title || !sku) {
      throw { status: 400, message: 'Vui lòng nhập Tên biến thể và Mã SKU' };
    }
    const res = await pool.query(
      `
      INSERT INTO product_variants (product_id, title, sku, price, original_price, inventory_quantity, options_json, thumbnail)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
      [
        productId,
        title.trim(),
        sku.trim().toUpperCase(),
        parseFloat(price) || 0,
        original_price ? parseFloat(original_price) : null,
        parseInt(inventory_quantity, 10) || 0,
        JSON.stringify(options_json || { 'Phân loại': title.trim() }),
        thumbnail || null
      ]
    );
    return res.rows[0];
  }

  async deleteVariant(variantId) {
    const countRes = await pool.query(
      `SELECT product_id, (SELECT COUNT(*) FROM product_variants pv2 WHERE pv2.product_id = pv1.product_id AND pv2.is_active = true)::int AS total_variants
       FROM product_variants pv1 WHERE pv1.id = $1`,
      [variantId]
    );
    if (countRes.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy biến thể cần xóa' };
    }
    if (countRes.rows[0].total_variants <= 1) {
      throw { status: 400, message: 'Sản phẩm phải có tối thiểu 1 biến thể đang hoạt động' };
    }
    await pool.query('DELETE FROM product_variants WHERE id = $1', [variantId]);
    return true;
  }
}

module.exports = new ProductService();

