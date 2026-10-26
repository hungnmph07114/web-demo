/**
 * TechPulse Modular E-Commerce — Frontend Orchestrator
 * Inspired by MedusaJS Architecture
 */

// Global State
const state = {
  products: [],
  categories: [],
  currentCategory: 'all',
  searchQuery: '',
  
  // Cart
  cart: JSON.parse(localStorage.getItem('techpulse_cart') || '[]'),
  appliedVoucher: JSON.parse(localStorage.getItem('techpulse_voucher') || 'null'),

  // Auth
  token: localStorage.getItem('techpulse_token') || null,
  user: JSON.parse(localStorage.getItem('techpulse_user') || 'null'),

  // Modal active product
  activeProduct: null,
  selectedOptions: {},
  activeVariant: null,

  // Admin
  adminTab: 'tabDashboard',
  orders: [],
  promotions: [],
  dashboardStats: null
};

// Utilities
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0)) + 'đ';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function copyText(text, label = 'Nội dung') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Đã sao chép ${label}: ${text}`);
  }).catch(() => {
    showToast(`Không thể sao chép tự động`, 'error');
  });
}

function copyVoucher(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Đã sao chép mã voucher ${code}! Dán vào giỏ hàng để nhận ưu đãi.`);
    const input = document.getElementById('voucherCodeInput');
    if (input) input.value = code;
  });
}

// API Helper with Auto Authorization Header
async function fetchApi(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(endpoint, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Lỗi khi gọi API');
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// ==========================================
// 1. INITIALIZATION & DATA LOADING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadCategories();
  loadProducts();
  updateAuthUI();
  updateCartBadge();
  renderDrawerCart();

  // URL hash check
  if (window.location.hash === '#admin') {
    switchView('admin');
  }
});

function initEventListeners() {
  // View Switcher
  document.getElementById('btnStoreView').addEventListener('click', () => switchView('store'));
  document.getElementById('btnAdminView').addEventListener('click', () => switchView('admin'));
  document.getElementById('logoBtn').addEventListener('click', () => switchView('store'));

  // Search
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    searchClearBtn.style.display = state.searchQuery ? 'block' : 'none';
    debounce(() => loadProducts(), 300)();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    searchClearBtn.style.display = 'none';
    loadProducts();
  });

  // Keyboard shortcut '/'
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !isModalOpen()) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Cart Drawer
  document.getElementById('openCartBtn').addEventListener('click', openCartDrawer);
  document.getElementById('closeCartDrawerBtn').addEventListener('click', closeCartDrawer);
  document.getElementById('cartDrawerOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'cartDrawerOverlay') closeCartDrawer();
  });

  // Modal Closers
  document.getElementById('closeProductModalBtn').addEventListener('click', () => closeModal('productModal'));
  document.getElementById('closeCheckoutModalBtn').addEventListener('click', () => closeModal('checkoutModal'));
  document.getElementById('closeAuthModalBtn').addEventListener('click', () => closeModal('authModal'));

  // Product Modal Qty
  document.getElementById('btnQtyMinus').addEventListener('click', () => {
    const input = document.getElementById('inputQty');
    let val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  });

  document.getElementById('btnQtyPlus').addEventListener('click', () => {
    const input = document.getElementById('inputQty');
    let val = parseInt(input.value) || 1;
    const max = state.activeVariant ? state.activeVariant.inventory_quantity : 99;
    if (val < max) input.value = val + 1;
    else showToast(`Kho chỉ còn ${max} sản phẩm cho biến thể này`, 'info');
  });

  document.getElementById('btnAddToCart').addEventListener('click', handleAddToCart);

  // Voucher Apply
  document.getElementById('btnApplyVoucher').addEventListener('click', handleApplyVoucher);

  // Checkout
  document.getElementById('btnOpenCheckout').addEventListener('click', openCheckoutModal);
  document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
  document.getElementById('btnCloseAfterVietQR').addEventListener('click', () => {
    closeModal('checkoutModal');
  });
  document.getElementById('btnViewOrderInStore').addEventListener('click', () => {
    closeModal('checkoutModal');
    switchView('admin');
    switchAdminTab('tabOrders');
  });

  // Auth Modal
  document.getElementById('openAuthModalBtn').addEventListener('click', openAuthModal);
  document.getElementById('tabLoginBtn').addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tabRegisterBtn').addEventListener('click', () => switchAuthTab('register'));

  document.getElementById('btnFillAdmin').addEventListener('click', () => {
    document.getElementById('loginEmail').value = 'admin@techpulse.vn';
    document.getElementById('loginPassword').value = 'admin123';
  });

  document.getElementById('btnFillCustomer').addEventListener('click', () => {
    document.getElementById('loginEmail').value = 'user@techpulse.vn';
    document.getElementById('loginPassword').value = 'user123';
  });

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);

  // Admin Tabs
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.getAttribute('data-tab');
      switchAdminTab(tab);
    });
  });

  document.getElementById('btnRefreshAdmin').addEventListener('click', () => {
    loadAdminDashboard();
    loadAdminOrders();
    showToast('Đã làm mới dữ liệu quản trị!');
  });

  // Admin Order Filters
  document.getElementById('filterPaymentStatus').addEventListener('change', loadAdminOrders);
  document.getElementById('filterFulfillmentStatus').addEventListener('change', loadAdminOrders);
  document.getElementById('orderSearchInput').addEventListener('input', debounce(loadAdminOrders, 300));
}

