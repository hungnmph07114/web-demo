import React, { useState } from 'react';
import { formatMoney } from '../services/api';
import { ArrowRight, Star, Heart } from 'lucide-react';

export default function ProductCard({ product, onSelect, isWishlisted, onToggleWishlist }) {
  const [imgError, setImgError] = useState(false);

  const minPrice = parseFloat(product.min_price);
  const maxPrice = parseFloat(product.max_price);
  const priceDisplay =
    minPrice === maxPrice
      ? formatMoney(minPrice)
      : `${formatMoney(minPrice)} – ${formatMoney(maxPrice)}`;

  const imageSrc =
    !imgError && product.thumbnail
      ? product.thumbnail
      : '/assets/editorial/hero-flagship.svg';

  return (
    <div className="product-card" onClick={() => onSelect(product.id)}>
      <div className="product-thumb-box">
        <img
          src={imageSrc}
          alt={product.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product.id);
          }}
          title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 5,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.15s ease'
          }}
        >
          <Heart
            size={15}
            fill={isWishlisted ? '#BE123C' : 'transparent'}
            color={isWishlisted ? '#BE123C' : 'var(--text-main)'}
          />
        </button>
      </div>

      <div className="product-info">
        {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
        <div className="product-meta-line">
          <span>{product.category_name || 'Bộ sưu tập'}</span>
          <span aria-hidden="true">·</span>
          <span>{product.variants_count} phiên bản</span>
          <span aria-hidden="true">·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-amber)' }}>
            <Star size={11} fill="currentColor" />
            <span>{product.average_rating || '5.0'}</span>
          </span>
        </div>

        <h3 className="product-title">{product.title}</h3>
        <p className="product-subtitle">{product.subtitle || product.title}</p>

        <div className="product-bottom">
          <div className="price-range">
            <span className="price-label">Giá bán</span>
            <span className="price-val">{priceDisplay}</span>
          </div>
          <button type="button" className="btn-card-select">
            <span>Tùy chọn</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
