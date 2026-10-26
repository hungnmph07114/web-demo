import React, { useState, useEffect } from 'react';
import { formatMoney, fetchApi, exportOrdersToCSV } from '../services/api';
import { RefreshCw, Plus, DollarSign, Package, Clock, AlertTriangle, QrCode, Tag, Layers, Eye, Edit3, Zap, Send, Download } from 'lucide-react';
import AdminOrderDetailModal from './AdminOrderDetailModal';
import AdminCreateProductModal from './AdminCreateProductModal';
import AdminCreatePromoModal from './AdminCreatePromoModal';
import AdminVariantEditModal from './AdminVariantEditModal';

export default function AdminPortal({ token, onToast, onOpenProductModal }) {
  const [activeTab, setActiveTab] = useState('tabDashboard');
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterFulfillment, setFilterFulfillment] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Webhook Simulator state in Admin
  const [simOrderCode, setSimOrderCode] = useState('');
  const [simAmount, setSimAmount] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Sub-modal states
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
  const [editingVariantProductId, setEditingVariantProductId] = useState(null);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mRes, oRes, iRes, pRes, wRes] = await Promise.all([
        fetchApi('/api/dashboard/metrics', {}, token),
        fetchApi('/api/orders', {}, token),
        fetchApi('/api/products', {}, token),
        fetchApi('/api/promotions', {}, token),
        fetchApi('/api/webhooks/vietqr/logs?limit=30', {}, token).catch(() => ({ data: [] }))
      ]);
      setMetrics(mRes.data);
      setOrders(oRes.data);
      setInventory(iRes.data);
      setPromotions(pRes.data);
      setWebhookLogs(wRes.data || []);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Actions
  const handleCapturePayment = async (orderId) => {
    if (!window.confirm('Xác nhận đã nhận đủ tiền chuyển khoản cho đơn hàng này?')) return;
    try {
      await fetchApi(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'captured', note: 'Quản trị viên xác nhận đã nhận chuyển khoản' })
      }, token);
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
      await fetchApi(`/api/orders/${orderId}/fulfillment`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus, note: `Cập nhật giao vận sang ${nextStatus}` })
      }, token);
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
          bank_name: 'MB Bank (Simulator 24/7)'
        })
      });

      if (res.success) {
        onToast(`⚡ Webhook thành công: ${res.message}`);
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

  // Filtered orders
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

  return (
    <section className="view-section active">
      {/* Top Bar */}
      <div className="admin-top-bar">
        <div>
          <h1 className="admin-title">Bảng Điều Khiển Quản Trị (Admin Portal)</h1>
          <p className="admin-sub">Quản lý toàn diện theo kiến trúc Module: Doanh thu, Đơn hàng, Biến thể & Cổng VietQR 24/7</p>
        </div>
        <div className="admin-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (!orders.length) {
                onToast('Không có đơn hàng nào để xuất', 'error');
                return;
              }
              exportOrdersToCSV(orders);
              onToast(`Đã tải file Excel báo cáo toàn bộ ${orders.length} đơn hàng!`);
            }}
            title="Xuất toàn bộ doanh thu và danh sách đơn hàng ra file Excel / CSV (UTF-8)"
          >
            <Download size={15} />
            <span>Xuất Excel ({orders.length})</span>
          </button>
          <button className="btn btn-secondary" onClick={loadData} disabled={isLoading}>
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'tabDashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('tabDashboard')}
        >
          📊 Tổng quan & Thống kê
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'tabOrders' ? 'active' : ''}`}
          onClick={() => setActiveTab('tabOrders')}
        >
          📦 Quản lý Đơn hàng ({orders.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'tabInventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('tabInventory')}
        >
          🏷️ Sản phẩm & Biến thể ({inventory.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'tabPromotions' ? 'active' : ''}`}
          onClick={() => setActiveTab('tabPromotions')}
        >
          🎟️ Mã Khuyến Mãi ({promotions.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'tabWebhooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tabWebhooks')}
        >
          ⚡ Cổng VietQR 24/7 ({webhookLogs.length})
        </button>
      </div>

      {/* Tab 1: Dashboard Stats */}
      {activeTab === 'tabDashboard' && metrics && (
        <div className="admin-tab-content active">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon money">
                <DollarSign size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Tổng doanh thu thực nhận</span>
                <h3 className="kpi-value">{formatMoney(metrics.revenue)}</h3>
                <span className="kpi-hint">Đơn hàng đã thanh toán (Captured)</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon orders">
                <Package size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Tổng số đơn hàng</span>
                <h3 className="kpi-value">{metrics.totalOrders}</h3>
                <span className="kpi-hint">{metrics.completedOrders} đơn giao thành công</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon pending">
                <Clock size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Chờ quét VietQR</span>
                <h3 className="kpi-value">{metrics.pendingPaymentOrders}</h3>
                <span className="kpi-hint">Đang giữ chỗ tồn kho</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon stock">
                <AlertTriangle size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Cảnh báo sắp hết hàng</span>
                <h3 className="kpi-value" style={{ color: metrics.lowStockCount > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                  {metrics.lowStockCount} biến thể
                </h3>
                <span className="kpi-hint">Số lượng tồn kho ≤ 10 máy</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--accent-cyan)' }}>🚀 Thao tác kho hàng nhanh</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Thêm dòng sản phẩm công nghệ mới hoặc cập nhật trực tiếp biến thể giá/tồn kho.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={() => setIsCreateProductOpen(true)}>
                  <Plus size={16} />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('tabInventory')}>
                  <Layers size={16} />
                  <span>Xem Kho Biến Thể</span>
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--accent-emerald)' }}>⚡ Webhook VietQR Tự Động 24/7</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Tự động nhận diện biến động số dư ngân hàng và khớp trạng thái đơn hàng tức thì.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={() => setActiveTab('tabWebhooks')}>
                  <Zap size={16} />
                  <span>Nhật Ký Webhook</span>
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('tabOrders')}>
                  <span>Xem Đơn Hàng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders List */}
      {activeTab === 'tabOrders' && (
        <div className="admin-tab-content active">
          {/* Filters Bar */}
          <div className="filter-controls-bar">
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Tìm theo Mã đơn (TP-...), Tên khách, SĐT..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">Tất cả thanh toán</option>
                <option value="awaiting_vietqr">Chờ quét VietQR</option>
                <option value="captured">Đã nhận tiền (Captured)</option>
              </select>

              <select
                value={filterFulfillment}
                onChange={(e) => setFilterFulfillment(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">Tất cả giao vận</option>
                <option value="processing">Chờ xử lý</option>
                <option value="packing">Đang đóng gói</option>
                <option value="shipped">Đang giao hàng</option>
                <option value="delivered">Đã nhận hàng</option>
                <option value="canceled">Đã hủy</option>
              </select>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (!filteredOrders.length) {
                    onToast('Không có đơn hàng nào khớp bộ lọc để xuất', 'error');
                    return;
                  }
                  exportOrdersToCSV(filteredOrders);
                  onToast(`Đã xuất ${filteredOrders.length} đơn hàng ra file Excel!`);
                }}
                title="Xuất các đơn hàng theo bộ lọc hiện tại ra Excel / CSV"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Xuất lọc ({filteredOrders.length})</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Mặt hàng</th>
                  <th>Tổng thu</th>
                  <th>Thanh toán</th>
                  <th>Tiến độ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Không có đơn hàng nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const payClass = o.payment_status === 'captured' ? 'pay-captured' : 'pay-pending';
                    const payLabel = o.payment_status === 'captured' ? '✅ Đã thanh toán' : '⏳ Chờ VietQR';

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
                        ? '🎉 Đã nhận hàng'
                        : o.fulfillment_status === 'shipped'
                        ? '🚚 Đang giao'
                        : o.fulfillment_status === 'packing'
                        ? '📦 Đang đóng gói'
                        : o.fulfillment_status === 'canceled'
                        ? '✕ Đã hủy'
                        : 'Chờ xử lý';

                    return (
                      <tr key={o.id}>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(o.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-cyan)',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: '0.9rem'
                            }}
                          >
                            #{o.display_id}
                          </button>
                        </td>
                        <td>
                          <strong>{o.customer_name}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_phone}</p>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {(o.items || []).map((i, idx) => (
                            <div key={idx}>
                              {i.product_title} ({i.variant_title}) x{i.quantity}
                            </div>
                          ))}
                        </td>
                        <td>
                          <strong style={{ color: '#fff' }}>{formatMoney(o.total_amount)}</strong>
                        </td>
                        <td>
                          <span className={`status-badge ${payClass}`}>{payLabel}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${fulClass}`}>{fulLabel}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => setSelectedOrderId(o.id)}
                              title="Xem chi tiết hóa đơn & nhật ký"
                            >
                              <Eye size={13} />
                              <span>Chi tiết</span>
                            </button>

                            {o.payment_status !== 'captured' && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleCapturePayment(o.id)}
                              >
                                💰 Thu tiền
                              </button>
                            )}

                            {o.fulfillment_status !== 'delivered' && o.fulfillment_status !== 'canceled' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleAdvanceFulfillment(o.id, o.fulfillment_status)}
                              >
                                📦 Tiến độ
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

      {/* Tab 3: Inventory & Variants */}
      {activeTab === 'tabInventory' && (
        <div className="admin-tab-content active">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Danh mục sản phẩm đa biến thể theo tiêu chuẩn MedusaJS (SKU, Giá riêng biệt, Tồn kho thời gian thực)
            </p>
            <button className="btn btn-primary" onClick={() => setIsCreateProductOpen(true)}>
              <Plus size={16} />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Số biến thể</th>
                  <th>Khoảng giá</th>
                  <th>Tổng tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <strong>{p.title}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td>{p.category_icon || '📱'} {p.category_name}</td>
                    <td>
                      <span className="badge">{p.variants_count} biến thể</span>
                    </td>
                    <td>{formatMoney(p.min_price)} - {formatMoney(p.max_price)}</td>
                    <td>
                      <strong
                        style={{
                          color: p.total_inventory <= 10 ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                        }}
                      >
                        {p.total_inventory} máy
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setEditingVariantProductId(p.id)}
                        >
                          <Edit3 size={13} />
                          <span>Sửa kho & giá</span>
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => onOpenProductModal(p.id)}
                        >
                          <Eye size={13} />
                          <span>Xem máy</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Promotions */}
      {activeTab === 'tabPromotions' && (
        <div className="admin-tab-content active">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Quản lý danh sách Voucher khuyến mãi, giới hạn lượt dùng và đơn hàng tối thiểu
            </p>
            <button className="btn btn-primary" onClick={() => setIsCreatePromoOpen(true)}>
              <Plus size={16} />
              <span>Tạo Voucher Mới</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Code</th>
                  <th>Loại ưu đãi</th>
                  <th>Giá trị giảm</th>
                  <th>Đơn tối thiểu</th>
                  <th>Lượt dùng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        {p.code}
                      </strong>
                    </td>
                    <td>{p.type === 'percentage' ? 'Giảm %' : 'Tiền mặt cố định'}</td>
                    <td>
                      <strong>{p.type === 'percentage' ? `${p.value}%` : formatMoney(p.value)}</strong>
                    </td>
                    <td>{formatMoney(p.min_order_value)}</td>
                    <td>
                      {p.usage_count} / {p.usage_limit}
                    </td>
                    <td>
                      <span className={`status-badge ${p.is_active ? 'pay-captured' : 'ful-canceled'}`}>
                        {p.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleTogglePromo(p.id)}
                      >
                        {p.is_active ? '⏸️ Tắt' : '▶️ Bật'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Webhook VietQR Logs & Simulator */}
      {activeTab === 'tabWebhooks' && (
        <div className="admin-tab-content active">
          {/* Webhook Configuration Guide */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 22px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={18} />
              <span>Cấu hình Cổng Webhook VietQR Tự Động 24/7 (SePay / Casso / Open Banking)</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Khi khách hàng chuyển khoản đúng số tiền và nội dung đơn hàng (ví dụ: <code style={{ color: 'var(--accent-cyan)' }}>TP-9619</code>), ngân hàng sẽ tự động gửi webhook đến URL bên dưới để hệ thống cập nhật trạng thái đơn hàng sang <strong>Đã thanh toán (Captured)</strong> trong 1 giây mà không cần con người đối soát thủ công.
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              background: 'rgba(0,0,0,0.3)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Webhook Endpoint URL: </span>
                <strong style={{ color: '#fff', fontFamily: 'monospace' }}>http://localhost:3000/api/webhooks/vietqr</strong>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ color: 'var(--text-dim)' }}>Phương thức: </span>
                <strong style={{ color: 'var(--accent-emerald)', fontFamily: 'monospace' }}>POST</strong> (JSON)
              </div>
            </div>
          </div>

          {/* Test Simulator Card */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: '#fff' }}>
              ⚡ Trình Giả Lập Bắn Tín Hiệu Ngân Hàng (Webhook Simulator)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Thử nghiệm khớp tiền tức thì cho bất kỳ đơn hàng nào đang ở trạng thái <strong>Chờ quét VietQR</strong>:
            </p>
            <form onSubmit={handleSimulateWebhook} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Mã đơn hàng (VD: TP-9619)"
                value={simOrderCode}
                onChange={(e) => setSimOrderCode(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  minWidth: '200px'
                }}
                required
              />
              <input
                type="number"
                placeholder="Số tiền chuyển (Để trống = tự lấy đủ)"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  minWidth: '220px'
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={isSimulating} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Send size={14} />
                <span>{isSimulating ? 'Đang bắn...' : 'Bắn Webhook Giả Lập'}</span>
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
                  <th>Số tiền nhận</th>
                  <th>Mã giao dịch (Ref)</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết đối soát</th>
                </tr>
              </thead>
              <tbody>
                {webhookLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Chưa có tín hiệu webhook nào được ghi nhận. Hãy thử bắn Webhook giả lập ở trên!
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
                        ? '✅ Thành công'
                        : log.status === 'partial'
                        ? '⚠️ Thiếu tiền'
                        : '✕ Bỏ qua';

                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td>
                          <strong>{log.gateway || 'MB'}</strong>
                        </td>
                        <td>
                          {log.order_display_id ? (
                            <strong style={{ color: 'var(--accent-cyan)' }}>#{log.order_display_id}</strong>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>Không tìm thấy</span>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: '#fff' }}>{formatMoney(log.amount)}</strong>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.transaction_ref}</code>
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

      {/* Sub-Modals */}
      <AdminOrderDetailModal
        orderId={selectedOrderId}
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        token={token}
        onToast={onToast}
        onOrderUpdated={loadData}
      />

      <AdminCreateProductModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        token={token}
        onToast={onToast}
        onCreated={loadData}
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
        onUpdated={loadData}
      />
    </section>
  );
}