let debounceTimer;
function debounce(func, delay) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(...args), delay);
  };
}

function isModalOpen() {
  return document.querySelector('.modal-overlay.active') || document.querySelector('.drawer-overlay.active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  document.getElementById('cartDrawerOverlay').classList.remove('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// ==========================================
// 2. VIEW SWITCHING (STORE vs ADMIN)
// ==========================================
function switchView(viewName) {
  const storeView = document.getElementById('storefrontView');
  const adminView = document.getElementById('adminView');
  const btnStore = document.getElementById('btnStoreView');
  const btnAdmin = document.getElementById('btnAdminView');

  if (viewName === 'admin') {
    // Neu chua dang nhap hoac khong phai admin
    if (!state.user || state.user.role !== 'admin') {
      showToast('Khu vực này yêu cầu đăng nhập tài khoản Quản trị viên (Admin)', 'info');
      openAuthModal();
      return;
    }
    storeView.classList.remove('active');
    adminView.classList.add('active');
    btnStore.classList.remove('active');
    btnAdmin.classList.add('active');
    window.location.hash = 'admin';
    loadAdminDashboard();
    loadAdminOrders();
    loadAdminInventory();
    loadAdminPromotions();
  } else {
    storeView.classList.add('active');
    adminView.classList.remove('active');
    btnStore.classList.add('active');
    btnAdmin.classList.remove('active');
    window.location.hash = '';
  }
}

function switchAdminTab(tabId) {
  state.adminTab = tabId;
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.admin-tab-content').forEach(c => {
    c.classList.toggle('active', c.id === tabId);
  });

  if (tabId === 'tabOrders') loadAdminOrders();
  if (tabId === 'tabInventory') loadAdminInventory();
  if (tabId === 'tabPromotions') loadAdminPromotions();
}

// ==========================================
// 3. STOREFRONT PRODUCTS & CATEGORIES
// ==========================================
async function loadCategories() {
  try {
    const res = await fetchApi('/api/products/categories');
    state.categories = res.data;
    renderCategories();
  } catch (err) {
    console.error(err);
  }
}

function renderCategories() {
  const container = document.getElementById('categoryTabs');
  if (!container) return;

  let html = `<button class="cat-pill ${state.currentCategory === 'all' ? 'active' : ''}" data-category="all">⚡ Tất cả sản phẩm</button>`;
  state.categories.forEach(c => {
    const isActive = state.currentCategory === c.slug ? 'active' : '';
    html += `
      <button class="cat-pill ${isActive}" data-category="${c.slug}">
        <span>${c.icon || '📱'}</span>
        <span>${c.name}</span>
      </button>
    `;
  });
  container.innerHTML = html;

  container.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = btn.getAttribute('data-category');
      state.currentCategory = cat;
      container.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadProducts();
    });
  });
}

