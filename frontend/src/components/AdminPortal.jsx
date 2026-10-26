import React, { useState, useEffect } from 'react';
import { formatMoney, fetchApi, exportOrdersToCSV, uploadImageFile } from '../services/api';
import {
  RefreshCw,
  Plus,
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  QrCode,
  Tag,
  Layers,
  Eye,
  EyeOff,
  Edit3,
  Zap,
  Send,
  Download,
  Mail,
  ExternalLink,
  Palette,
  Trash2,
  Save,
  Upload,
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Ticket,
  Sliders,
  Search,
  CheckCircle2,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import AdminOrderDetailModal from './AdminOrderDetailModal';
import AdminCreateProductModal from './AdminCreateProductModal';
import AdminEditProductModal from './AdminEditProductModal';
import AdminCreatePromoModal from './AdminCreatePromoModal';
import AdminVariantEditModal from './AdminVariantEditModal';
import AdminDocsTab from './AdminDocsTab';

const STORE_PRESETS = [
  {
    key: 'multi_flagship',
    label: 'Cửa hàng Đa ngành (Flagship)',
    store_name: 'ATELIER & CO.',
    store_tagline: 'Curated Multi-Category Store',
    hero_badge: 'Nền tảng Bán lẻ Đa ngành Thế hệ mới',
    hero_title: 'Không Gian Mua Sắm Tuyển Chọn &',
    hero_highlight: 'Trải Nghiệm Đa Biến Thể',
    hero_subtitle:
      'Từ Thời trang thiết kế, Nội thất Bắc Âu, Mỹ phẩm thiên nhiên đến Cà phê thủ công và Thiết bị âm thanh — tùy chọn kích cỡ, chất liệu, dung tích linh hoạt cùng thanh toán VietQR 24/7 tức thì.',
    hero_image: '/assets/editorial/hero-flagship.svg',
    default_theme: 'light',
    unit_label: 'sản phẩm'
  },
  {
    key: 'fashion_studio',
    label: 'Thời trang & Lookbook Studio',
    store_name: 'MAISON L’ATELIER',
    store_tagline: 'Contemporary Apparel & Leather Goods',
    hero_badge: 'Bộ Sưu Tập Thu Đông Tuyển Chọn',
    hero_title: 'Thời Trang Tối Giản &',
    hero_highlight: 'Chất Liệu Hữu Cơ Bền Vững',
    hero_subtitle:
      'Các thiết kế Trench Coat Linen Pháp, áo dệt kim và túi da thuộc khâu tay thủ công. Tùy chọn kích cỡ S/M/L và bảng màu trung tính vượt thời gian.',
    hero_image: '/assets/editorial/fashion-trench.svg',
    default_theme: 'light',
    unit_label: 'sản phẩm'
  },
  {
    key: 'home_living',
    label: 'Nội thất & Không gian sống',
    store_name: 'NORDIC FORM STUDIO',
    store_tagline: 'Architectural Furniture & Lighting',
    hero_badge: 'Kiến Trúc Nội Thất Bắc Âu',
    hero_title: 'Nghệ Thuật Sắp Đặt &',
    hero_highlight: 'Nội Thất Gỗ Sồi Nguyên Khối',
    hero_subtitle:
      'Tối ưu hóa không gian sống với bộ sưu tập ghế bành gỗ sồi trắng, vải dệt Bouclé và đèn đồng thau chế tác thủ công.',
    hero_image: '/assets/editorial/living-chair.svg',
    default_theme: 'light',
    unit_label: 'món'
  },
  {
    key: 'beauty_botanical',
    label: 'Mỹ phẩm & Hương thơm Thảo mộc',
    store_name: 'BOTANICA APOTHECARY',
    store_tagline: 'Clean Skincare & Artisanal Scents',
    hero_badge: 'Chăm Sóc Thuần Chay & Liệu Pháp Hương Thơm',
    hero_title: 'Tinh Chất Thảo Mộc &',
    hero_highlight: 'Nến Thơm Tự Nhiên Thủ Công',
    hero_subtitle:
      'Chiết xuất thực vật hữu cơ kết hợp cùng tinh dầu gỗ tuyết tùng và Hinoki. Tùy chọn dung tích 30ml, 50ml hoặc bộ quà tặng cao cấp.',
    hero_image: '/assets/editorial/beauty-serum.svg',
    default_theme: 'light',
    unit_label: 'sản phẩm'
  },
  {
    key: 'artisan_coffee',
    label: 'Cà phê Đặc sản & Trà đạo',
    store_name: 'ROASTERY & CO.',
    store_tagline: 'Specialty Coffee & Ceramic Craft',
    hero_badge: 'Rang Mộc Thủ Công Hàng Ngày',
    hero_title: 'Hương Vị Nguyên Bản &',
    hero_highlight: 'Dụng Cụ Pha Chế Thủ Công',
    hero_subtitle:
      'Hạt Arabica Cầu Đất sơ chế Honey cùng bộ phễu gốm V60 nung nhiệt độ cao. Tùy chọn mức xay phù hợp cho Pour-Over, Espresso hoặc Cold Brew.',
    hero_image: '/assets/editorial/coffee-roast.svg',
    default_theme: 'light',
    unit_label: 'sản phẩm'
  }
];

const MODULE_META = {
  tabDashboard: {
    breadcrumb: 'Điều hành & Phân tích',
    title: 'Tổng quan Doanh thu & Vận hành',
    subtitle: 'Theo dõi chỉ số tài chính thực nhận, cơ cấu ngành hàng và cảnh báo tồn kho theo thời gian thực.'
  },
  tabOrders: {
    breadcrumb: 'Điều hành & Phân tích',
    title: 'Quản lý Đơn hàng & Giao vận',
    subtitle: 'Xử lý luồng đơn hàng đa kênh, xác nhận thanh toán VietQR, cập nhật tiến độ giao nhận và in phiếu vận đơn.'
  },
  tabInventory: {
    breadcrumb: 'Danh mục & Kho hàng',
    title: 'Sản phẩm & Biến thể SKU',
    subtitle: 'Quản trị toàn diện danh mục sản phẩm, chỉnh sửa thông tin, tải ảnh, cấu hình biến thể SKU và tồn kho.'
  },
  tabPromotions: {
    breadcrumb: 'Danh mục & Kho hàng',
    title: 'Chiến dịch & Mã Khuyến Mãi',
    subtitle: 'Thiết lập mã giảm giá theo phần trăm hoặc số tiền cố định, kiểm soát hạn mức đơn tối thiểu và lượt sử dụng.'
  },
  tabStoreSettings: {
    breadcrumb: 'Cấu hình & Tự động hóa',
    title: 'Thương hiệu, Ngân hàng & Ngành hàng',
    subtitle: 'Tùy biến giao diện cửa hàng, tài khoản thụ hưởng VietQR, biểu phí vận chuyển và cấu trúc ngành hàng.'
  },
  tabWebhooks: {
    breadcrumb: 'Cấu hình & Tự động hóa',
    title: 'Cổng Đối soát VietQR 24/7',
    subtitle: 'Giám sát tín hiệu biến động số dư Open Banking (SePay/Casso) và giả lập khớp lệnh thanh toán tức thì.'
  },
  tabEmails: {
    breadcrumb: 'Cấu hình & Tự động hóa',
    title: 'Nhật ký Email Giao dịch',
    subtitle: 'Theo dõi lịch sử gửi thông báo xác nhận đơn hàng, biên lai VietQR và trạng thái vận chuyển cho khách hàng.'
  },
  tabDocs: {
    breadcrumb: 'Tài liệu & Vận hành',
    title: 'Cẩm nang Cài đặt & Triển khai',
    subtitle: 'Hướng dẫn chi tiết toàn bộ các bước thiết lập tài khoản, biến môi trường, cơ sở dữ liệu Supabase, cổng VietQR và giữ server 24/7.'
  }
};

export default function AdminPortal({
  token,
  storeSettings,
  onStoreSettingsUpdated,
  onCategoriesUpdated,
  onProductsUpdated,
  onToast,
  onOpenProductModal
}) {
  const [activeTab, setActiveTab] = useState('tabDashboard');
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [testEmailRecipient, setTestEmailRecipient] = useState('khachhang@atelier.vn');
  const [testEmailType, setTestEmailType] = useState('ORDER');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Order Filters
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterFulfillment, setFilterFulfillment] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Inventory Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(false);

  // Store Settings Form State
  const [brandForm, setBrandForm] = useState({
    store_name: storeSettings?.store_name || 'ATELIER & CO.',
    store_tagline: storeSettings?.store_tagline || 'Curated Multi-Category Store',
    hero_badge: storeSettings?.hero_badge || 'Nền tảng Bán lẻ Đa ngành Thế hệ mới',
    hero_title: storeSettings?.hero_title || 'Không Gian Mua Sắm Tuyển Chọn &',
    hero_highlight: storeSettings?.hero_highlight || 'Trải Nghiệm Đa Biến Thể',
    hero_subtitle: storeSettings?.hero_subtitle || '',
    hero_image: storeSettings?.hero_image || '/assets/editorial/hero-flagship.svg',
    default_theme: storeSettings?.default_theme || 'light',
    unit_label: storeSettings?.unit_label || 'sản phẩm',
    preset_key: storeSettings?.preset_key || 'multi_flagship',
    bank_id: storeSettings?.bank_id || 'MB',
    bank_name: storeSettings?.bank_name || 'MB Bank',
    bank_account_no: storeSettings?.bank_account_no || '0369123456789',
    bank_account_name: storeSettings?.bank_account_name || 'ATELIER FLAGSHIP STORE',
    base_shipping_fee: storeSettings?.base_shipping_fee ?? 35000,
    free_shipping_threshold: storeSettings?.free_shipping_threshold ?? 1000000,
    store_phone: storeSettings?.store_phone || '1900 6868',
    store_address: storeSettings?.store_address || 'Số 88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh'
  });
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Webhook Simulator state in Admin
  const [simOrderCode, setSimOrderCode] = useState('');
  const [simAmount, setSimAmount] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Sub-modal states
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
  const [editingVariantProductId, setEditingVariantProductId] = useState(null);

  const unitLabel = brandForm.unit_label || storeSettings?.unit_label || 'sản phẩm';

  useEffect(() => {
    if (storeSettings) {
      setBrandForm((prev) => ({
        ...prev,
        ...storeSettings
      }));
    }
  }, [storeSettings]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, oRes, iRes, cRes, pRes, wRes, eRes] = await Promise.all([
        fetchApi('/api/dashboard/metrics', {}, token),
        fetchApi('/api/orders', {}, token),
        fetchApi('/api/products?includeUnpublished=true', {}, token),
        fetchApi('/api/products/categories', {}, token),
        fetchApi('/api/promotions', {}, token),
        fetchApi('/api/webhooks/vietqr/logs?limit=30', {}, token).catch(() => ({ data: [] })),
        fetchApi('/api/notifications/logs?limit=30', {}, token).catch(() => ({ data: [] }))
      ]);
      setMetrics(mRes.data);
      setOrders(oRes.data);
      setInventory(iRes.data);
      setCategoriesList(cRes.data || []);
      setPromotions(pRes.data);
      setWebhookLogs(wRes.data || []);
      setEmailLogs(eRes.data || []);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handlers
  const handleCapturePayment = async (orderId) => {
    try {
      await fetchApi(
        `/api/orders/${orderId}/payment`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'captured', note: 'Quản trị viên xác nhận đã nhận chuyển khoản' })
        },
        token
      );
      onToast('Đã xác nhận thanh toán thành công!');
      loadData();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleAdvanceFulfillment = async (orderId, currentStatus) => {
    let nextStatus = 'packing';
    if (currentStatus === 'processing') nextStatus = 'packing';
    else if (currentStatus === 'packing') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'delivered';

    try {
      await fetchApi(
        `/api/orders/${orderId}/fulfillment`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus, note: `Cập nhật giao vận sang ${nextStatus}` })
        },
        token
      );
      onToast(`Đã chuyển trạng thái sang: ${nextStatus}!`);
      loadData();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleTogglePromo = async (promoId) => {
    try {
      await fetchApi(`/api/promotions/${promoId}/toggle`, { method: 'PATCH' }, token);
      onToast('Cập nhật trạng thái voucher thành công!');
      loadData();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleExpireStaleOrders = async () => {
    try {
      const res = await fetchApi(
        '/api/orders/expire-stale',
        {
          method: 'POST',
          body: JSON.stringify({ minutes: 30 })
        },
        token
      );
      onToast(res.message || 'Đã rà soát đơn hàng VietQR quá hạn!');
      loadData();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleSaveBrandSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingBrand(true);
    try {
      const res = await fetchApi(
        '/api/store/settings',
        {
          method: 'PUT',
          body: JSON.stringify(brandForm)
        },
        token
      );
      if (res.success && res.data) {
        onToast(res.message || 'Đã lưu cấu hình thương hiệu cửa hàng!');
        if (onStoreSettingsUpdated) onStoreSettingsUpdated(res.data);
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleApplyPreset = async (preset) => {
    const updated = {
      ...brandForm,
      ...preset
    };
    setBrandForm(updated);
    setIsSavingBrand(true);
    try {
      const res = await fetchApi(
        '/api/store/settings',
        {
          method: 'PUT',
          body: JSON.stringify(updated)
        },
        token
      );
      if (res.success && res.data) {
        onToast(`Đã áp dụng mẫu cửa hàng "${preset.label}" thành công!`);
        if (onStoreSettingsUpdated) onStoreSettingsUpdated(res.data);
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      onToast('Vui lòng nhập tên danh mục ngành hàng', 'error');
      return;
    }
    setIsCreatingCat(true);
    try {
      const res = await fetchApi(
        '/api/products/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            name: newCatName.trim(),
            icon: newCatIcon.trim() || '🛍️',
            description: newCatDesc.trim()
          })
        },
        token
      );
      if (res.success) {
        onToast(`Đã thêm danh mục "${newCatName}"!`);
        setNewCatName('');
        setNewCatDesc('');
        await loadData();
        if (onCategoriesUpdated) onCategoriesUpdated();
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    try {
      await fetchApi(`/api/products/categories/${catId}`, { method: 'DELETE' }, token);
      onToast(`Đã xóa danh mục "${catName}"`);
      await loadData();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleUploadHeroImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const res = await uploadImageFile(file, token);
      if (res.success && res.data?.url) {
        setBrandForm((prev) => ({ ...prev, hero_image: res.data.url }));
        onToast('Đã tải ảnh Hero Banner lên thành công! Hãy bấm Lưu Cấu Hình.');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  const handleToggleProductPublish = async (product) => {
    const nextPublished = product.is_published === false ? true : false;
    try {
      await fetchApi(
        `/api/products/${product.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ is_published: nextPublished })
        },
        token
      );
      onToast(
        nextPublished
          ? `Đã hiển thị sản phẩm "${product.title}" trên gian hàng`
          : `Đã tạm ẩn sản phẩm "${product.title}"`
      );
      await loadData();
      if (onProductsUpdated) onProductsUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      await fetchApi(`/api/products/${product.id}`, { method: 'DELETE' }, token);
      onToast(`Đã xóa sản phẩm "${product.title}" khỏi kho hàng!`);
      await loadData();
      if (onProductsUpdated) onProductsUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleSimulateWebhook = async (e) => {
    e.preventDefault();
    if (!simOrderCode.trim()) {
      onToast('Vui lòng nhập mã đơn hàng (VD: TP-9619)', 'error');
      return;
    }

    setIsSimulating(true);
    try {
      const res = await fetchApi('/api/webhooks/vietqr/simulate', {
        method: 'POST',
        body: JSON.stringify({
          display_id: simOrderCode.trim().toUpperCase(),
          amount: parseFloat(simAmount) || undefined,
          bank_name: `${brandForm.bank_name || 'MB Bank'} (Simulator 24/7)`
        })
      });

      if (res.success) {
        onToast(`Webhook thành công: ${res.message}`);
        setSimOrderCode('');
        setSimAmount('');
        loadData();
      } else {
        onToast(res.message, 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailRecipient.trim()) {
      onToast('Vui lòng nhập địa chỉ email người nhận', 'error');
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetchApi(
        '/api/notifications/test',
        {
          method: 'POST',
          body: JSON.stringify({
            email: testEmailRecipient.trim(),
            type: testEmailType
          })
        },
        token
      );

      if (res.success) {
        onToast(`Đã gửi email thử nghiệm (${testEmailType}) thành công!`);
        loadData();
      } else {
        onToast(res.message || 'Lỗi khi gửi email', 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (filterPayment !== 'all' && o.payment_status !== filterPayment) return false;
    if (filterFulfillment !== 'all' && o.fulfillment_status !== filterFulfillment) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const matchId = o.display_id?.toLowerCase().includes(q);
      const matchName = o.customer_name?.toLowerCase().includes(q);
      const matchPhone = o.customer_phone?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  // Filtered Inventory
  const filteredInventory = inventory.filter((p) => {
    const isPub = p.is_published !== false;
    if (inventoryStockFilter === 'published' && !isPub) return false;
    if (inventoryStockFilter === 'hidden' && isPub) return false;
    if (inventoryStockFilter === 'low' && Number(p.total_inventory) > 10) return false;

    if (inventoryCategoryFilter !== 'all' && String(p.category_id) !== String(inventoryCategoryFilter)) {
      return false;
    }

    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchSlug = p.slug?.toLowerCase().includes(q);
      const matchCat = p.category_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchCat) return false;
    }

    return true;
  });

  const currentModule = MODULE_META[activeTab] || MODULE_META.tabDashboard;
  const pendingVietqrCount = orders.filter((o) => o.payment_status === 'awaiting_vietqr').length;
  const lowStockCount = metrics?.lowStockVariantsCount ?? metrics?.lowStockCount ?? 0;

  return (
    <section className="view-section active">
      <div className="admin-workspace">
        {/* Left Sidebar Navigation */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-kicker">Commerce Console</span>
            <span className="admin-sidebar-title">{brandForm.store_name || 'ATELIER & CO.'}</span>
          </div>

          {/* Group 1: Operations & Analytics */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">Điều hành &amp; Phân tích</span>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabDashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabDashboard')}
            >
              <span className="admin-nav-item-left">
                <LayoutDashboard size={16} />
                <span>Tổng quan Doanh thu</span>
              </span>
            </button>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabOrders' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabOrders')}
            >
              <span className="admin-nav-item-left">
                <ShoppingBag size={16} />
                <span>Quản lý Đơn hàng</span>
              </span>
              <span className="admin-nav-count">{orders.length}</span>
            </button>
          </div>

          {/* Group 2: Catalog & Inventory */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">Danh mục &amp; Kho hàng</span>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabInventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabInventory')}
            >
              <span className="admin-nav-item-left">
                <Boxes size={16} />
                <span>Sản phẩm &amp; Biến thể</span>
              </span>
              <span className="admin-nav-count">{inventory.length}</span>
            </button>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabPromotions' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabPromotions')}
            >
              <span className="admin-nav-item-left">
                <Ticket size={16} />
                <span>Mã Khuyến Mãi</span>
              </span>
              <span className="admin-nav-count">{promotions.length}</span>
            </button>
          </div>

          {/* Group 3: Settings & Automation */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">Cấu hình &amp; Tự động hóa</span>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabStoreSettings' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabStoreSettings')}
            >
              <span className="admin-nav-item-left">
                <Sliders size={16} />
                <span>Thương hiệu &amp; Ngân hàng</span>
              </span>
              <span className="admin-nav-count">{categoriesList.length}</span>
            </button>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabWebhooks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabWebhooks')}
            >
              <span className="admin-nav-item-left">
                <QrCode size={16} />
                <span>Đối soát VietQR 24/7</span>
              </span>
              <span className="admin-nav-count">{webhookLogs.length}</span>
            </button>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabEmails' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabEmails')}
            >
              <span className="admin-nav-item-left">
                <Mail size={16} />
                <span>Email Giao dịch</span>
              </span>
              <span className="admin-nav-count">{emailLogs.length}</span>
            </button>
          </div>

          {/* Group 4: Documentation & Setup Guide */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">Tài liệu &amp; Vận hành</span>
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'tabDocs' ? 'active' : ''}`}
              onClick={() => setActiveTab('tabDocs')}
            >
              <span className="admin-nav-item-left">
                <BookOpen size={16} />
                <span>Cẩm nang Cài đặt</span>
              </span>
              <span className="admin-nav-count" style={{ background: 'var(--accent-cyan)', color: '#fff' }}>Mới</span>
            </button>
          </div>

          {/* Operational Context Footer */}
          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-footer-row">
              <span>Cổng nhận VietQR</span>
              <strong>{brandForm.bank_id || 'MB'}</strong>
            </div>
            <div className="admin-sidebar-footer-row">
              <span>Số TK</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                {brandForm.bank_account_no || '0369123456789'}
              </strong>
            </div>
            <div className="admin-sidebar-footer-row">
              <span>Mức Freeship</span>
              <strong>{formatMoney(brandForm.free_shipping_threshold ?? 1000000)}</strong>
            </div>
          </div>
        </aside>

        {/* Right Main Viewport */}
        <div className="admin-main">
          {/* Contextual Top Header Bar */}
          <header className="admin-workspace-header">
            <div>
              <div className="admin-breadcrumb">
                <span>Quản trị Cửa hàng</span>
                <span aria-hidden="true">/</span>
                <span className="current">{currentModule.breadcrumb}</span>
              </div>
              <h1 className="admin-title">{currentModule.title}</h1>
              <p className="admin-sub">{currentModule.subtitle}</p>
            </div>

            <div className="admin-actions">
              {activeTab === 'tabInventory' && (
                <button className="btn btn-primary" onClick={() => setIsCreateProductOpen(true)}>
                  <Plus size={15} />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              )}

              {activeTab === 'tabPromotions' && (
                <button className="btn btn-primary" onClick={() => setIsCreatePromoOpen(true)}>
                  <Plus size={15} />
                  <span>Tạo Voucher Mới</span>
                </button>
              )}

              {activeTab === 'tabStoreSettings' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleSaveBrandSettings()}
                  disabled={isSavingBrand}
                >
                  <Save size={15} />
                  <span>{isSavingBrand ? 'Đang lưu...' : 'Lưu Cấu Hình'}</span>
                </button>
              )}

              {(activeTab === 'tabDashboard' || activeTab === 'tabOrders') && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (!orders.length) {
                      onToast('Không có đơn hàng nào để xuất', 'error');
                      return;
                    }
                    exportOrdersToCSV(orders);
                    onToast(`Đã xuất báo cáo ${orders.length} đơn hàng ra file CSV!`);
                  }}
                >
                  <Download size={15} />
                  <span>Xuất Báo Cáo CSV ({orders.length})</span>
                </button>
              )}

              <button className="btn btn-secondary" onClick={loadData} disabled={isLoading}>
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                <span>Làm mới</span>
              </button>
            </div>
          </header>

          {/* =========================================================
              MODULE 1: DASHBOARD & EXECUTIVE ANALYTICS
             ========================================================= */}
          {activeTab === 'tabDashboard' && metrics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 4-Column Executive KPI Strip */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-label">Doanh thu thực nhận (Captured)</span>
                    <div className="kpi-icon-minimal">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div className="kpi-value">{formatMoney(metrics.revenue)}</div>
                  <div className="kpi-hint">
                    <span>Đã đối soát thanh toán thành công</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-label">Tổng đơn hàng toàn hệ thống</span>
                    <div className="kpi-icon-minimal">
                      <Package size={16} />
                    </div>
                  </div>
                  <div className="kpi-value">{metrics.totalOrders}</div>
                  <div className="kpi-hint">
                    <span>Hoàn tất giao nhận: {metrics.completedOrders} đơn</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-label">Đơn chờ thanh toán VietQR</span>
                    <div className="kpi-icon-minimal">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div
                    className="kpi-value"
                    style={{
                      color: metrics.pendingPaymentOrders > 0 ? 'var(--accent-amber)' : 'var(--text-main)'
                    }}
                  >
                    {metrics.pendingPaymentOrders}
                  </div>
                  <div className="kpi-hint">
                    <span>Đang tạm giữ chỗ tồn kho SKU</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-label">Biến thể sắp hết hàng (≤ 5)</span>
                    <div className="kpi-icon-minimal">
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div
                    className="kpi-value"
                    style={{
                      color: lowStockCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                    }}
                  >
                    {lowStockCount} SKU
                  </div>
                  <div className="kpi-hint">
                    <span>Tổng danh mục: {inventory.length} mặt hàng</span>
                  </div>
                </div>
              </div>

              {/* Actionable Operations Bar */}
              <div
                className="admin-surface-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  background: 'var(--bg-surface-elevated)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Tác vụ vận hành nhanh trong ca trực
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Xử lý nhanh các đơn chờ chuyển khoản, giải phóng tồn kho đơn treo quá 30 phút hoặc bổ sung hàng hóa.
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    onClick={() => {
                      setFilterPayment('awaiting_vietqr');
                      setActiveTab('tabOrders');
                    }}
                  >
                    <span>Đơn chờ VietQR ({pendingVietqrCount})</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    onClick={handleExpireStaleOrders}
                  >
                    <Clock size={14} />
                    <span>Thu hồi đơn treo &gt; 30 phút</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                    onClick={() => setIsCreateProductOpen(true)}
                  >
                    <Plus size={14} />
                    <span>Thêm Sản Phẩm Mới</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Analytical Split */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: '20px'
                }}
              >
                {/* Left: Category Revenue Breakdown */}
                <div className="admin-surface-card">
                  <div className="admin-surface-header">
                    <h3 className="admin-surface-title">Tỷ trọng Doanh thu &amp; Tồn kho theo Danh mục</h3>
                    <span className="admin-surface-meta">
                      {(metrics.categoryStats || []).length} ngành hàng
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(metrics.categoryStats || []).map((cat) => {
                      const totalRev = Math.max(
                        1,
                        (metrics.categoryStats || []).reduce(
                          (acc, c) => acc + Number(c.category_revenue || 0),
                          0
                        )
                      );
                      const maxCatRev = Math.max(
                        1,
                        ...(metrics.categoryStats || []).map((c) => Number(c.category_revenue || 0))
                      );
                      const barPct = Math.min(
                        100,
                        Math.round((Number(cat.category_revenue || 0) / maxCatRev) * 100)
                      );
                      const sharePct = Math.round((Number(cat.category_revenue || 0) / totalRev) * 100);

                      return (
                        <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              fontSize: '0.84rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                {cat.icon || '🛍️'} {cat.name}
                              </span>
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>
                                · {cat.products_count} SP · {cat.total_stock} {unitLabel}
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '8px',
                                fontVariantNumeric: 'tabular-nums'
                              }}
                            >
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                {sharePct}%
                              </span>
                              <strong style={{ color: 'var(--text-main)' }}>
                                {formatMoney(cat.category_revenue)}
                              </strong>
                            </div>
                          </div>

                          <div
                            style={{
                              width: '100%',
                              height: '7px',
                              background: 'var(--bg-surface-elevated)',
                              borderRadius: '999px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(barPct, Number(cat.category_revenue) > 0 ? 6 : 2)}%`,
                                height: '100%',
                                background: 'var(--text-main)',
                                borderRadius: '999px'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Top Selling Products & Payment Method Split */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="admin-surface-card">
                    <div className="admin-surface-header">
                      <h3 className="admin-surface-title">Sản phẩm Doanh thu Cao nhất</h3>
                      <span className="admin-surface-meta">Top {(metrics.topProducts || []).length}</span>
                    </div>

                    {(metrics.topProducts || []).length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Chưa có dữ liệu sản phẩm bán ra.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(metrics.topProducts || []).map((tp, idx) => (
                          <div
                            key={tp.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 12px',
                              background: 'var(--bg-surface-elevated)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-glass)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  color: idx === 0 ? 'var(--accent-cyan)' : 'var(--text-dim)',
                                  width: '22px'
                                }}
                              >
                                0{idx + 1}
                              </span>
                              <div>
                                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                  {tp.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    fontVariantNumeric: 'tabular-nums'
                                  }}
                                >
                                  Sản lượng: <strong>{tp.units_sold}</strong> {unitLabel}
                                </div>
                              </div>
                            </div>
                            <strong
                              style={{
                                color: 'var(--text-main)',
                                fontSize: '0.88rem',
                                fontVariantNumeric: 'tabular-nums'
                              }}
                            >
                              {formatMoney(tp.revenue)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-surface-card">
                    <div className="admin-surface-header">
                      <h3 className="admin-surface-title">Cơ cấu Phương thức Thanh toán &amp; Trạng thái</h3>
                      <span className="admin-surface-meta">Toàn thời gian</span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      <div
                        style={{
                          padding: '12px',
                          background: 'var(--bg-surface-elevated)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Chuyển khoản VietQR
                        </div>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>
                          {metrics.vietqrOrders ?? 0}
                        </strong>
                      </div>
                      <div
                        style={{
                          padding: '12px',
                          background: 'var(--bg-surface-elevated)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Thu hộ COD
                        </div>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--accent-emerald)' }}>
                          {metrics.codOrders ?? 0}
                        </strong>
                      </div>
                      <div
                        style={{
                          padding: '12px',
                          background: 'var(--bg-surface-elevated)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Đơn đã hủy
                        </div>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--accent-rose)' }}>
                          {metrics.canceledOrders ?? 0}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Warning Table */}
              {(metrics.lowStockItems || []).length > 0 && (
                <div className="admin-surface-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-glass)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={17} style={{ color: 'var(--accent-amber)' }} />
                      <h3 className="admin-surface-title">
                        Danh sách Biến thể SKU cần nhập bổ sung (Tồn kho ≤ 5)
                      </h3>
                    </div>
                    <span className="admin-surface-meta">
                      {(metrics.lowStockItems || []).length} biến thể cảnh báo
                    </span>
                  </div>

                  <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Mã SKU</th>
                          <th>Sản phẩm &amp; Phân loại</th>
                          <th className="col-num">Đơn giá</th>
                          <th className="col-num">Tồn kho hiện tại</th>
                          <th className="col-num">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(metrics.lowStockItems || []).map((item) => (
                          <tr key={item.id}>
                            <td>
                              <code className="mono-code">{item.sku}</code>
                            </td>
                            <td>
                              <strong>{item.product_title}</strong>
                              <span style={{ color: 'var(--text-muted)' }}> · {item.variant_title}</span>
                            </td>
                            <td className="col-num">{formatMoney(item.price)}</td>
                            <td className="col-num">
                              <strong
                                style={{
                                  color:
                                    item.inventory_quantity === 0
                                      ? 'var(--accent-rose)'
                                      : 'var(--accent-amber)'
                                }}
                              >
                                {item.inventory_quantity} {unitLabel}
                              </strong>
                            </td>
                            <td className="col-num">
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '5px 12px', fontSize: '0.76rem' }}
                                onClick={() => setEditingVariantProductId(item.product_id)}
                              >
                                <Edit3 size={13} />
                                <span>Nhập bổ sung</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              MODULE 2: ORDERS & FULFILLMENT MANAGEMENT
             ========================================================= */}
          {activeTab === 'tabOrders' && (
            <div>
              {/* Segmented Filter & Search Toolbar */}
              <div className="admin-toolbar">
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segmented-btn ${filterPayment === 'all' && filterFulfillment === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterPayment('all');
                      setFilterFulfillment('all');
                    }}
                  >
                    Tất cả ({orders.length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${filterPayment === 'awaiting_vietqr' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterPayment('awaiting_vietqr');
                      setFilterFulfillment('all');
                    }}
                  >
                    Chờ VietQR ({orders.filter((o) => o.payment_status === 'awaiting_vietqr').length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${filterPayment === 'captured' && filterFulfillment === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterPayment('captured');
                      setFilterFulfillment('all');
                    }}
                  >
                    Đã thu tiền ({orders.filter((o) => o.payment_status === 'captured').length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${filterFulfillment === 'processing' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterPayment('all');
                      setFilterFulfillment('processing');
                    }}
                  >
                    Chờ xử lý ({orders.filter((o) => o.fulfillment_status === 'processing').length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${filterFulfillment === 'shipped' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterPayment('all');
                      setFilterFulfillment('shipped');
                    }}
                  >
                    Đang giao ({orders.filter((o) => o.fulfillment_status === 'shipped').length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${filterFulfillment === 'delivered' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterPayment('all');
                      setFilterFulfillment('delivered');
                    }}
                  >
                    Hoàn tất ({orders.filter((o) => o.fulfillment_status === 'delivered').length})
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1 1 320px', justifyContent: 'flex-end' }}>
                  <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '320px' }}>
                    <Search
                      size={15}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-dim)'
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tìm mã đơn, tên khách, SĐT..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      style={{ padding: '7px 12px 7px 34px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <select
                    className="form-select"
                    value={filterFulfillment}
                    onChange={(e) => setFilterFulfillment(e.target.value)}
                    style={{ width: 'auto', padding: '7px 12px', fontSize: '0.82rem' }}
                  >
                    <option value="all">Mọi trạng thái giao vận</option>
                    <option value="processing">Chờ xử lý</option>
                    <option value="packing">Đang đóng gói</option>
                    <option value="shipped">Đang giao hàng</option>
                    <option value="delivered">Đã nhận hàng</option>
                    <option value="canceled">Đã hủy</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                    onClick={() => {
                      if (!filteredOrders.length) {
                        onToast('Không có đơn hàng nào khớp bộ lọc để xuất', 'error');
                        return;
                      }
                      exportOrdersToCSV(filteredOrders);
                      onToast(`Đã xuất ${filteredOrders.length} đơn hàng theo bộ lọc ra CSV!`);
                    }}
                  >
                    <Download size={14} />
                    <span>Xuất lọc ({filteredOrders.length})</span>
                  </button>
                </div>
              </div>

              {/* Orders Data Grid */}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Chi tiết mặt hàng</th>
                      <th>Thanh toán</th>
                      <th>Tiến độ giao vận</th>
                      <th className="col-num">Tổng thanh toán</th>
                      <th className="col-num">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          Không có đơn hàng nào khớp với điều kiện lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const payClass = o.payment_status === 'captured' ? 'pay-captured' : 'pay-pending';
                        const payLabel = o.payment_status === 'captured' ? 'Đã thu tiền' : 'Chờ VietQR';

                        const fulClass =
                          o.fulfillment_status === 'delivered'
                            ? 'ful-delivered'
                            : o.fulfillment_status === 'shipped'
                            ? 'ful-shipped'
                            : o.fulfillment_status === 'packing'
                            ? 'ful-packing'
                            : o.fulfillment_status === 'canceled'
                            ? 'ful-canceled'
                            : 'ful-processing';
                        const fulLabel =
                          o.fulfillment_status === 'delivered'
                            ? 'Đã giao hàng'
                            : o.fulfillment_status === 'shipped'
                            ? 'Đang vận chuyển'
                            : o.fulfillment_status === 'packing'
                            ? 'Đang đóng gói'
                            : o.fulfillment_status === 'canceled'
                            ? 'Đã hủy'
                            : 'Chờ xử lý';

                        return (
                          <tr key={o.id}>
                            <td>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(o.id)}
                                className="mono-code"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent-cyan)',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textDecoration: 'underline'
                                }}
                              >
                                #{o.display_id}
                              </button>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                {o.payment_method === 'vietqr' ? 'VietQR' : 'COD'}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.customer_name}</div>
                              <div
                                style={{
                                  fontSize: '0.76rem',
                                  color: 'var(--text-muted)',
                                  fontVariantNumeric: 'tabular-nums'
                                }}
                              >
                                {o.customer_phone}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.8rem', maxWidth: '280px' }}>
                              {(o.items || []).map((i, idx) => (
                                <div key={idx} style={{ lineHeight: 1.4 }}>
                                  <span style={{ fontWeight: 600 }}>{i.product_title}</span>{' '}
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    ({i.variant_title}) ×{i.quantity}
                                  </span>
                                </div>
                              ))}
                            </td>
                            <td>
                              <span className={`status-badge ${payClass}`}>{payLabel}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${fulClass}`}>{fulLabel}</span>
                            </td>
                            <td className="col-num">
                              <strong style={{ fontSize: '0.9rem' }}>{formatMoney(o.total_amount)}</strong>
                            </td>
                            <td className="col-num">
                              <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                                  onClick={() => setSelectedOrderId(o.id)}
                                  title="Xem chi tiết & In phiếu giao hàng"
                                >
                                  <Eye size={13} />
                                  <span>Chi tiết / In</span>
                                </button>

                                {o.payment_status !== 'captured' && o.fulfillment_status !== 'canceled' && (
                                  <button
                                    className="btn btn-primary"
                                    style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                                    onClick={() => handleCapturePayment(o.id)}
                                  >
                                    <span>Xác nhận thu</span>
                                  </button>
                                )}

                                {o.fulfillment_status !== 'delivered' && o.fulfillment_status !== 'canceled' && (
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                                    onClick={() => handleAdvanceFulfillment(o.id, o.fulfillment_status)}
                                  >
                                    <span>Chuyển bước</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 3: INVENTORY & MULTI-VARIANT CATALOG
             ========================================================= */}
          {activeTab === 'tabInventory' && (
            <div>
              {/* Inventory Filter & Search Toolbar */}
              <div className="admin-toolbar">
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segmented-btn ${inventoryStockFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setInventoryStockFilter('all')}
                  >
                    Tất cả ({inventory.length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${inventoryStockFilter === 'published' ? 'active' : ''}`}
                    onClick={() => setInventoryStockFilter('published')}
                  >
                    Đang bán ({inventory.filter((p) => p.is_published !== false).length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${inventoryStockFilter === 'low' ? 'active' : ''}`}
                    onClick={() => setInventoryStockFilter('low')}
                  >
                    Tồn kho thấp ≤ 10 ({inventory.filter((p) => Number(p.total_inventory) <= 10).length})
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${inventoryStockFilter === 'hidden' ? 'active' : ''}`}
                    onClick={() => setInventoryStockFilter('hidden')}
                  >
                    Đang ẩn ({inventory.filter((p) => p.is_published === false).length})
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1 1 300px', justifyContent: 'flex-end' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '280px' }}>
                    <Search
                      size={15}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-dim)'
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tìm tên sản phẩm, slug..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      style={{ padding: '7px 12px 7px 34px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <select
                    className="form-select"
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                    style={{ width: 'auto', padding: '7px 12px', fontSize: '0.82rem' }}
                  >
                    <option value="all">Tất cả ngành hàng ({categoriesList.length})</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inventory Data Table */}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Ngành hàng</th>
                      <th>Trạng thái</th>
                      <th className="col-num">Số SKU</th>
                      <th className="col-num">Khoảng giá niêm yết</th>
                      <th className="col-num">Tổng tồn kho</th>
                      <th className="col-num">Thao tác quản trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          Không tìm thấy sản phẩm nào khớp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((p) => {
                        const isPublished = p.is_published !== false;
                        return (
                          <tr key={p.id} style={{ opacity: isPublished ? 1 : 0.65 }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={p.thumbnail}
                                  alt={p.title}
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-glass)',
                                    background: 'var(--bg-media)',
                                    flexShrink: 0
                                  }}
                                />
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.title}</div>
                                  <div className="mono-code" style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                                    {p.slug}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.83rem', color: 'var(--text-main)' }}>
                                {p.category_icon || '🛍️'} {p.category_name}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${isPublished ? 'pay-captured' : 'ful-canceled'}`}>
                                {isPublished ? 'Đang bán' : 'Đang ẩn'}
                              </span>
                            </td>
                            <td className="col-num">
                              <span className="mono-code">{p.variants_count} SKU</span>
                            </td>
                            <td className="col-num">
                              {Number(p.min_price) === Number(p.max_price)
                                ? formatMoney(p.min_price)
                                : `${formatMoney(p.min_price)} – ${formatMoney(p.max_price)}`}
                            </td>
                            <td className="col-num">
                              <strong
                                style={{
                                  color:
                                    p.total_inventory <= 10 ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                                }}
                              >
                                {p.total_inventory} {unitLabel}
                              </strong>
                            </td>
                            <td className="col-num">
                              <div
                                style={{
                                  display: 'inline-flex',
                                  gap: '6px',
                                  flexWrap: 'wrap',
                                  justifyContent: 'flex-end'
                                }}
                              >
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                  onClick={() => setEditingProduct(p)}
                                  title="Sửa tên, ảnh, danh mục, mô tả sản phẩm"
                                >
                                  <Edit3 size={13} />
                                  <span>Sửa SP</span>
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                  onClick={() => setEditingVariantProductId(p.id)}
                                  title="Quản lý các biến thể SKU, giá bán và tồn kho"
                                >
                                  <Layers size={13} />
                                  <span>Biến thể &amp; Kho</span>
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                  onClick={() => handleToggleProductPublish(p)}
                                  title={
                                    isPublished
                                      ? 'Tạm ẩn sản phẩm khỏi gian hàng'
                                      : 'Hiển thị lại sản phẩm'
                                  }
                                >
                                  {isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                                  <span>{isPublished ? 'Ẩn' : 'Hiện'}</span>
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{
                                    padding: '5px 8px',
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-rose)'
                                  }}
                                  onClick={() => handleDeleteProduct(p)}
                                  title="Xóa sản phẩm này"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 4: PROMOTIONS & VOUCHERS
             ========================================================= */}
          {activeTab === 'tabPromotions' && (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã Voucher</th>
                    <th>Hình thức ưu đãi</th>
                    <th className="col-num">Giá trị giảm</th>
                    <th className="col-num">Đơn tối thiểu</th>
                    <th className="col-num">Đã dùng / Giới hạn</th>
                    <th>Trạng thái</th>
                    <th className="col-num">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        Chưa có mã khuyến mãi nào. Hãy bấm &ldquo;Tạo Voucher Mới&rdquo; ở góc trên bên phải.
                      </td>
                    </tr>
                  ) : (
                    promotions.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong className="mono-code" style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                            {p.code}
                          </strong>
                        </td>
                        <td>{p.type === 'percentage' ? 'Chiết khấu theo %' : 'Giảm tiền mặt trực tiếp'}</td>
                        <td className="col-num">
                          <strong>{p.type === 'percentage' ? `${p.value}%` : formatMoney(p.value)}</strong>
                        </td>
                        <td className="col-num">{formatMoney(p.min_order_value)}</td>
                        <td className="col-num">
                          <span className="mono-code">
                            {p.usage_count} / {p.usage_limit}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${p.is_active ? 'pay-captured' : 'ful-canceled'}`}>
                            {p.is_active ? 'Đang kích hoạt' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="col-num">
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.76rem' }}
                            onClick={() => handleTogglePromo(p.id)}
                          >
                            {p.is_active ? 'Tạm dừng' : 'Kích hoạt'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* =========================================================
              MODULE 5: STORE BRANDING, VIETQR BANK & CATEGORIES
             ========================================================= */}
          {activeTab === 'tabStoreSettings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1-Click Industry Store Presets */}
              <div className="admin-surface-card">
                <div className="admin-surface-header">
                  <div>
                    <h3 className="admin-surface-title">
                      Chuyển Đổi Nhanh Mô Hình Cửa Hàng Mẫu (1-Click Store Presets)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Chọn một định hướng ngành hàng để tự động đồng bộ tên thương hiệu, thông điệp Hero Banner và đơn vị tính tồn kho:
                    </p>
                  </div>
                  <span className="admin-surface-meta">5 mẫu ngành hàng</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {STORE_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={brandForm.preset_key === preset.key ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                  gap: '20px',
                  alignItems: 'start'
                }}
              >
                {/* Left Column: Store Branding + VietQR Bank & Shipping Form */}
                <div className="admin-surface-card">
                  <div className="admin-surface-header">
                    <h3 className="admin-surface-title">
                      Nhận diện Thương hiệu, Tài khoản VietQR &amp; Biểu phí
                    </h3>
                  </div>

                  <form
                    onSubmit={handleSaveBrandSettings}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div className="form-row">
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Tên thương hiệu cửa hàng
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={brandForm.store_name}
                          onChange={(e) => setBrandForm({ ...brandForm, store_name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Khẩu hiệu ngắn (Tagline)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={brandForm.store_tagline}
                          onChange={(e) => setBrandForm({ ...brandForm, store_tagline: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Nhãn chiến dịch (Hero Badge)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={brandForm.hero_badge}
                          onChange={(e) => setBrandForm({ ...brandForm, hero_badge: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Đơn vị tính tồn kho (VD: sản phẩm, món, chiếc)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={brandForm.unit_label}
                          onChange={(e) => setBrandForm({ ...brandForm, unit_label: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Tiêu đề chính Hero (Dòng 1)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={brandForm.hero_title}
                          onChange={(e) => setBrandForm({ ...brandForm, hero_title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Điểm nhấn tiêu đề (Dòng 2)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={brandForm.hero_highlight}
                          onChange={(e) => setBrandForm({ ...brandForm, hero_highlight: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          marginBottom: '4px'
                        }}
                      >
                        Mô tả chiến dịch Hero Banner
                      </label>
                      <textarea
                        rows={2}
                        className="form-textarea"
                        value={brandForm.hero_subtitle}
                        onChange={(e) => setBrandForm({ ...brandForm, hero_subtitle: e.target.value })}
                      />
                    </div>

                    <div className="form-row">
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Ảnh Hero Banner (URL hoặc Tải từ máy)
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={brandForm.hero_image}
                            onChange={(e) => setBrandForm({ ...brandForm, hero_image: e.target.value })}
                            style={{ flex: 1 }}
                          />
                          <label
                            className="btn btn-secondary"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              margin: 0
                            }}
                          >
                            <Upload size={14} />
                            <span>{isUploadingBanner ? 'Đang tải...' : 'Tải ảnh'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadHeroImage}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Giao diện mặc định
                        </label>
                        <select
                          className="form-select"
                          value={brandForm.default_theme}
                          onChange={(e) => setBrandForm({ ...brandForm, default_theme: e.target.value })}
                        >
                          <option value="light">Editorial Light (Sáng thanh lịch)</option>
                          <option value="dark">Studio Dark (Tối hiện đại)</option>
                        </select>
                      </div>
                    </div>

                    {/* VietQR Bank, Shipping & Contact Configuration */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border-glass)',
                        paddingTop: '16px',
                        marginTop: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        Tài khoản Thụ hưởng VietQR, Vận chuyển &amp; Địa chỉ Kho
                      </h4>

                      <div className="form-row">
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              marginBottom: '4px'
                            }}
                          >
                            Ngân hàng thụ hưởng (VietQR Bank ID)
                          </label>
                          <select
                            className="form-select"
                            value={brandForm.bank_id || 'MB'}
                            onChange={(e) => {
                              const map = {
                                MB: 'MB Bank',
                                VCB: 'Vietcombank',
                                TCB: 'Techcombank',
                                ACB: 'ACB',
                                BIDV: 'BIDV',
                                ICB: 'VietinBank',
                                VPB: 'VPBank',
                                TPB: 'TPBank'
                              };
                              setBrandForm({
                                ...brandForm,
                                bank_id: e.target.value,
                                bank_name: map[e.target.value] || e.target.value
                              });
                            }}
                          >
                            <option value="MB">MB - Ngân hàng Quân Đội (MB Bank)</option>
                            <option value="VCB">VCB - Vietcombank</option>
                            <option value="TCB">TCB - Techcombank</option>
                            <option value="ACB">ACB - Ngân hàng Á Châu</option>
                            <option value="BIDV">BIDV - Đầu tư &amp; Phát triển VN</option>
                            <option value="ICB">ICB - VietinBank</option>
                            <option value="VPB">VPB - VPBank</option>
                            <option value="TPB">TPB - Tiên Phong Bank</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              marginBottom: '4px'
                            }}
                          >
                            Số tài khoản nhận tiền
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={brandForm.bank_account_no || ''}
                            onChange={(e) => setBrandForm({ ...brandForm, bank_account_no: e.target.value })}
                            placeholder="VD: 0369123456789"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              marginBottom: '4px'
                            }}
                          >
                            Tên chủ tài khoản (Không dấu in hoa)
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={brandForm.bank_account_name || ''}
                            onChange={(e) =>
                              setBrandForm({ ...brandForm, bank_account_name: e.target.value.toUpperCase() })
                            }
                            placeholder="VD: NGUYEN VAN A"
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              marginBottom: '4px'
                            }}
                          >
                            Hotline CSKH / In trên Phiếu giao hàng
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={brandForm.store_phone || ''}
                            onChange={(e) => setBrandForm({ ...brandForm, store_phone: e.target.value })}
                            placeholder="VD: 1900 6868"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              marginBottom: '4px'
                            }}
                          >
                            Phí vận chuyển tiêu chuẩn (VNĐ)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={brandForm.base_shipping_fee ?? 35000}
                            onChange={(e) =>
                              setBrandForm({ ...brandForm, base_shipping_fee: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              marginBottom: '4px'
                            }}
                          >
                            Mức đơn tối thiểu Freeship (VNĐ)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={brandForm.free_shipping_threshold ?? 1000000}
                            onChange={(e) =>
                              setBrandForm({ ...brandForm, free_shipping_threshold: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginBottom: '4px'
                          }}
                        >
                          Địa chỉ Kho / Cửa hàng Flagship (In trên Hóa đơn &amp; Vận đơn)
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={brandForm.store_address || ''}
                          onChange={(e) => setBrandForm({ ...brandForm, store_address: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSavingBrand}
                      style={{ marginTop: '6px' }}
                    >
                      <Save size={16} />
                      <span>{isSavingBrand ? 'Đang lưu cấu hình...' : 'Lưu Toàn Bộ Cấu Hình Cửa Hàng'}</span>
                    </button>
                  </form>
                </div>

                {/* Right Column: Dynamic Category Manager */}
                <div className="admin-surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="admin-surface-header" style={{ marginBottom: 0 }}>
                    <div>
                      <h3 className="admin-surface-title">Danh mục Ngành hàng Kinh doanh</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Khởi tạo hoặc xóa các bộ sưu tập ngành hàng hiển thị trên thanh điều hướng:
                      </p>
                    </div>
                    <span className="admin-surface-meta">{categoriesList.length} danh mục</span>
                  </div>

                  <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Icon"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      style={{ width: '64px', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tên ngành hàng mới (VD: Trang sức & Đồng hồ)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      style={{ flex: 1, minWidth: '180px' }}
                      required
                    />
                    <button type="submit" className="btn btn-primary" disabled={isCreatingCat}>
                      <Plus size={15} />
                      <span>Thêm</span>
                    </button>
                  </form>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '460px',
                      overflowY: 'auto'
                    }}
                  >
                    {categoriesList.map((cat) => (
                      <div
                        key={cat.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.15rem' }}>{cat.icon || '🛍️'}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                              {cat.name}
                            </div>
                            <div
                              style={{
                                fontSize: '0.74rem',
                                color: 'var(--text-dim)',
                                fontVariantNumeric: 'tabular-nums'
                              }}
                            >
                              <code>{cat.slug}</code> · {cat.products_count ?? 0} {unitLabel}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          title="Xóa danh mục này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 6: VIETQR 24/7 WEBHOOK LOGS & SIMULATOR
             ========================================================= */}
          {activeTab === 'tabWebhooks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Endpoint Spec & Simulator Toolbar */}
              <div className="admin-surface-card">
                <div className="admin-surface-header">
                  <div>
                    <h3 className="admin-surface-title">
                      Trình Giả Lập Bắn Tín Hiệu Ngân Hàng (Open Banking Webhook Simulator)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Endpoint nhận biến động số dư tự động:{' '}
                      <code className="mono-code">POST /api/webhooks/vietqr</code> · Tự động chuyển trạng thái đơn sang{' '}
                      <strong>Đã thu tiền (Captured)</strong>.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSimulateWebhook}
                  style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mã đơn hàng (VD: TP-9619)"
                    value={simOrderCode}
                    onChange={(e) => setSimOrderCode(e.target.value)}
                    style={{ flex: '1 1 200px', maxWidth: '260px' }}
                    required
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Số tiền chuyển (Trống = tự khớp đủ)"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    style={{ flex: '1 1 220px', maxWidth: '280px' }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={isSimulating}>
                    <Send size={14} />
                    <span>{isSimulating ? 'Đang gửi...' : 'Giả lập Khớp lệnh Ngân hàng'}</span>
                  </button>
                </form>
              </div>

              {/* Webhook History Table */}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Cổng / Ngân hàng</th>
                      <th>Mã đơn khớp</th>
                      <th className="col-num">Số tiền nhận</th>
                      <th>Mã tham chiếu (Ref)</th>
                      <th>Trạng thái</th>
                      <th>Chi tiết đối soát</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhookLogs.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          Chưa có tín hiệu webhook nào được ghi nhận. Hãy nhập mã đơn hàng ở trên để thử nghiệm đối soát tự động.
                        </td>
                      </tr>
                    ) : (
                      webhookLogs.map((log) => {
                        const statusClass =
                          log.status === 'success'
                            ? 'pay-captured'
                            : log.status === 'partial'
                            ? 'pay-pending'
                            : 'ful-canceled';
                        const statusLabel =
                          log.status === 'success'
                            ? 'Khớp thành công'
                            : log.status === 'partial'
                            ? 'Chuyển thiếu'
                            : 'Bỏ qua';

                        return (
                          <tr key={log.id}>
                            <td className="mono-code" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {new Date(log.created_at).toLocaleString('vi-VN')}
                            </td>
                            <td>
                              <strong>{log.gateway || 'MB Bank'}</strong>
                            </td>
                            <td>
                              {log.order_display_id ? (
                                <strong className="mono-code" style={{ color: 'var(--accent-cyan)' }}>
                                  #{log.order_display_id}
                                </strong>
                              ) : (
                                <span style={{ color: 'var(--text-dim)' }}>Không xác định</span>
                              )}
                            </td>
                            <td className="col-num">
                              <strong>{formatMoney(log.amount)}</strong>
                            </td>
                            <td>
                              <code className="mono-code" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {log.transaction_ref}
                              </code>
                            </td>
                            <td>
                              <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                              {log.response_message}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 7: TRANSACTIONAL EMAILS & NOTIFICATIONS
             ========================================================= */}
          {activeTab === 'tabEmails' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="admin-surface-card">
                <div className="admin-surface-header">
                  <div>
                    <h3 className="admin-surface-title">
                      Trình Thử Nghiệm Email Giao Dịch Tự Động (Nodemailer Sandbox)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Gửi thử nghiệm mẫu email HTML thông báo đơn hàng, biên lai VietQR và vận đơn cho khách hàng:
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSendTestEmail}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
                >
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Email người nhận (VD: khachhang@atelier.vn)..."
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    style={{ flex: '1 1 240px', maxWidth: '320px' }}
                  />
                  <select
                    className="form-select"
                    value={testEmailType}
                    onChange={(e) => setTestEmailType(e.target.value)}
                    style={{ width: 'auto', minWidth: '250px' }}
                  >
                    <option value="ORDER">1. Xác nhận đơn hàng (Kèm mã VietQR)</option>
                    <option value="PAYMENT">2. Biên lai thanh toán VietQR thành công</option>
                    <option value="SHIPPING">3. Thông báo bàn giao đơn vị vận chuyển</option>
                  </select>

                  <button type="submit" className="btn btn-primary" disabled={isSendingEmail}>
                    <Send size={14} />
                    <span>{isSendingEmail ? 'Đang gửi...' : 'Gửi Email Thử Nghiệm'}</span>
                  </button>
                </form>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Loại thông báo</th>
                      <th>Người nhận</th>
                      <th>Tiêu đề Email</th>
                      <th>Trạng thái</th>
                      <th className="col-num">Xem bản mẫu HTML</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          Chưa có email giao dịch nào được gửi trong phiên làm việc này.
                        </td>
                      </tr>
                    ) : (
                      emailLogs.map((log) => {
                        let badgeClass = 'ful-processing';
                        let typeLabel = log.template_type;

                        if (log.template_type === 'ORDER_CONFIRMATION') {
                          badgeClass = 'ful-packing';
                          typeLabel = 'Xác nhận đơn';
                        } else if (log.template_type === 'PAYMENT_SUCCESS') {
                          badgeClass = 'pay-captured';
                          typeLabel = 'Biên lai thanh toán';
                        } else if (log.template_type === 'SHIPPING_OUT') {
                          badgeClass = 'ful-shipped';
                          typeLabel = 'Đang giao hàng';
                        }

                        return (
                          <tr key={log.id}>
                            <td className="mono-code" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {new Date(log.created_at).toLocaleString('vi-VN')}
                            </td>
                            <td>
                              <span className={`status-badge ${badgeClass}`}>{typeLabel}</span>
                            </td>
                            <td>
                              <strong>{log.to_email}</strong>
                            </td>
                            <td style={{ maxWidth: '300px' }}>{log.subject}</td>
                            <td>
                              <span
                                className={`status-badge ${
                                  log.status === 'sent' ? 'pay-captured' : 'ful-canceled'
                                }`}
                              >
                                {log.status === 'sent' ? 'Đã gửi' : 'Lỗi gửi'}
                              </span>
                            </td>
                            <td className="col-num">
                              {log.preview_url ? (
                                <a
                                  href={log.preview_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                >
                                  <span>Xem trước</span>
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>SMTP nội bộ</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 7: Installation & Deployment Documentation */}
          {activeTab === 'tabDocs' && <AdminDocsTab onToast={onToast} />}
        </div>
      </div>

      {/* Sub-Modals */}
      <AdminOrderDetailModal
        orderId={selectedOrderId}
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        token={token}
        onToast={onToast}
        onOrderUpdated={loadData}
        storeSettings={storeSettings}
      />

      <AdminCreateProductModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        token={token}
        onToast={onToast}
        onCreated={() => {
          loadData();
          if (onProductsUpdated) onProductsUpdated();
        }}
      />

      <AdminEditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        token={token}
        categories={categoriesList}
        onToast={onToast}
        onUpdated={() => {
          loadData();
          if (onProductsUpdated) onProductsUpdated();
        }}
      />

      <AdminCreatePromoModal
        isOpen={isCreatePromoOpen}
        onClose={() => setIsCreatePromoOpen(false)}
        token={token}
        onToast={onToast}
        onCreated={loadData}
      />

      <AdminVariantEditModal
        productId={editingVariantProductId}
        isOpen={Boolean(editingVariantProductId)}
        onClose={() => setEditingVariantProductId(null)}
        token={token}
        onToast={onToast}
        unitLabel={unitLabel}
        onUpdated={() => {
          loadData();
          if (onProductsUpdated) onProductsUpdated();
        }}
      />
    </section>
  );
}
