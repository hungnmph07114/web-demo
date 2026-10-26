import React from 'react';
import { formatMoney } from '../services/api';
import { ArrowRight, Star, Heart } from 'lucide-react';

export default function ProductCard({ product, onSelect, isWishlisted, onToggleWishlist }) {
  const minPrice = parseFloat(product.min_price);
  const maxPrice = parseFloat(product.max_price);
  const priceDisplay = minPrice === maxPrice
    ? formatMoney(minPrice)
    : `${formatMoney(minPrice)} - ${formatMoney(maxPrice)}`;

  return (
    <div className="product-card" onClick={() => onSelect(product.id)}>
      <div className="product-thumb-box" style={{ position: 'relative' }}>
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'}
          alt={product.title}
          loading="lazy"
        />
        <span className="card-cat-badge">
          {product.category_icon || '📱'} {product.category_name || 'Công nghệ'}
        </span>
        <span className="card-variants-badge">
          {product.variants_count} biến thể
        </span>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product.id);
          }}
          title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 5,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: isWishlisted ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, border-color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart
            size={16}
            fill={isWishlisted ? '#EF4444' : 'transparent'}
            color={isWishlisted ? '#EF4444' : '#fff'}
          />
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-subtitle">{product.subtitle || product.title}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#FBBF24', margin: '6px 0 10px 0' }}>
          <Star size={13} fill="#FBBF24" color="#FBBF24" />
          <span style={{ fontWeight: 700 }}>{product.average_rating || '5.0'}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({product.reviews_count || 0} đánh giá)</span>
        </div>
        <div className="product-bottom">
          <div className="price-range">
            <span className="price-label">Giá từ</span>
            <span className="price-val">{priceDisplay}</span>
          </div>
          <button className="btn-card-select">
            <span>Chọn cấu hình</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