async function loadProducts() {
  try {
    const countBadge = document.getElementById('productsCountText');
    if (countBadge) countBadge.textContent = 'Đang tải sản phẩm...';

    const params = new URLSearchParams();
    if (state.currentCategory && state.currentCategory !== 'all') {
      params.append('category', state.currentCategory);
    }
    if (state.searchQuery) {
      params.append('search', state.searchQuery);
    }

    const res = await fetchApi(`/api/products?${params.toString()}`);
    state.products = res.data;
    renderProducts();

    if (countBadge) {
      countBadge.textContent = `Hiển thị ${res.data.length} sản phẩm`;
    }
  } catch (err) {
    showToast('Lỗi tải danh sách sản phẩm', 'error');
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (state.products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <p style="font-size: 3rem; margin-bottom: 12px;">🔍</p>
        <h3>Không tìm thấy sản phẩm phù hợp</h3>
        <p>Thử tìm với từ khóa khác hoặc xóa bộ lọc danh mục.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.products.map(p => {
    const minPrice = parseFloat(p.min_price);
    const maxPrice = parseFloat(p.max_price);
    const priceText = minPrice === maxPrice 
      ? formatMoney(minPrice) 
      : `${formatMoney(minPrice)} - ${formatMoney(maxPrice)}`;

    return `
      <div class="product-card" onclick="openProductModal(${p.id})">
        <div class="product-thumb-box">
          <img src="${p.thumbnail || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'}" alt="${p.title}" loading="lazy">
          <span class="card-cat-badge">${p.category_icon || '📱'} ${p.category_name || 'Công nghệ'}</span>
          <span class="card-variants-badge">${p.variants_count} biến thể</span>
        </div>
        <div class="product-info">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-subtitle">${p.subtitle || p.title}</p>
          <div class="product-bottom">
            <div class="price-range">
              <span class="price-label">Giá từ</span>
              <span class="price-val">${priceText}</span>
            </div>
            <button class="btn-card-select">Chọn cấu hình ➜</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 4. PRODUCT DETAIL & VARIANT SELECTOR (MEDUSA-STYLE)
// ==========================================
async function openProductModal(productId) {
  try {
    const res = await fetchApi(`/api/products/${productId}`);
    const product = res.data;
    state.activeProduct = product;
    state.selectedOptions = {};

    // Gán dữ liệu cơ bản
    document.getElementById('modalProductTitle').textContent = product.title;
    document.getElementById('modalProductSubtitle').textContent = product.subtitle || product.title;
    document.getElementById('modalProductDesc').textContent = product.description || 'Chưa có mô tả chi tiết.';
    document.getElementById('modalCategoryBadge').textContent = `${product.category_icon || '📱'} ${product.category_name || 'Công nghệ'}`;
    document.getElementById('modalProductImage').src = product.thumbnail;
    document.getElementById('inputQty').value = 1;

    // Thiết lập tùy chọn mặc định từ variant đầu tiên
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      const optJson = defaultVariant.options_json || {};
      for (const [key, val] of Object.entries(optJson)) {
        state.selectedOptions[key] = val;
      }
    }

    renderOptionsSelectors(product);
    resolveActiveVariant();

    document.getElementById('productModal').classList.add('active');
  } catch (err) {
    showToast('Lỗi tải thông tin sản phẩm', 'error');
  }
}

function renderOptionsSelectors(product) {
  const container = document.getElementById('modalOptionsContainer');
  if (!container) return;

  if (!product.options || product.options.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Thu thập các giá trị khả dụng cho từng Option từ danh sách variants
  const optionsMap = {};
  product.options.forEach(opt => {
    optionsMap[opt.title] = new Set();
  });

  product.variants.forEach(v => {
    const vOpts = v.options_json || {};
    for (const [optTitle, optVal] of Object.entries(vOpts)) {
      if (optionsMap[optTitle]) {
        optionsMap[optTitle].add(optVal);
      }
    }
  });

  let html = '';
  for (const [optTitle, valSet] of Object.entries(optionsMap)) {
    const values = Array.from(valSet);
    if (values.length === 0) continue;

    const currentSelectedVal = state.selectedOptions[optTitle] || values[0];
    state.selectedOptions[optTitle] = currentSelectedVal;

    html += `
      <div class="option-group">
        <div class="option-group-title">Chọn ${optTitle}: <strong style="color: #fff;">${currentSelectedVal}</strong></div>
        <div class="option-values-row">
          ${values.map(val => {
            const isSelected = val === currentSelectedVal ? 'selected' : '';
            return `
              <button 
                type="button" 
                class="option-pill-btn ${isSelected}" 
                onclick="handleSelectOption('${optTitle}', '${val}')"
              >
                ${val}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

window.handleSelectOption = function(optionTitle, optionValue) {
  state.selectedOptions[optionTitle] = optionValue;
  renderOptionsSelectors(state.activeProduct);
  resolveActiveVariant();
};

function resolveActiveVariant() {
  if (!state.activeProduct || !state.activeProduct.variants) return;

  const variants = state.activeProduct.variants;
  
  // Tìm variant khớp chính xác với selectedOptions
  let matched = variants.find(v => {
    const vOpts = v.options_json || {};
    for (const [key, val] of Object.entries(state.selectedOptions)) {
      if (vOpts[key] !== val) return false;
    }
    return true;
  });

  if (!matched && variants.length > 0) {
    matched = variants[0];
  }

  state.activeVariant = matched;

  // Cập nhật giao diện theo Variant đã chọn
  if (matched) {
    document.getElementById('modalVariantPrice').textContent = formatMoney(matched.price);
    const origPriceEl = document.getElementById('modalOriginalPrice');
    if (matched.original_price && parseFloat(matched.original_price) > parseFloat(matched.price)) {
      origPriceEl.textContent = formatMoney(matched.original_price);
      origPriceEl.style.display = 'inline';
    } else {
      origPriceEl.style.display = 'none';
    }

    document.getElementById('modalVariantSku').textContent = matched.sku;
    
    const stockEl = document.getElementById('modalStockStatus');
    if (matched.inventory_quantity <= 0) {
      stockEl.textContent = 'Hết hàng';
      stockEl.className = 'stock-pill';
      stockEl.style.background = 'rgba(239, 68, 68, 0.2)';
      stockEl.style.color = '#F87171';
    } else if (matched.inventory_quantity <= 5) {
      stockEl.textContent = `Chỉ còn ${matched.inventory_quantity} máy`;
      stockEl.className = 'stock-pill low-stock';
    } else {
      stockEl.textContent = `Còn hàng (${matched.inventory_quantity} máy)`;
      stockEl.className = 'stock-pill in-stock';
    }

    if (matched.thumbnail) {
      document.getElementById('modalProductImage').src = matched.thumbnail;
    }
  }
}

// ==========================================
// 5. CART OPERATIONS
// ==========================================
function handleAddToCart() {
  if (!state.activeProduct || !state.activeVariant) {
    showToast('Vui lòng chọn cấu hình sản phẩm hợp lệ', 'error');
    return;
  }

  const variant = state.activeVariant;
  const qty = parseInt(document.getElementById('inputQty').value) || 1;

  if (variant.inventory_quantity < qty) {
    showToast(`Rất tiếc, kho chỉ còn ${variant.inventory_quantity} sản phẩm`, 'error');
    return;
  }

  // Kiem tra item da co trong cart chua
  const existingIndex = state.cart.findIndex(i => i.variantId === variant.id);
  if (existingIndex > -1) {
    const newQty = state.cart[existingIndex].quantity + qty;
    if (newQty > variant.inventory_quantity) {
      showToast(`Số lượng trong giỏ (${newQty}) vượt quá tồn kho (${variant.inventory_quantity})`, 'error');
      return;
    }
    state.cart[existingIndex].quantity = newQty;
  } else {
    state.cart.push({
      variantId: variant.id,
      productId: state.activeProduct.id,
      productTitle: state.activeProduct.title,
      variantTitle: variant.title,
      sku: variant.sku,
      price: parseFloat(variant.price),
      quantity: qty,
      thumbnail: variant.thumbnail || state.activeProduct.thumbnail,
      maxStock: variant.inventory_quantity
    });
  }

  saveCart();
  updateCartBadge();
  closeModal('productModal');
  openCartDrawer();
  showToast(`Đã thêm "${state.activeProduct.title} (${variant.title})" vào giỏ hàng!`);
}

function saveCart() {
  localStorage.setItem('techpulse_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadgeCount');
  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) badge.textContent = totalQty;
  const drawerCount = document.getElementById('drawerItemCount');
  if (drawerCount) drawerCount.textContent = `${totalQty} món`;
}

function openCartDrawer() {
  renderDrawerCart();
  document.getElementById('cartDrawerOverlay').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.remove('active');
}

function renderDrawerCart() {
  const container = document.getElementById('drawerCartItems');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🛒</div>
        <h4>Giỏ hàng của bạn đang trống</h4>
        <p style="font-size: 0.85rem; margin-top: 6px;">Hãy khám phá các thiết bị công nghệ đỉnh cao và thêm vào giỏ nhé!</p>
      </div>
    `;
    recalculateCart();
    return;
  }

  container.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-thumb">
        <img src="${item.thumbnail}" alt="${item.productTitle}">
      </div>
      <div class="cart-item-info">
        <span class="cart-item-title">${item.productTitle}</span>
        <span class="cart-item-variant">${item.variantTitle}</span>
        <div class="cart-item-bottom">
          <span class="cart-item-price">${formatMoney(item.price * item.quantity)}</span>
          <div class="cart-item-qty">
            <button class="qty-mini-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
            <span style="font-size: 0.85rem; font-weight: 700; min-width: 18px; text-align: center;">${item.quantity}</span>
            <button class="qty-mini-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
            <button class="cart-item-delete" onclick="removeCartItem(${idx})">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  recalculateCart();
}

window.updateCartItemQty = function(index, delta) {
  const item = state.cart[index];
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    removeCartItem(index);
    return;
  }
  if (newQty > item.maxStock) {
    showToast(`Kho chỉ còn tối đa ${item.maxStock} sản phẩm`, 'info');
    return;
  }

  item.quantity = newQty;
  saveCart();
  updateCartBadge();
  renderDrawerCart();
};

window.removeCartItem = function(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderDrawerCart();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng');
};

async function handleApplyVoucher() {
  const input = document.getElementById('voucherCodeInput');
  const code = input ? input.value.trim() : '';

  if (!code) {
    showToast('Vui lòng nhập mã giảm giá', 'error');
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotal === 0) {
    showToast('Giỏ hàng trống, không thể áp dụng voucher', 'error');
    return;
  }

  try {
    const res = await fetchApi('/api/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });

    state.appliedVoucher = res.data;
    localStorage.setItem('techpulse_voucher', JSON.stringify(res.data));
    showToast(`Áp dụng mã ${res.data.code} thành công: Giảm ${formatMoney(res.data.discountAmount)}!`);
    recalculateCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function recalculateCart() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;

  if (state.appliedVoucher) {
    if (state.appliedVoucher.type === 'percentage') {
      discount = (subtotal * state.appliedVoucher.value) / 100;
    } else {
      discount = state.appliedVoucher.discountAmount || state.appliedVoucher.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const shipping = subtotal >= 5000000 || subtotal === 0 ? 0 : 30000;
  const total = Math.max(0, subtotal - discount + shipping);

  document.getElementById('summarySubtotal').textContent = formatMoney(subtotal);
  document.getElementById('summaryDiscount').textContent = `-${formatMoney(discount)}`;
  document.getElementById('summaryShipping').textContent = shipping === 0 ? 'Miễn phí' : formatMoney(shipping);
  document.getElementById('summaryTotal').textContent = formatMoney(total);

  // Applied Voucher Alert
  const voucherAlert = document.getElementById('appliedVoucherInfo');
  if (voucherAlert) {
    if (state.appliedVoucher && discount > 0) {
      voucherAlert.style.display = 'block';
      voucherAlert.innerHTML = `
        <span>🎉 Đã áp dụng mã <strong>${state.appliedVoucher.code}</strong>: Giảm ${formatMoney(discount)}</span>
        <button style="background:none; border:none; color: var(--accent-rose); cursor:pointer; font-weight:bold; margin-left:8px;" onclick="removeVoucher()">Gỡ bỏ</button>
      `;
    } else {
      voucherAlert.style.display = 'none';
    }
  }

  const checkoutBtn = document.getElementById('btnOpenCheckout');
  if (checkoutBtn) {
    checkoutBtn.disabled = state.cart.length === 0;
  }
}

window.removeVoucher = function() {
  state.appliedVoucher = null;
  localStorage.removeItem('techpulse_voucher');
  recalculateCart();
  showToast('Đã gỡ mã giảm giá');
};

// ==========================================
// 6. CHECKOUT & VIETQR PRESENTATION
// ==========================================
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Giỏ hàng trống', 'error');
    return;
  }

  closeCartDrawer();
  document.getElementById('checkoutStepForm').style.display = 'block';
  document.getElementById('checkoutStepVietQR').style.display = 'none';

  // Tự động điền thông tin nếu đã đăng nhập
  if (state.user) {
    document.getElementById('orderCustomerName').value = state.user.full_name || '';
    document.getElementById('orderCustomerEmail').value = state.user.email || '';
    document.getElementById('orderCustomerPhone').value = state.user.phone || '';
  }

  // Tinh tien
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = state.appliedVoucher ? (state.appliedVoucher.discountAmount || 0) : 0;
  const shipping = subtotal >= 5000000 ? 0 : 30000;
  const total = Math.max(0, subtotal - discount + shipping);

  document.getElementById('checkoutFinalAmount').textContent = formatMoney(total);

  document.getElementById('checkoutModal').classList.add('active');
}

async function handleOrderSubmit(e) {
  e.preventDefault();

  const customer_name = document.getElementById('orderCustomerName').value.trim();
  const customer_email = document.getElementById('orderCustomerEmail').value.trim();
  const customer_phone = document.getElementById('orderCustomerPhone').value.trim();
  const shipping_address = document.getElementById('orderShippingAddress').value.trim();
  const note = document.getElementById('orderNote').value.trim();
  const payment_method = document.querySelector('input[name="paymentMethod"]:checked').value;

  const btnSubmit = document.getElementById('btnSubmitOrder');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Đang xử lý đơn hàng...';

  try {
    const payload = {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      note,
      payment_method,
      promotion_code: state.appliedVoucher ? state.appliedVoucher.code : null,
      items: state.cart.map(i => ({ variantId: i.variantId, quantity: i.quantity }))
    };

    const res = await fetchApi('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const order = res.data;

    // Xóa giỏ hàng
    state.cart = [];
    state.appliedVoucher = null;
    saveCart();
    localStorage.removeItem('techpulse_voucher');
    updateCartBadge();

    showToast(`Đặt hàng thành công! Mã đơn: ${order.display_id}`);

    // Hiển thị bước VietQR nếu chọn VietQR
    if (payment_method === 'vietqr' && order.vietqr_image) {
      showVietQRScreen(order);
    } else {
      closeModal('checkoutModal');
      showToast(`Đơn hàng #${order.display_id} đã được tạo với hình thức COD`, 'success');
      switchView('store');
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = '🚀 Xác Nhận Đặt Hàng & Tạo Mã VietQR';
  }
}

let countdownInterval;
function showVietQRScreen(order) {
  document.getElementById('checkoutStepForm').style.display = 'none';
  document.getElementById('checkoutStepVietQR').style.display = 'block';

  document.getElementById('vietqrDisplayId').textContent = `#${order.display_id}`;
  document.getElementById('vietqrImage').src = order.vietqr_image;
  document.getElementById('vietqrAmount').textContent = formatMoney(order.total_amount);
  document.getElementById('vietqrContent').textContent = order.vietqr_content;

  // Setup 1-Click Copy Buttons
  document.getElementById('btnCopyAmount').onclick = () => copyText(Math.round(order.total_amount), 'Số tiền');
  document.getElementById('btnCopyContent').onclick = () => copyText(order.vietqr_content, 'Nội dung chuyển khoản');

  // Đếm ngược 15 phút
  let timeLeft = 15 * 60;
  const countdownEl = document.getElementById('vietqrCountdown');
  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownEl.textContent = 'Hết hạn phiên!';
      return;
    }
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    countdownEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
}

// ==========================================
// 7. AUTHENTICATION (JWT)
// ==========================================
function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
}

function switchAuthTab(tab) {
  document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegisterBtn').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    state.token = res.data.token;
    state.user = res.data.user;
    localStorage.setItem('techpulse_token', state.token);
    localStorage.setItem('techpulse_user', JSON.stringify(state.user));

    showToast(`Đăng nhập thành công! Chào mừng ${state.user.full_name}`);
    closeModal('authModal');
    updateAuthUI();

    if (state.user.role === 'admin') {
      switchView('admin');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const full_name = document.getElementById('regFullName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name, email, phone, password })
    });

    state.token = res.data.token;
    state.user = res.data.user;
    localStorage.setItem('techpulse_token', state.token);
    localStorage.setItem('techpulse_user', JSON.stringify(state.user));

    showToast('Đăng ký tài khoản thành công!');
    closeModal('authModal');
    updateAuthUI();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('techpulse_token');
  localStorage.removeItem('techpulse_user');
  updateAuthUI();
  switchView('store');
  showToast('Đã đăng xuất tài khoản');
}

function updateAuthUI() {
  const container = document.getElementById('authArea');
  if (!container) return;

  if (state.user) {
    const isAdmin = state.user.role === 'admin';
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: ${isAdmin ? 'var(--accent-amber)' : 'var(--text-main)'};">
          ${isAdmin ? '👑' : '👤'} ${state.user.full_name}
        </span>
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="logout()">Đăng xuất</button>
      </div>
    `;
  } else {
    container.innerHTML = `<button class="btn-auth" id="openAuthModalBtn" onclick="openAuthModal()">👤 Đăng nhập</button>`;
  }
}

// ==========================================
// 8. ADMIN PORTAL (MEDUSA MODULAR CONTROLS)
// ==========================================
async function loadAdminDashboard() {
  try {
    const res = await fetchApi('/api/dashboard/metrics');
    const data = res.data;
    state.dashboardStats = data;

    // Render KPI Cards
    document.getElementById('kpiRevenue').textContent = formatMoney(data.revenue);
    document.getElementById('kpiTotalOrders').textContent = data.totalOrders;
    document.getElementById('kpiCompletedOrders').textContent = `${data.completedOrders} đơn giao thành công`;
    document.getElementById('kpiPendingPayment').textContent = data.pendingPaymentOrders;
    document.getElementById('kpiLowStock').textContent = data.lowStockVariantsCount;

    // Render Category Sales List
    const catList = document.getElementById('categorySalesList');
    if (catList) {
      catList.innerHTML = data.categoryStats.map(c => `
        <div class="sales-item">
          <div>
            <strong>${c.category_icon || '📁'} ${c.category_name}</strong>
            <p style="font-size: 0.75rem; color: var(--text-dim);">${c.product_count} sản phẩm</p>
          </div>
          <strong style="color: var(--accent-cyan);">${formatMoney(c.total_sales)}</strong>
        </div>
      `).join('');
    }

    // Render Low Stock List
    const lowStockList = document.getElementById('lowStockList');
    if (lowStockList) {
      if (data.lowStockItems.length === 0) {
        lowStockList.innerHTML = `<p style="color: var(--accent-emerald); font-size: 0.85rem;">✅ Tất cả sản phẩm đều đủ số lượng tồn kho!</p>`;
      } else {
        lowStockList.innerHTML = data.lowStockItems.map(item => `
          <div class="low-stock-item">
            <div>
              <strong>${item.product_title}</strong>
              <p style="font-size: 0.75rem; color: var(--text-muted);">${item.variant_title} (SKU: ${item.sku})</p>
            </div>
            <span class="stock-pill low-stock">Còn ${item.inventory_quantity} máy</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }
}

async function loadAdminOrders() {
  try {
    const payment = document.getElementById('filterPaymentStatus').value;
    const fulfillment = document.getElementById('filterFulfillmentStatus').value;
    const search = document.getElementById('orderSearchInput').value.trim();

    const params = new URLSearchParams();
    if (payment !== 'all') params.append('payment_status', payment);
    if (fulfillment !== 'all') params.append('fulfillment_status', fulfillment);
    if (search) params.append('search', search);

    const res = await fetchApi(`/api/orders?${params.toString()}`);
    state.orders = res.data;
    document.getElementById('adminOrdersBadge').textContent = res.data.length;

    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--text-dim);">Chưa có đơn hàng nào thỏa điều kiện lọc</td></tr>`;
      return;
    }

    tbody.innerHTML = res.data.map(o => {
      // Payment badge
      let payClass = 'pay-awaiting';
      let payLabel = 'Chờ VietQR';
      if (o.payment_status === 'captured') {
        payClass = 'pay-captured';
        payLabel = '✅ Đã nhận tiền';
      } else if (o.payment_status === 'refunded') {
        payClass = 'pay-refunded';
        payLabel = '↩️ Đã hoàn tiền';
      }

      // Fulfillment badge
      let fulClass = 'ful-processing';
      let fulLabel = 'Chờ xử lý';
      if (o.fulfillment_status === 'shipped') {
        fulClass = 'ful-shipped';
        fulLabel = '🚚 Đang giao';
      } else if (o.fulfillment_status === 'delivered') {
        fulClass = 'ful-delivered';
        fulLabel = '🎉 Đã nhận hàng';
      } else if (o.fulfillment_status === 'canceled') {
        fulClass = 'ful-canceled';
        fulLabel = '✕ Đã hủy';
      }

      const itemsSummary = (o.items || []).map(i => `${i.product_title} (${i.variant_title}) x${i.quantity}`).join('<br>');

      return `
        <tr>
          <td><strong style="color: var(--accent-cyan);">#${o.display_id}</strong></td>
          <td>
            <strong>${o.customer_name}</strong>
            <p style="font-size: 0.75rem; color: var(--text-muted);">${o.customer_phone}</p>
          </td>
          <td style="font-size: 0.8rem;">${itemsSummary || '---'}</td>
          <td><strong style="color: #fff;">${formatMoney(o.total_amount)}</strong></td>
          <td>
            <span class="status-badge ${payClass}">${payLabel}</span>
          </td>
          <td>
            <span class="status-badge ${fulClass}">${fulLabel}</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${o.payment_status !== 'captured' ? `
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="adminCapturePayment(${o.id})">
                  💰 Thu tiền
                </button>
              ` : ''}
              ${o.fulfillment_status !== 'delivered' && o.fulfillment_status !== 'canceled' ? `
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="adminAdvanceFulfillment(${o.id}, '${o.fulfillment_status}')">
                  📦 Tiến độ
                </button>
              ` : ''}
              <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="adminShowVietQR(${o.id})">
                📱 VietQR
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Lỗi tải danh sách đơn hàng', 'error');
  }
}

window.adminCapturePayment = async function(orderId) {
  if (!confirm('Xác nhận đã nhận đủ tiền chuyển khoản cho đơn hàng này?')) return;
  try {
    await fetchApi(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'captured', note: 'Quản trị viên xác nhận đã nhận chuyển khoản' })
    });
    showToast('Đã xác nhận thanh toán thành công!');
    loadAdminOrders();
    loadAdminDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.adminAdvanceFulfillment = async function(orderId, currentStatus) {
  let nextStatus = 'packing';
  if (currentStatus === 'processing') nextStatus = 'packing';
  else if (currentStatus === 'packing') nextStatus = 'shipped';
  else if (currentStatus === 'shipped') nextStatus = 'delivered';

  try {
    await fetchApi(`/api/orders/${orderId}/fulfillment`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus, note: `Cập nhật giao vận sang ${nextStatus}` })
    });
    showToast(`Đã chuyển trạng thái sang: ${nextStatus}!`);
    loadAdminOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.adminShowVietQR = async function(orderId) {
  try {
    const res = await fetchApi(`/api/orders/${orderId}`);
    const order = res.data;
    if (order.vietqr_image) {
      document.getElementById('checkoutModal').classList.add('active');
      showVietQRScreen(order);
    } else {
      showToast('Đơn hàng này không sử dụng VietQR', 'info');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function loadAdminInventory() {
  try {
    const res = await fetchApi('/api/products');
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = res.data.map(p => {
      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${p.thumbnail}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;">
              <div>
                <strong>${p.title}</strong>
                <p style="font-size: 0.75rem; color: var(--text-dim);">${p.slug}</p>
              </div>
            </div>
          </td>
          <td>${p.category_icon || '📱'} ${p.category_name}</td>
          <td><span class="badge">${p.variants_count} biến thể</span></td>
          <td>${formatMoney(p.min_price)} - ${formatMoney(p.max_price)}</td>
          <td>
            <strong style="color: ${p.total_inventory <= 10 ? 'var(--accent-amber)' : 'var(--accent-emerald)'};">
              ${p.total_inventory} máy
            </strong>
          </td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openProductModal(${p.id})">
              👁️ Xem biến thể
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}

async function loadAdminPromotions() {
  try {
    const res = await fetchApi('/api/promotions');
    const tbody = document.getElementById('promotionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = res.data.map(p => `
      <tr>
        <td><strong style="color: var(--accent-cyan); font-family: monospace; font-size: 0.95rem;">${p.code}</strong></td>
        <td>${p.type === 'percentage' ? 'Giảm %' : 'Tiền mặt cố định'}</td>
        <td><strong>${p.type === 'percentage' ? `${p.value}%` : formatMoney(p.value)}</strong></td>
        <td>${formatMoney(p.min_order_value)}</td>
        <td>${p.usage_count} / ${p.usage_limit}</td>
        <td>
          <span class="status-badge ${p.is_active ? 'pay-captured' : 'ful-canceled'}">
            ${p.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="togglePromotionStatus(${p.id})">
            ${p.is_active ? '⏸️ Tắt' : '▶️ Bật'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.togglePromotionStatus = async function(promoId) {
  try {
    await fetchApi(`/api/promotions/${promoId}/toggle`, { method: 'PATCH' });
    showToast('Cập nhật trạng thái voucher thành công!');
    loadAdminPromotions();
  } catch (err) {
    showToast(err.message, 'error');
  }
};
