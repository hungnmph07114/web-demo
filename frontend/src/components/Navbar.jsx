import React from 'react';
import { ShoppingCart, Search, X, User, Shield, Store, Truck, ShoppingBag, Heart, Sun, Moon } from 'lucide-react';

export default function Navbar({
  storeSettings,
  themeMode = 'light',
  onToggleTheme,
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
  const storeName = storeSettings?.store_name || 'ATELIER & CO.';
  const storeTagline = storeSettings?.store_tagline || 'Curated Multi-Category Store';

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="logo-group" onClick={() => setViewMode('store')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <Store size={20} />
          </div>
          <div className="logo-text">
            <span className="brand-name">{storeName}</span>
            <span className="brand-tag">{storeTagline}</span>
          </div>
        </div>

        {/* Live Search Box */}
        <div className="search-box">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm thời trang, nội thất, mỹ phẩm, cà phê hoặc mã SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Xóa tìm kiếm">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation & Controls */}
        <nav className="nav-actions">
          {/* Theme Switcher (Editorial Light / Studio Dark) */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '7px 11px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-md)',
              whiteSpace: 'nowrap'
            }}
            onClick={onToggleTheme}
            title={themeMode === 'light' ? 'Chuyển sang giao diện Tối (Studio Dark)' : 'Chuyển sang giao diện Sáng (Editorial Light)'}
          >
            {themeMode === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            <span>{themeMode === 'light' ? 'Tối' : 'Sáng'}</span>
          </button>

          {/* Order Tracking Button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '7px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-md)',
              whiteSpace: 'nowrap'
            }}
            onClick={onOpenTracking}
            title="Tra cứu tình trạng đơn hàng & VietQR"
          >
            <Truck size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span>Tra cứu đơn</span>
          </button>

          {/* View Mode Switcher */}
          <div className="view-switch-pill">
            <button
              type="button"
              className={`switch-btn ${viewMode === 'store' ? 'active' : ''}`}
              onClick={() => setViewMode('store')}
            >
              <Store size={14} />
              <span>Cửa hàng</span>
            </button>
            <button
              type="button"
              className={`switch-btn ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              <Shield size={14} />
              <span>Quản trị</span>
            </button>
          </div>

          {/* User Auth Info */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={onOpenAuth}
                className="btn btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: user.role === 'admin' ? 'var(--accent-amber)' : 'var(--text-main)',
                  borderRadius: 'var(--radius-md)',
                  whiteSpace: 'nowrap'
                }}
                title="Cập nhật hồ sơ & Đổi mật khẩu bảo mật"
              >
                <User size={13} />
                <span>{user.full_name}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
                onClick={onOpenMyOrders}
                title="Xem lịch sử đơn hàng đã đặt"
              >
                <ShoppingBag size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>Đơn của tôi</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
                onClick={onLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button type="button" className="btn-auth" onClick={onOpenAuth}>
              <User size={15} />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '7px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              whiteSpace: 'nowrap'
            }}
            onClick={onOpenWishlist}
            title="Xem danh sách sản phẩm yêu thích"
          >
            <Heart
              size={15}
              fill={wishlistCount > 0 ? '#BE123C' : 'transparent'}
              color={wishlistCount > 0 ? '#BE123C' : 'var(--text-muted)'}
            />
            <span>Yêu thích</span>
            {wishlistCount > 0 && (
              <span
                style={{
                  fontWeight: 700,
                  color: '#BE123C',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                ({wishlistCount})
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button type="button" className="btn-cart" onClick={onOpenCart} aria-label="Giỏ hàng">
            <ShoppingCart size={18} />
            <span className="cart-badge">{cartCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
