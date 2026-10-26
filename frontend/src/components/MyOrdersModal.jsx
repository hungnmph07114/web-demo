import React, { useState, useEffect } from 'react';
import { fetchApi, formatMoney } from '../services/api';
import { X, Package, Clock, QrCode, Truck, CheckCircle, ChevronRight, ShoppingBag, AlertCircle, XCircle } from 'lucide-react';

export default function MyOrdersModal({ isOpen, onClose, token, onToast, onOpenTracking, onOrderUpdated }) {
  if (!isOpen) return null;

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [isCancelingId, setIsCancelingId] = useState(null);

  const loadMyOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/api/orders/my-orders', {}, token);
      setOrders(res.data || []);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrders();
  }, [token]);

  const handleCancelOrder = async (orderId) => {
    setIsCancelingId(orderId);
    try {
      const res = await fetchApi(
        `/api/orders/${orderId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: 'Khách hàng chủ động hủy đơn trên hệ thống' })
        },
        token
      );
      if (res.success) {
        onToast(res.message || 'Đã hủy đơn hàng và hoàn lại tồn kho thành công');
        setConfirmCancelId(null);
        await loadMyOrders();
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsCancelingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'pending_payment') return o.payment_status !== 'captured';
    if (filter === 'shipping') return o.fulfillment_status === 'shipped';
    if (filter === 'delivered') return o.fulfillment_status === 'delivered';
    return true;
  });

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="modal-header-compact" style={{ marginBottom: '16px' }}>
          <h2 className="modal-title" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Đơn Hàng Của Tôi ({orders.length})</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Theo dõi tình trạng đơn hàng, quét lại mã VietQR hoặc kiểm tra tiến độ giao vận thời gian thực
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          {[
            { key: 'all', label: `Tất cả (${orders.length})` },
            { key: 'pending_payment', label: `Chờ thanh toán (${orders.filter(o => o.payment_status !== 'captured').length})` },
            { key: 'shipping', label: `Đang giao (${orders.filter(o => o.fulfillment_status === 'shipped').length})` },
            { key: 'delivered', label: `Đã nhận (${orders.filter(o => o.fulfillment_status === 'delivered').length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                background: filter === tab.key ? 'var(--gradient-brand)' : 'var(--bg-surface-elevated)',
                color: filter === tab.key ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border-glass)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Clock size={28} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <p>Đang tải danh sách đơn hàng của bạn...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '6px' }}>Chưa có đơn hàng nào</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
              Bạn chưa có đơn hàng nào trong mục này. Hãy dạo quanh cửa hàng để chọn thiết bị công nghệ yêu thích nhé!
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredOrders.map((order) => {
              const payClass = order.payment_status === 'captured' ? 'pay-captured' : 'pay-pending';
              const payLabel = order.payment_status === 'captured' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán VietQR';

              const fulClass =
                order.fulfillment_status === 'delivered' ? 'ful-delivered' :
                order.fulfillment_status === 'shipped' ? 'ful-shipped' :
                order.fulfillment_status === 'packing' ? 'ful-packing' :
                order.fulfillment_status === 'canceled' ? 'ful-canceled' : 'ful-processing';

              const fulLabel =
                order.fulfillment_status === 'delivered' ? '🎉 Đã nhận hàng' :
                order.fulfillment_status === 'shipped' ? '🚚 Đang giao hàng' :
                order.fulfillment_status === 'packing' ? '📦 Đang đóng gói' :
                order.fulfillment_status === 'canceled' ? '✕ Đã hủy' : 'Chờ xử lý';

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Order Card Header */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '10px',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          #{order.display_id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          • {new Date(order.created_at).toLocaleDateString('vi-VN')} {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className={`status-badge ${payClass}`} style={{ fontSize: '0.75rem' }}>
                        {payLabel}
                      </span>
                      <span className={`status-badge ${fulClass}`} style={{ fontSize: '0.75rem' }}>
                        {fulLabel}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.thumbnail}
                            alt={item.product_title}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.product_title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {item.variant_title} x{item.quantity}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                          {formatMoney(item.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '10px',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán: </span>
                      <strong style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>
                        {formatMoney(order.total_amount)}
                      </strong>
                      {order.promotion_code && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginLeft: '6px' }}>
                          (Đã áp mã {order.promotion_code})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {order.fulfillment_status === 'processing' && order.payment_status !== 'captured' && (
                        confirmCancelId === order.id ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={isCancelingId === order.id}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.2)',
                                borderColor: 'rgba(239, 68, 68, 0.5)',
                                color: '#F87171'
                              }}
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <span>{isCancelingId === order.id ? 'Đang hủy...' : 'Xác nhận hủy đơn'}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => setConfirmCancelId(null)}
                            >
                              <span>Không</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              borderColor: 'rgba(239, 68, 68, 0.35)',
                              color: '#F87171'
                            }}
                            onClick={() => setConfirmCancelId(order.id)}
                          >
                            <XCircle size={13} />
                            <span>Hủy đơn & Hoàn kho</span>
                          </button>
                        )
                      )}

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          onClose();
                          onOpenTracking(order.display_id);
                        }}
                      >
                        <Truck size={13} style={{ color: 'var(--accent-cyan)' }} />
                        <span>Xem hành trình & VietQR</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
