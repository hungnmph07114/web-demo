import React, { useState, useEffect, useMemo } from 'react';
import { formatMoney } from '../services/api';
import { X, ShoppingCart, Plus, Minus, Star, Heart } from 'lucide-react';
import ProductReviews from './ProductReviews';

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  onToast,
  token,
  currentUser,
  isWishlisted,
  onToggleWishlist
}) {
  if (!product) return null;

  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Initialize default options from the first variant
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      const optJson = defaultVariant.options_json || {};
      const initial = {};
      for (const [k, v] of Object.entries(optJson)) {
        initial[k] = v;
      }
      setSelectedOptions(initial);
      setQuantity(1);
    }
  }, [product]);

  // Map available options from variants
  const optionsMap = useMemo(() => {
    const map = {};
    if (product.options) {
      product.options.forEach((opt) => {
        map[opt.title] = new Set();
      });
    }
    if (product.variants) {
      product.variants.forEach((v) => {
        const vOpts = v.options_json || {};
        for (const [k, val] of Object.entries(vOpts)) {
          if (!map[k]) map[k] = new Set();
          map[k].add(val);
        }
      });
    }
    const result = {};
    for (const [k, set] of Object.entries(map)) {
      result[k] = Array.from(set);
    }
    return result;
  }, [product]);

  // Resolve matching active variant
  const activeVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;

    const matched = product.variants.find((v) => {
      const vOpts = v.options_json || {};
      for (const [k, val] of Object.entries(selectedOptions)) {
        if (vOpts[k] !== val) return false;
      }
      return true;
    });

    return matched || product.variants[0];
  }, [product, selectedOptions]);

  const handleOptionClick = (optTitle, val) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optTitle]: val
    }));
  };

  const handleAdd = () => {
    if (!activeVariant) {
      onToast('Vui lòng chọn cấu hình sản phẩm hợp lệ', 'error');
      return;
    }
    if (activeVariant.inventory_quantity < quantity) {
      onToast(`Kho chỉ còn ${activeVariant.inventory_quantity} sản phẩm`, 'error');
      return;
    }
    onAddToCart(product, activeVariant, quantity);
  };

  const displayImage = activeVariant?.thumbnail || product.thumbnail;

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div className="product-modal-grid">
          {/* Gallery */}
          <div className="modal-gallery">
            <img src={displayImage} alt={product.title} className="modal-main-img" />
          </div>

          {/* Details */}
          <div className="modal-details">
            <span className="badge">
              {product.category_icon || '📱'} {product.category_name || 'Công nghệ'}
            </span>
            <h2 className="modal-title">{product.title}</h2>
            <p className="modal-subtitle">{product.subtitle || product.title}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px 0' }}>
              <div style={{ display: 'flex', gap: '3px', color: '#FBBF24' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.round(Number(product.average_rating || 5)) ? '#FBBF24' : 'transparent'}
                    color="#FBBF24"
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                {product.average_rating || '5.0'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                • ({product.reviews_count || 0} lượt đánh giá)
              </span>
            </div>

            {/* Price Box */}
            <div className="modal-price-box">
              <span className="modal-current-price">
                {activeVariant ? formatMoney(activeVariant.price) : '0đ'}
              </span>
              {activeVariant?.original_price && parseFloat(activeVariant.original_price) > parseFloat(activeVariant.price) && (
                <span className="modal-original-price">
                  {formatMoney(activeVariant.original_price)}
                </span>
              )}
              {activeVariant && (
                <span
                  className={`stock-pill ${
                    activeVariant.inventory_quantity <= 0
                      ? ''
                      : activeVariant.inventory_quantity <= 5
                      ? 'low-stock'
                      : 'in-stock'
                  }`}
                  style={activeVariant.inventory_quantity <= 0 ? { background: 'rgba(239, 68, 68, 0.2)', color: '#F87171' } : {}}
                >
                  {activeVariant.inventory_quantity <= 0
                    ? 'Hết hàng'
                    : activeVariant.inventory_quantity <= 5
                    ? `Chỉ còn ${activeVariant.inventory_quantity} máy`
                    : `Còn hàng (${activeVariant.inventory_quantity} máy)`}
                </span>
              )}
            </div>

            {/* SKU */}
            <div className="variant-sku-bar">
              <span>Mã SKU: <strong>{activeVariant ? activeVariant.sku : '---'}</strong></span>
            </div>

            {/* Dynamic Options */}
            <div className="options-container">
              {Object.entries(optionsMap).map(([optTitle, values]) => {
                const currentSelected = selectedOptions[optTitle] || values[0];
                return (
                  <div key={optTitle} className="option-group">
                    <div className="option-group-title">
                      Chọn {optTitle}: <strong style={{ color: '#fff' }}>{currentSelected}</strong>
                    </div>
                    <div className="option-values-row">
                      {values.map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`option-pill-btn ${val === currentSelected ? 'selected' : ''}`}
                          onClick={() => handleOptionClick(optTitle, val)}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="modal-desc-box">
              <h4>Mô tả sản phẩm</h4>
              <p>{product.description || 'Chưa có mô tả chi tiết.'}</p>
            </div>

            {/* Actions Bar */}
            <div className="modal-actions-bar">
              <div className="qty-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const max = activeVariant ? activeVariant.inventory_quantity : 99;
                    setQuantity(Math.min(max, Math.max(1, val)));
                  }}
                  min="1"
                  max={activeVariant?.inventory_quantity || 99}
                />
                <button
                  className="qty-btn"
                  onClick={() => {
                    const max = activeVariant ? activeVariant.inventory_quantity : 99;
                    if (quantity < max) setQuantity((q) => q + 1);
                    else onToast(`Kho chỉ còn ${max} sản phẩm`, 'info');
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                className="btn btn-primary btn-add-cart"
                onClick={handleAdd}
                disabled={!activeVariant || activeVariant.inventory_quantity <= 0}
                style={{ flex: 1 }}
              >
                <ShoppingCart size={18} />
                <span>Thêm vào giỏ hàng</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                title={isWishlisted ? 'Đã lưu vào yêu thích (Bấm để bỏ)' : 'Lưu vào danh sách yêu thích'}
                style={{
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: isWishlisted ? '#EF4444' : undefined,
                  background: isWishlisted ? 'rgba(239, 68, 68, 0.15)' : undefined
                }}
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? '#EF4444' : 'transparent'}
                  color={isWishlisted ? '#EF4444' : '#fff'}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Star Ratings */}
        <ProductReviews
          productId={product.id}
          token={token}
          currentUser={currentUser}
          onToast={onToast}
        />
      </div>
    </div>
  );
}
