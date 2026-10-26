import React from 'react';

export default function CategoryFilter({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="category-bar">
      <div className="category-tabs">
        <button
          className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          <span>⚡</span>
          <span>Tất cả sản phẩm</span>
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            className={`cat-pill ${activeCategory === c.slug ? 'active' : ''}`}
            onClick={() => onSelectCategory(c.slug)}
          >
            <span>{c.icon || '📱'}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
