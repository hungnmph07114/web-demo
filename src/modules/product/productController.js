const fs = require('fs');
const path = require('path');
const productService = require('./productService');

class ProductController {
  async getStoreSettings(req, res, next) {
    try {
      const data = await productService.getStoreSettings();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateStoreSettings(req, res, next) {
    try {
      const data = await productService.updateStoreSettings(req.body);
      res.json({
        success: true,
        message: 'Đã lưu cấu hình thương hiệu, ngân hàng VietQR & phí vận chuyển thành công',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadImage(req, res, next) {
    try {
      const { fileName, dataUrl } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu hình ảnh không hợp lệ (chỉ hỗ trợ PNG, JPG, WEBP, SVG, GIF)'
        });
      }

      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng Base64 của ảnh không hợp lệ'
        });
      }

      const mimeSub = matches[1].toLowerCase();
      const base64Data = matches[2];
      let ext = 'jpg';
      if (mimeSub.includes('png')) ext = 'png';
      else if (mimeSub.includes('webp')) ext = 'webp';
      else if (mimeSub.includes('svg')) ext = 'svg';
      else if (mimeSub.includes('gif')) ext = 'gif';

      const safeBaseName = String(fileName || 'image')
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .slice(0, 40) || 'product';

      const finalFileName = `${safeBaseName}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(base64Data, 'base64');

      const publicUploadsDir = path.join(__dirname, '..', '..', '..', 'public', 'uploads');
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicUploadsDir, finalFileName), buffer);

      const url = `/uploads/${finalFileName}`;
      res.status(201).json({
        success: true,
        message: 'Đã tải ảnh lên máy chủ thành công!',
        data: { url, fileName: finalFileName }
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req, res, next) {
    try {
      const data = await productService.listCategories();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const data = await productService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Đã thêm danh mục ngành hàng mới thành công',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await productService.deleteCategory(req.params.id);
      res.json({
        success: true,
        message: 'Đã xóa danh mục ngành hàng'
      });
    } catch (err) {
      next(err);
    }
  }

  async getProducts(req, res, next) {
    try {
      const { category, search, priceRange, inStockOnly, sortBy, includeUnpublished } = req.query;
      const data = await productService.listProducts({
        categorySlug: category,
        search,
        priceRange,
        inStockOnly,
        sortBy,
        includeUnpublished
      });
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  async getProductByIdOrSlug(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      const data = await productService.getProductDetails(idOrSlug);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm và các biến thể thành công',
        data: product
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật thông tin sản phẩm thành công',
        data: product
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      res.json({
        success: true,
        message: 'Đã xóa sản phẩm và các biến thể liên quan'
      });
    } catch (err) {
      next(err);
    }
  }

  async updateVariant(req, res, next) {
    try {
      const { variantId } = req.params;
      const variant = await productService.updateVariant(variantId, req.body);
      res.json({
        success: true,
        message: 'Cập nhật giá và tồn kho biến thể thành công',
        data: variant
      });
    } catch (err) {
      next(err);
    }
  }

  async createVariant(req, res, next) {
    try {
      const { id } = req.params;
      const variant = await productService.createVariant(id, req.body);
      res.status(201).json({
        success: true,
        message: 'Đã thêm biến thể SKU mới thành công',
        data: variant
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteVariant(req, res, next) {
    try {
      const { variantId } = req.params;
      await productService.deleteVariant(variantId);
      res.json({
        success: true,
        message: 'Đã xóa biến thể sản phẩm'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();

