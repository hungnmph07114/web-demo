import React from 'react';
import { ShoppingCart, Search, X, User, Shield, Store, Zap, Truck, ShoppingBag, Heart } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  user,
  cartCount,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist,
  onOpenAuth,
  onOpenTracking,
  onOpenMyOrders,
  onLogout
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="logo-group" onClick={() => setViewMode('store')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <Zap size={22} />
          </div>
          <div className="logo-text">
            <span className="brand-name">TechPulse</span>
            <span className="brand-tag">Modular Engine v2</span>
          </div>
        </div>

        {/* Live Search Box */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm iPhone, MacBook, Sony, SKU biến thể..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation & Controls */}
        <nav className="nav-actions">
          {/* Order Tracking Button */}
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            onClick={onOpenTracking}
            title="Tra cứu tình trạng đơn hàng & VietQR"
          >
            <Truck size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span>Tra cứu đơn</span>
          </button>

          {/* View Mode Switcher */}
          <div className="view-switch-pill">
            <button
              className={`switch-btn ${viewMode === 'store' ? 'active' : ''}`}
              onClick={() => setViewMode('store')}
            >
              <Store size={15} />
              <span>Cửa hàng</span>
            </button>
            <button
              className={`switch-btn ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              <Shield size={15} />
              <span>Quản trị</span>
            </button>
          </div>

          {/* User Auth Info */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: user.role === 'admin' ? 'var(--accent-amber)' : 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {user.role === 'admin' ? '👑' : '👤'} {user.full_name}
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                onClick={onOpenMyOrders}
                title="Xem lịch sử đơn hàng đã đặt"
              >
                <ShoppingBag size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>Đơn của tôi</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={onLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button className="btn-auth" onClick={onOpenAuth}>
              <User size={16} />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Wishlist Button */}
          <button
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative'
            }}
            onClick={onOpenWishlist}
            title="Xem danh sách sản phẩm yêu thích"
          >
            <Heart
              size={15}
              fill={wishlistCount > 0 ? '#EF4444' : 'transparent'}
              color={wishlistCount > 0 ? '#EF4444' : 'var(--text-muted)'}
            />
            <span>Yêu thích</span>
            {wishlistCount > 0 && (
              <span
                style={{
                  background: '#EF4444',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginLeft: '2px'
                }}
              >
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button className="btn-cart" onClick={onOpenCart} aria-label="Giỏ hàng">
            <ShoppingCart size={20} />
            <span className="cart-badge">{cartCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
