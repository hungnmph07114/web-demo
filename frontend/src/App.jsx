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
import Toast from './components/Toast';
import { fetchApi } from './services/api';

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('store'); // 'store' | 'admin'

  // Data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Modals
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

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

  // Load Categories
  useEffect(() => {
    fetchApi('/api/products/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Load Products (filter by category & search)
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
      const res = await fetchApi(`/api/products?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      addToast('Lỗi tải danh sách sản phẩm', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [activeCategory, searchQuery, addToast]);

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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      {/* Header */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={handleSwitchView}
        user={user}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="main-container">
        {viewMode === 'store' ? (
          <div>
            {/* Hero */}
            <HeroBanner
              onCopyVoucher={(code) => {
                navigator.clipboard.writeText(code);
                addToast(`Đã sao chép mã ${code}!`);
              }}
            />

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />

            {/* Products Header */}
            <div className="products-header">
              <h2 className="section-title">Danh Sách Sản Phẩm Công Nghệ</h2>
              <span className="products-count-badge">
                {isLoadingProducts ? 'Đang tải...' : `Hiển thị ${products.length} sản phẩm`}
              </span>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={(id) => setSelectedProductId(id)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Admin Portal */
          <AdminPortal
            token={token}
            onToast={addToast}
            onOpenProductModal={(id) => setSelectedProductId(id)}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductModal
        product={detailedProduct}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={handleAddToCart}
        onToast={addToast}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
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
        onAuthSuccess={handleAuthSuccess}
        onToast={addToast}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        onToast={addToast}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
