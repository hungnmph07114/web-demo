const productService = require('./productService');

class ProductController {
  async getCategories(req, res, next) {
    try {
      const data = await productService.listCategories();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getProducts(req, res, next) {
    try {
      const { category, search } = req.query;
      const data = await productService.listProducts({ categorySlug: category, search });
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
}

module.exports = new ProductController();
