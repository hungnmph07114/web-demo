import React, { useState, useEffect } from 'react';
import { fetchApi, formatMoney } from '../services/api';
import { X, CheckCircle, Package, Truck, DollarSign, Clock, ShieldAlert, ArrowRight, User, MapPin } from 'lucide-react';

export default function AdminOrderDetailModal({ orderId, isOpen, onClose, token, onToast, onOrderUpdated }) {
  if (!isOpen || !orderId) return null;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/api/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [orderId]);

  const handleCapture = async () => {
    if (!window.confirm('Xác nhận đã nhận đủ số tiền chuyển khoản cho đơn hàng này?')) return;
    setIsUpdating(true);
    try {
      await fetchApi(`/api/orders/${order.id}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'captured', note: 'Admin đối soát tài khoản và xác nhận nhận tiền' })
      }, token);
      onToast('Đã xác nhận thu tiền thành công!');
      loadDetails();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateFulfillment = async (nextStatus) => {
    setIsUpdating(true);
    try {
      await fetchApi(`/api/orders/${order.id}/fulfillment`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus, note: `Quản trị viên chuyển trạng thái sang ${nextStatus}` })
      }, token);
      onToast(`Đã chuyển trạng thái giao vận sang ${nextStatus}!`);
      loadDetails();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        {isLoading || !order ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Clock size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Đang tải chi tiết đơn hàng #{orderId}...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header & Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-glass)',
              paddingBottom: '16px',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Hóa đơn điện tử</span>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>Đơn Hàng #{order.display_id}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Khởi tạo lúc: {new Date(order.created_at).toLocaleString('vi-VN')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`status-badge ${order.payment_status === 'captured' ? 'pay-captured' : 'pay-pending'}`}>
                  {order.payment_status === 'captured' ? '💰 Đã thu tiền' : '⏳ Chờ thanh toán VietQR'}
                </span>
                <span className={`status-badge ${
                  order.fulfillment_status === 'delivered' ? 'ful-delivered' :
                  order.fulfillment_status === 'shipped' ? 'ful-shipped' :
                  order.fulfillment_status === 'packing' ? 'ful-packing' :
                  order.fulfillment_status === 'canceled' ? 'ful-canceled' : 'ful-processing'
                }`}>
                  {order.fulfillment_status === 'delivered' ? '🎉 Hoàn tất' :
                   order.fulfillment_status === 'shipped' ? '🚚 Đang giao' :
                   order.fulfillment_status === 'packing' ? '📦 Đang đóng gói' :
                   order.fulfillment_status === 'canceled' ? '✕ Đã hủy' : 'Chờ xử lý'}
                </span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Thao tác quản trị nhanh:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {order.payment_status !== 'captured' && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={handleCapture}
                    disabled={isUpdating}
                  >
                    <DollarSign size={14} />
                    <span>Duyệt thu tiền VietQR</span>
                  </button>
                )}

                {order.fulfillment_status === 'processing' && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => handleUpdateFulfillment('packing')}
                    disabled={isUpdating}
                  >
                    <Package size={14} />
                    <span>Chuyển sang: Đóng gói tại kho</span>
                  </button>
                )}

                {order.fulfillment_status === 'packing' && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => handleUpdateFulfillment('shipped')}
                    disabled={isUpdating}
                  >
                    <Truck size={14} />
                    <span>Chuyển sang: Đã giao bưu cục</span>
                  </button>
                )}

                {order.fulfillment_status === 'shipped' && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => handleUpdateFulfillment('delivered')}
                    disabled={isUpdating}
                  >
                    <CheckCircle size={14} />
                    <span>Xác nhận: Khách đã nhận máy</span>
                  </button>
                )}

                {order.fulfillment_status !== 'delivered' && order.fulfillment_status !== 'canceled' && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'var(--accent-rose)' }}
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                        handleUpdateFulfillment('canceled');
                      }
                    }}
                    disabled={isUpdating}
                  >
                    <ShieldAlert size={14} />
                    <span>Hủy đơn</span>
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Shipping 2-col Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{
                padding: '14px 18px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginBottom: '8px', fontWeight: 700 }}>
                  <User size={16} />
                  <span>Khách hàng</span>
                </div>
                <div><strong>Họ tên:</strong> {order.customer_name}</div>
                <div><strong>SĐT:</strong> {order.customer_phone}</div>
                <div><strong>Email:</strong> {order.customer_email}</div>
                <div><strong>Phương thức TT:</strong> {order.payment_method === 'vietqr' ? 'Cổng VietQR NAPAS 247' : 'Thanh toán khi nhận (COD)'}</div>
              </div>

              <div style={{
                padding: '14px 18px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginBottom: '8px', fontWeight: 700 }}>
                  <MapPin size={16} />
                  <span>Địa chỉ giao hàng</span>
                </div>
                <div><strong>Nơi nhận:</strong> {order.shipping_address}</div>
                {order.note && <div><strong>Ghi chú đơn:</strong> {order.note}</div>}
                <div><strong>Nội dung VietQR:</strong> <code style={{ color: 'var(--accent-cyan)' }}>{order.vietqr_content}</code></div>
              </div>
            </div>

            {/* Products Table */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sản phẩm / Phiên bản</th>
                    <th>SKU định danh</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.thumbnail}
                            alt={item.product_title}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div>
                            <strong>{item.product_title}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.variant_title}</div>
                          </div>
                        </div>
                      </td>
                      <td><code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.sku}</code></td>
                      <td>{formatMoney(item.unit_price)}</td>
                      <td><strong>x{item.quantity}</strong></td>
                      <td><strong style={{ color: 'var(--accent-cyan)' }}>{formatMoney(item.total_price)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div style={{
                padding: '16px 20px',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '24px',
                fontSize: '0.9rem',
                borderTop: '1px solid var(--border-glass)'
              }}>
                <div>Tạm tính: <strong>{formatMoney(order.subtotal)}</strong></div>
                {parseFloat(order.discount_total) > 0 && (
                  <div style={{ color: 'var(--accent-emerald)' }}>
                    Chiết khấu ({order.promotion_code}): <strong>-{formatMoney(order.discount_total)}</strong>
                  </div>
                )}
                <div>Phí vận chuyển: <strong>{order.shipping_fee > 0 ? formatMoney(order.shipping_fee) : '0đ'}</strong></div>
                <div>Tổng thu: <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{formatMoney(order.total_amount)}</strong></div>
              </div>
            </div>

            {/* Audit Logs History */}
            {order.logs && order.logs.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  📜 Lịch sử thay đổi & Nhật ký đơn hàng (Audit Trail)
                </h4>
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {order.logs.map((log) => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>{log.action}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{log.note}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
