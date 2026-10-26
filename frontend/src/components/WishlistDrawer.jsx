import React from 'react';
import { formatMoney } from '../services/api';
import { X, Heart, Trash2, ArrowRight, Star } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems = [],
  onRemoveWishlist,
  onSelectProduct
}) {
  if (!isOpen) return null;

  return (
    <div
      className="drawer-overlay"
      onClick={(e) => e.target.classList.contains('drawer-overlay') && onClose()}
    >
      <div className="cart-drawer">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} fill="#EF4444" color="#EF4444" />
            <span>Sản Phẩm Yêu Thích</span>
            <span className="drawer-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171' }}>
              {wishlistItems.length} món
            </span>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Đóng danh sách yêu thích">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Items */}
        <div className="drawer-items-list" style={{ flex: 1, overflowY: 'auto' }}>
          {wishlistItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">💖</div>
              <h4>Danh sách yêu thích đang trống</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                Hãy thả tim ❤️ những thiết bị công nghệ bạn ấn tượng để lưu lại và theo dõi ưu đãi nhé!
              </p>
            </div>
          ) : (
            wishlistItems.map((prod) => {
              const minPrice = parseFloat(prod.min_price || 0);
              const maxPrice = parseFloat(prod.max_price || 0);
              const priceDisplay = minPrice === maxPrice
                ? formatMoney(minPrice)
                : `${formatMoney(minPrice)} - ${formatMoney(maxPrice)}`;

              return (
                <div
                  key={prod.id}
                  className="cart-item"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    alignItems: 'center'
                  }}
                >
                  <div
                    className="cart-item-thumb"
                    style={{ width: '80px', height: '80px', cursor: 'pointer' }}
                    onClick={() => {
                      onSelectProduct(prod.id);
                      onClose();
                    }}
                  >
                    <img
                      src={prod.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'}
                      alt={prod.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-cyan)',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{prod.category_icon || '📱'}</span>
                      <span>{prod.category_name || 'Công nghệ'}</span>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#fff',
                        margin: 0,
                        cursor: 'pointer',
                        lineHeight: 1.3
                      }}
                      onClick={() => {
                        onSelectProduct(prod.id);
                        onClose();
                      }}
                    >
                      {prod.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {priceDisplay}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#FBBF24' }}>
                        <Star size={11} fill="#FBBF24" color="#FBBF24" />
                        <span>{prod.average_rating || '5.0'}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        onSelectProduct(prod.id);
                        onClose();
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px'
                      }}
                    >
                      <span>Chọn cấu hình</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveWishlist(prod.id)}
                    title="Bỏ thích"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {wishlistItems.length > 0 && (
          <div className="drawer-footer" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              💡 Sản phẩm yêu thích được lưu tự động trên tài khoản của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
