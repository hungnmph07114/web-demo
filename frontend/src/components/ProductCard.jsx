import React from 'react';
import { formatMoney } from '../services/api';
import { ArrowRight } from 'lucide-react';

export default function ProductCard({ product, onSelect }) {
  const minPrice = parseFloat(product.min_price);
  const maxPrice = parseFloat(product.max_price);
  const priceDisplay = minPrice === maxPrice
    ? formatMoney(minPrice)
    : `${formatMoney(minPrice)} - ${formatMoney(maxPrice)}`;

  return (
    <div className="product-card" onClick={() => onSelect(product.id)}>
      <div className="product-thumb-box">
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
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-subtitle">{product.subtitle || product.title}</p>
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
