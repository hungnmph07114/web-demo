import React from 'react';
import { SlidersHorizontal, ArrowUpDown, CheckCircle2, RotateCcw } from 'lucide-react';

export default function CategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
  priceRange = 'all',
  onSelectPriceRange,
  inStockOnly = false,
  onToggleInStock,
  sortBy = 'newest',
  onSelectSort
}) {
  const hasActiveFilters =
    activeCategory !== 'all' || priceRange !== 'all' || inStockOnly || sortBy !== 'newest';

  return (
    <div className="category-bar" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="category-tabs">
        <button
          type="button"
          className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          <span>🛍️</span>
          <span>Tất cả ngành hàng</span>
        </button>

        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`cat-pill ${activeCategory === c.slug ? 'active' : ''}`}
            onClick={() => onSelectCategory(c.slug)}
          >
            <span>{c.icon || '🏷️'}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Universal Retail Filter & Sort Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginRight: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <SlidersHorizontal size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Khoảng giá:</span>
          </div>

          {[
            { id: 'all', label: 'Mọi mức giá' },
            { id: 'under500k', label: 'Dưới 500K' },
            { id: '500kTo2m', label: '500K – 2 Triệu' },
            { id: '2mTo10m', label: '2 – 10 Triệu' },
            { id: 'over10m', label: 'Trên 10 Triệu' }
          ].map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => onSelectPriceRange && onSelectPriceRange(range.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border:
                  priceRange === range.id
                    ? '1px solid var(--text-main)'
                    : '1px solid var(--border-glass)',
                background:
                  priceRange === range.id
                    ? 'var(--text-main)'
                    : 'var(--bg-surface-elevated)',
                color: priceRange === range.id ? 'var(--bg-surface)' : 'var(--text-muted)',
                transition: 'var(--transition-fast)'
              }}
            >
              {range.label}
            </button>
          ))}

          {/* In-stock Toggle */}
          <button
            type="button"
            onClick={() => onToggleInStock && onToggleInStock(!inStockOnly)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: inStockOnly
                ? '1px solid var(--accent-emerald)'
                : '1px solid var(--border-glass)',
              background: inStockOnly
                ? 'rgba(21, 128, 61, 0.12)'
                : 'var(--bg-surface-elevated)',
              color: inStockOnly ? 'var(--accent-emerald)' : 'var(--text-muted)',
              transition: 'var(--transition-fast)'
            }}
          >
            <CheckCircle2 size={13} />
            <span>Chỉ hiện còn hàng</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onSelectCategory && onSelectCategory('all');
                onSelectPriceRange && onSelectPriceRange('all');
                onToggleInStock && onToggleInStock(false);
                onSelectSort && onSelectSort('newest');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(190, 18, 60, 0.35)',
                background: 'rgba(190, 18, 60, 0.08)',
                color: 'var(--accent-rose)'
              }}
            >
              <RotateCcw size={12} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSelectSort && onSelectSort(e.target.value)}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="rating_desc">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
}
