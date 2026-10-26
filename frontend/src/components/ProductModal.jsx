import React, { useState, useEffect, useMemo } from 'react';
import { formatMoney } from '../services/api';
import { X, ShoppingCart, Plus, Minus, Star, Heart } from 'lucide-react';
import ProductReviews from './ProductReviews';

export default function ProductModal({
  product,
  storeSettings,
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
  const [imgError, setImgError] = useState(false);

  const unitLabel = storeSettings?.unit_label || 'sản phẩm';

  // Initialize default options from the first variant
  useEffect(() => {
    setImgError(false);
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
      onToast('Vui lòng chọn phiên bản sản phẩm hợp lệ', 'error');
      return;
    }
    if (activeVariant.inventory_quantity < quantity) {
      onToast(`Kho chỉ còn ${activeVariant.inventory_quantity} ${unitLabel}`, 'error');
      return;
    }
    onAddToCart(product, activeVariant, quantity);
  };

  const rawImage = activeVariant?.thumbnail || product.thumbnail;
  const displayImage = !imgError && rawImage ? rawImage : '/assets/editorial/hero-flagship.svg';

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div className="product-modal-grid">
          {/* Gallery */}
          <div className="modal-gallery">
            <img
              src={displayImage}
              alt={product.title}
              className="modal-main-img"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          </div>

          {/* Details */}
          <div className="modal-details">
            <div className="product-meta-line" style={{ marginBottom: '4px' }}>
              <span>{product.category_icon || '🛍️'} {product.category_name || 'Bộ sưu tập'}</span>
              <span aria-hidden="true">·</span>
              <span>Mã SKU: {activeVariant ? activeVariant.sku : '---'}</span>
            </div>

            <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)' }}>{product.title}</h2>
            <p className="modal-subtitle">{product.subtitle || product.title}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 16px 0' }}>
              <div style={{ display: 'flex', gap: '3px', color: 'var(--accent-amber)' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    fill={star <= Math.round(Number(product.average_rating || 5)) ? 'currentColor' : 'transparent'}
                    color="currentColor"
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                {product.average_rating || '5.0'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                · {product.reviews_count || 0} lượt đánh giá
              </span>
            </div>

            {/* Price Box */}
            <div className="modal-price-box" style={{ paddingBottom: '14px', borderBottom: '1px solid var(--border-glass)' }}>
              <span className="modal-current-price" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {activeVariant ? formatMoney(activeVariant.price) : '0đ'}
              </span>
              {activeVariant?.original_price && parseFloat(activeVariant.original_price) > parseFloat(activeVariant.price) && (
                <span className="modal-original-price" style={{ fontVariantNumeric: 'tabular-nums' }}>
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
                  style={
                    activeVariant.inventory_quantity <= 0
                      ? { background: 'rgba(190, 18, 60, 0.15)', color: 'var(--accent-rose)' }
                      : {}
                  }
                >
                  {activeVariant.inventory_quantity <= 0
                    ? 'Tạm hết hàng'
                    : activeVariant.inventory_quantity <= 5
                    ? `Chỉ còn ${activeVariant.inventory_quantity} ${unitLabel}`
                    : `Còn hàng (${activeVariant.inventory_quantity} ${unitLabel})`}
                </span>
              )}
            </div>

            {/* Dynamic Options */}
            <div className="options-container" style={{ marginTop: '16px' }}>
              {Object.entries(optionsMap).map(([optTitle, values]) => {
                const currentSelected = selectedOptions[optTitle] || values[0];
                return (
                  <div key={optTitle} className="option-group">
                    <div className="option-group-title">
                      {optTitle}: <strong style={{ color: 'var(--text-main)' }}>{currentSelected}</strong>
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
              <h4>Thông tin &amp; Chất liệu sản phẩm</h4>
              <p>{product.description || 'Chưa có mô tả chi tiết.'}</p>
            </div>

            {/* Actions Bar */}
            <div className="modal-actions-bar">
              <div className="qty-selector">
                <button
                  type="button"
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
                  type="button"
                  className="qty-btn"
                  onClick={() => {
                    const max = activeVariant ? activeVariant.inventory_quantity : 99;
                    if (quantity < max) setQuantity((q) => q + 1);
                    else onToast(`Kho chỉ còn ${max} ${unitLabel}`, 'info');
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
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
                  height: '44px',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: isWishlisted ? '#BE123C' : undefined,
                  background: isWishlisted ? 'rgba(190, 18, 60, 0.1)' : undefined
                }}
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? '#BE123C' : 'transparent'}
                  color={isWishlisted ? '#BE123C' : 'var(--text-main)'}
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
