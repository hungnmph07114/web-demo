import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import AdminPortal from './components/AdminPortal';
import OrderTrackingModal from './components/OrderTrackingModal';
import MyOrdersModal from './components/MyOrdersModal';
import WishlistDrawer from './components/WishlistDrawer';
import Toast from './components/Toast';
import { fetchApi } from './services/api';

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('store'); // 'store' | 'admin'

  // Store Settings & Theme Mode ('light' | 'dark')
  const [storeSettings, setStoreSettings] = useState(null);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('atelier_theme_mode') || 'light';
  });

  // Data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Modals
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [trackingInitialQuery, setTrackingInitialQuery] = useState('');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Wishlist State (hybrid LocalStorage + DB)
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techpulse_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  // Cart & Voucher State
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techpulse_react_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [appliedVoucher, setAppliedVoucher] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techpulse_react_voucher') || 'null');
    } catch {
      return null;
    }
  });

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('techpulse_token') || null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techpulse_user') || 'null');
    } catch {
      return null;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('techpulse_react_cart', JSON.stringify(cart));
  }, [cart]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    localStorage.setItem('techpulse_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Sync Wishlist with backend when user is logged in
  useEffect(() => {
    if (token) {
      const localIds = (() => {
        try {
          return JSON.parse(localStorage.getItem('techpulse_wishlist') || '[]');
        } catch {
          return [];
        }
      })();

      if (localIds.length > 0) {
        fetchApi('/api/wishlist/sync', {
          method: 'POST',
          body: JSON.stringify({ productIds: localIds })
        }, token)
          .then((res) => {
            if (res.success && res.data?.productIds) {
              setWishlistIds(res.data.productIds);
            }
          })
          .catch(console.error);
      } else {
        fetchApi('/api/wishlist', {}, token)
          .then((res) => {
            if (res.success && res.data?.productIds) {
              setWishlistIds(res.data.productIds);
            }
          })
          .catch(console.error);
      }
    }
  }, [token]);

  // Sync Theme Mode with document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('atelier_theme_mode', themeMode);
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load Store Settings & Categories
  const loadCategories = useCallback(() => {
    fetchApi('/api/products/categories')
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    loadCategories();
    fetchApi('/api/store/settings')
      .then((res) => {
        if (res.data) {
          setStoreSettings(res.data);
          if (!localStorage.getItem('atelier_theme_mode') && res.data.default_theme) {
            setThemeMode(res.data.default_theme);
          }
        }
      })
      .catch((err) => console.error('Error fetching store settings:', err));
  }, [loadCategories]);

  // Load Products (filter by category, search, priceRange, inStockOnly, sortBy)
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (priceRange && priceRange !== 'all') {
        params.append('priceRange', priceRange);
      }
      if (inStockOnly) {
        params.append('inStockOnly', 'true');
      }
      if (sortBy && sortBy !== 'newest') {
        params.append('sortBy', sortBy);
      }
      const res = await fetchApi(`/api/products?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      addToast('Lỗi tải danh sách sản phẩm', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [activeCategory, searchQuery, priceRange, inStockOnly, sortBy, addToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Fetch single product details when modal is triggered
  useEffect(() => {
    if (!selectedProductId) {
      setDetailedProduct(null);
      return;
    }
    fetchApi(`/api/products/${selectedProductId}`)
      .then((res) => setDetailedProduct(res.data))
      .catch((err) => addToast(err.message, 'error'));
  }, [selectedProductId, addToast]);

  // Handle Switch View
  const handleSwitchView = (mode) => {
    if (mode === 'admin') {
      if (!user || user.role !== 'admin') {
        addToast('Vui lòng đăng nhập với tài khoản Quản trị viên (Admin)', 'info');
        setIsAuthOpen(true);
        return;
      }
    }
    setViewMode(mode);
  };

  // Cart operations
  const handleAddToCart = (product, variant, qty) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.variantId === variant.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          productId: product.id,
          productTitle: product.title,
          variantTitle: variant.title,
          sku: variant.sku,
          price: parseFloat(variant.price),
          quantity: qty,
          thumbnail: variant.thumbnail || product.thumbnail,
          maxStock: variant.inventory_quantity
        }
      ];
    });

    setSelectedProductId(null);
    setIsCartOpen(true);
    addToast(`Đã thêm "${product.title} (${variant.title})" vào giỏ hàng!`);
  };

  const handleUpdateQty = (idx, delta) => {
    setCart((prev) => {
      const item = prev[idx];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx);
      }
      if (newQty > item.maxStock) {
        addToast(`Kho chỉ còn tối đa ${item.maxStock} sản phẩm`, 'info');
        return prev;
      }
      const updated = [...prev];
      updated[idx] = { ...item, quantity: newQty };
      return updated;
    });
  };

  const handleRemoveItem = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
    addToast('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleApplyVoucher = (voucherData) => {
    setAppliedVoucher(voucherData);
    localStorage.setItem('techpulse_react_voucher', JSON.stringify(voucherData));
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    localStorage.removeItem('techpulse_react_voucher');
    addToast('Đã gỡ mã giảm giá');
  };

  // Order Submit
  const handleOrderSubmit = async (payload) => {
    const res = await fetchApi('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);

    // Clear cart on success
    setCart([]);
    setAppliedVoucher(null);
    localStorage.removeItem('techpulse_react_voucher');
    loadProducts(); // refresh stock counts
    return res.data;
  };

  // Auth operations
  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('techpulse_token', data.token);
    localStorage.setItem('techpulse_user', JSON.stringify(data.user));
    if (data.user.role === 'admin') {
      setViewMode('admin');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('techpulse_token');
    localStorage.removeItem('techpulse_user');
    setViewMode('store');
    addToast('Đã đăng xuất tài khoản');
  };

  // Wishlist toggle operation
  const handleToggleWishlist = async (productId) => {
    const isCurrentlyWishlisted = wishlistIds.includes(productId);

    if (token) {
      try {
        const res = await fetchApi('/api/wishlist/toggle', {
          method: 'POST',
          body: JSON.stringify({ productId })
        }, token);

        if (res.success && res.data) {
          setWishlistIds(res.data.productIds);
          addToast(res.message);
        }
      } catch (err) {
        addToast(err.message, 'error');
      }
    } else {
      // Khách vãng lai lưu trên LocalStorage
      if (isCurrentlyWishlisted) {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        addToast('Đã bỏ khỏi danh sách yêu thích');
      } else {
        setWishlistIds((prev) => [...prev, productId]);
        addToast('Đã thêm vào danh sách yêu thích ❤️');
      }
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      {/* Header */}
      <Navbar
        storeSettings={storeSettings}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={handleSwitchView}
        user={user}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialQuery('');
          setIsTrackingOpen(true);
        }}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="main-container">
        {viewMode === 'store' ? (
          <div>
            {/* Hero */}
            <HeroBanner
              storeSettings={storeSettings}
              onCopyVoucher={(code) => {
                navigator.clipboard.writeText(code);
                addToast(`Đã sao chép mã ưu đãi ${code}!`);
              }}
            />

            {/* Category & Advanced Filter */}
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              priceRange={priceRange}
              onSelectPriceRange={setPriceRange}
              inStockOnly={inStockOnly}
              onToggleInStock={setInStockOnly}
              sortBy={sortBy}
              onSelectSort={setSortBy}
            />

            {/* Products Header */}
            <div className="products-header">
              <h2 className="section-title">Bộ Sưu Tập Sản Phẩm Tuyển Chọn</h2>
              <span className="products-count-badge">
                {isLoadingProducts
                  ? 'Đang tải...'
                  : `Hiển thị ${products.length} ${storeSettings?.unit_label || 'sản phẩm'}`}
              </span>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={(id) => setSelectedProductId(id)}
                  isWishlisted={wishlistIds.includes(p.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Admin Portal */
          <AdminPortal
            token={token}
            storeSettings={storeSettings}
            onStoreSettingsUpdated={(updated) => {
              setStoreSettings(updated);
              if (updated.default_theme) {
                setThemeMode(updated.default_theme);
              }
            }}
            onCategoriesUpdated={() => {
              loadCategories();
              loadProducts();
            }}
            onProductsUpdated={loadProducts}
            onToast={addToast}
            onOpenProductModal={(id) => setSelectedProductId(id)}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductModal
        product={detailedProduct}
        storeSettings={storeSettings}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={handleAddToCart}
        onToast={addToast}
        token={token}
        currentUser={user}
        isWishlisted={detailedProduct ? wishlistIds.includes(detailedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        storeSettings={storeSettings}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        appliedVoucher={appliedVoucher}
        onApplyVoucher={handleApplyVoucher}
        onRemoveVoucher={handleRemoveVoucher}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onToast={addToast}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        storeSettings={storeSettings}
        appliedVoucher={appliedVoucher}
        user={user}
        onSubmitOrder={handleOrderSubmit}
        onToast={addToast}
        onSwitchToAdminOrders={() => {
          setViewMode('admin');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        token={token}
        onAuthSuccess={handleAuthSuccess}
        onProfileUpdated={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('techpulse_user', JSON.stringify(updatedUser));
        }}
        onToast={addToast}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingInitialQuery('');
        }}
        onToast={addToast}
        initialOrderQuery={trackingInitialQuery}
      />

      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        token={token}
        onToast={addToast}
        onOrderUpdated={loadProducts}
        onOpenTracking={(displayId) => {
          setTrackingInitialQuery(displayId);
          setIsTrackingOpen(true);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={products.filter((p) => wishlistIds.includes(p.id))}
        onRemoveWishlist={handleToggleWishlist}
        onSelectProduct={(id) => setSelectedProductId(id)}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
