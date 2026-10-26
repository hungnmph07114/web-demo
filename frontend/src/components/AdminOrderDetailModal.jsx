import React, { useState, useEffect } from 'react';
import { fetchApi, formatMoney } from '../services/api';
import { X, CheckCircle, Package, Truck, DollarSign, Clock, ShieldAlert, User, MapPin, Printer, Zap } from 'lucide-react';

export default function AdminOrderDetailModal({
  orderId,
  isOpen,
  onClose,
  token,
  storeSettings,
  onToast,
  onOrderUpdated
}) {
  if (!isOpen || !orderId) return null;

  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSimulatingStep, setIsSimulatingStep] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const storeName = storeSettings?.store_name || 'ATELIER & CO.';
  const storeTagline = storeSettings?.store_tagline || 'Curated Multi-Category Store';
  const storePhone = storeSettings?.store_phone || '1900 8888';
  const storeAddress = storeSettings?.store_address || '88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh';
  const bankInfo = `${storeSettings?.bank_id || 'MB'} (${storeSettings?.bank_account_no || '0345678910'})`;

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/api/orders/${orderId}`, {}, token);
      setOrder(res.data);

      try {
        const shipRes = await fetchApi(`/api/shipping/tracking/${orderId}`, {}, token);
        if (shipRes.success && shipRes.data?.shipment) {
          setShipment(shipRes.data.shipment);
        }
      } catch (_) {
        // silent
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setConfirmCancel(false);
    setShowInvoicePreview(false);
    loadDetails();
  }, [orderId]);

  const handleCapture = async () => {
    setIsUpdating(true);
    try {
      await fetchApi(
        `/api/orders/${order.id}/payment`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'captured', note: 'Admin đối soát tài khoản và xác nhận nhận tiền' })
        },
        token
      );
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
      await fetchApi(
        `/api/orders/${order.id}/fulfillment`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus, note: `Quản trị viên chuyển trạng thái sang ${nextStatus}` })
        },
        token
      );
      onToast(`Đã chuyển trạng thái giao vận sang ${nextStatus}!`);
      loadDetails();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSimulateStep = async () => {
    setIsSimulatingStep(true);
    try {
      const res = await fetchApi(
        `/api/shipping/${order.id}/simulate-step`,
        {
          method: 'POST'
        },
        token
      );
      if (res.success) {
        onToast(`🚀 ${res.message}`);
        loadDetails();
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSimulatingStep(false);
    }
  };

  const handleUpdateCarrier = async (carrierKey) => {
    try {
      const res = await fetchApi(
        `/api/shipping/${order.id}/carrier`,
        {
          method: 'POST',
          body: JSON.stringify({ carrier: carrierKey })
        },
        token
      );
      if (res.success) {
        onToast(`Đã chuyển sang đơn vị vận chuyển: ${carrierKey}`);
        loadDetails();
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handlePrintInvoice = () => {
    if (!order) return;
    setShowInvoicePreview((prev) => !prev);
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
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '16px',
                gap: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Hóa đơn &amp; Phiếu giao vận
                </span>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>Đơn Hàng #{order.display_id}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Khởi tạo lúc: {new Date(order.created_at).toLocaleString('vi-VN')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  onClick={handlePrintInvoice}
                  title="Mở bản in Phiếu giao hàng & Hóa đơn bán lẻ"
                >
                  <Printer size={15} />
                  <span>{showInvoicePreview ? 'Đóng Bản In' : '🖨️ In Phiếu Giao Hàng / Hóa Đơn'}</span>
                </button>

                <span className={`status-badge ${order.payment_status === 'captured' ? 'pay-captured' : 'pay-pending'}`}>
                  {order.payment_status === 'captured' ? '💰 Đã thu tiền' : '⏳ Chờ thanh toán VietQR'}
                </span>
                <span
                  className={`status-badge ${
                    order.fulfillment_status === 'delivered'
                      ? 'ful-delivered'
                      : order.fulfillment_status === 'shipped'
                      ? 'ful-shipped'
                      : order.fulfillment_status === 'packing'
                      ? 'ful-packing'
                      : order.fulfillment_status === 'canceled'
                      ? 'ful-canceled'
                      : 'ful-processing'
                  }`}
                >
                  {order.fulfillment_status === 'delivered'
                    ? '🎉 Hoàn tất'
                    : order.fulfillment_status === 'shipped'
                    ? '🚚 Đang giao'
                    : order.fulfillment_status === 'packing'
                    ? '📦 Đang đóng gói'
                    : order.fulfillment_status === 'canceled'
                    ? '✕ Đã hủy'
                    : 'Chờ xử lý'}
                </span>
              </div>
            </div>

            {/* Full Printable Shipping Label & Retail Invoice */}
            {showInvoicePreview && (
              <div
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  border: '2px solid #18181b',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #18181b',
                    paddingBottom: '14px',
                    marginBottom: '16px',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {storeName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                      {storeTagline} • PHIẾU GIAO HÀNG &amp; HÓA ĐƠN BÁN LẺ
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                      Kho xuất hàng: {storeAddress} | Hotline: {storePhone} | VietQR: {bankInfo}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        background: '#18181b',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}
                    >
                      🖨️ Bấm In Ngay (Ctrl + P)
                    </button>
                    <div style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: '#0f172a' }}>
                      Mã vận đơn: <strong>{shipment?.trackingCode || order.tracking_code || `GHN-${order.display_id}`}</strong>
                    </div>
                  </div>
                </div>

                {/* Sender & Receiver Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    fontSize: '0.82rem',
                    marginBottom: '14px',
                    background: '#f8fafc',
                    padding: '14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                      Thông tin người nhận hàng
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{order.customer_name} — {order.customer_phone}</div>
                    <div style={{ marginTop: '2px' }}><strong>Địa chỉ giao:</strong> {order.shipping_address}</div>
                    {order.note && (
                      <div style={{ marginTop: '4px', color: '#b45309', fontWeight: 600 }}>
                        📌 Ghi chú giao hàng: {order.note}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                      Thông tin đối soát bưu tá
                    </div>
                    <div><strong>Mã đơn hàng:</strong> #{order.display_id}</div>
                    <div><strong>Đơn vị vận chuyển:</strong> {shipment?.carrierName || order.shipping_carrier || 'Giao Hàng Nhanh (GHN)'}</div>
                    <div
                      style={{
                        marginTop: '6px',
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: order.payment_status === 'captured' ? '#dcfce7' : '#fef3c7',
                        color: order.payment_status === 'captured' ? '#166534' : '#92400e',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}
                    >
                      {order.payment_status === 'captured'
                        ? 'TIỀN THU HỘ (COD): 0đ (ĐÃ THANH TOÁN VIETQR)'
                        : `TIỀN THU HỘ BƯU TÁ (COD): ${formatMoney(order.total_amount)}`}
                    </div>
                  </div>
                </div>

                {/* Printable Itemized SKU Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '8px', textAlign: 'center', width: '40px', color: '#0f172a' }}>#</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#0f172a' }}>Tên sản phẩm &amp; Phân loại biến thể</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#0f172a' }}>Mã SKU</th>
                      <th style={{ padding: '8px', textAlign: 'center', color: '#0f172a' }}>SL</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#0f172a' }}>Đơn giá</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#0f172a' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((it, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: '8px' }}>
                          <strong>{it.product_title}</strong> ({it.variant_title})
                        </td>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{it.sku}</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(it.unit_price)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{formatMoney(it.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem', paddingTop: '8px' }}>
                  <div style={{ color: '#475569', maxWidth: '55%' }}>
                    <div>* Quý khách được đồng kiểm ngoại quan sản phẩm cùng bưu tá trước khi nhận hàng.</div>
                    <div>* Hỗ trợ đổi trả theo chính sách của <strong>{storeName}</strong> qua Hotline {storePhone}.</div>
                  </div>
                  <div style={{ textAlign: 'right', lineHeight: 1.6 }}>
                    <div>Tạm tính: <strong>{formatMoney(order.subtotal)}</strong></div>
                    {parseFloat(order.discount_total) > 0 && (
                      <div style={{ color: '#16a34a' }}>
                        Giảm giá ({order.promotion_code}): <strong>-{formatMoney(order.discount_total)}</strong>
                      </div>
                    )}
                    <div>Phí giao vận: <strong>{order.shipping_fee > 0 ? formatMoney(order.shipping_fee) : 'Miễn phí'}</strong></div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, borderTop: '1px solid #cbd5e1', marginTop: '4px', paddingTop: '4px' }}>
                      TỔNG CỘNG: {formatMoney(order.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Panel */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                gap: '12px'
              }}
            >
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
                    <span>Xác nhận: Khách đã nhận hàng</span>
                  </button>
                )}

                {order.fulfillment_status !== 'delivered' &&
                  order.fulfillment_status !== 'canceled' &&
                  (confirmCancel ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          background: 'rgba(239, 68, 68, 0.15)',
                          borderColor: 'var(--accent-rose)',
                          color: 'var(--accent-rose)'
                        }}
                        onClick={() => {
                          setConfirmCancel(false);
                          handleUpdateFulfillment('canceled');
                        }}
                        disabled={isUpdating}
                      >
                        <span>Xác nhận Hủy &amp; Hoàn kho</span>
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        onClick={() => setConfirmCancel(false)}
                      >
                        <span>Bỏ qua</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'var(--accent-rose)' }}
                      onClick={() => setConfirmCancel(true)}
                      disabled={isUpdating}
                    >
                      <ShieldAlert size={14} />
                      <span>Hủy đơn</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Customer & Shipping 2-col Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div
                style={{
                  padding: '14px 18px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginBottom: '8px', fontWeight: 700 }}>
                  <User size={16} />
                  <span>Khách hàng</span>
                </div>
                <div><strong>Họ tên:</strong> {order.customer_name}</div>
                <div><strong>SĐT:</strong> {order.customer_phone}</div>
                <div><strong>Email:</strong> {order.customer_email}</div>
                <div><strong>Phương thức TT:</strong> {order.payment_method === 'vietqr' ? 'Cổng VietQR NAPAS 247' : 'Thanh toán khi nhận (COD)'}</div>
              </div>

              <div
                style={{
                  padding: '14px 18px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginBottom: '8px', fontWeight: 700 }}>
                  <MapPin size={16} />
                  <span>Địa chỉ giao hàng</span>
                </div>
                <div><strong>Nơi nhận:</strong> {order.shipping_address}</div>
                {order.note && <div><strong>Ghi chú đơn:</strong> {order.note}</div>}
                <div><strong>Nội dung VietQR:</strong> <code style={{ color: 'var(--accent-cyan)' }}>{order.vietqr_content}</code></div>
                {order.transaction_ref && (
                  <div><strong>Mã GD ngân hàng:</strong> <code style={{ color: 'var(--accent-emerald)' }}>{order.transaction_ref}</code></div>
                )}
              </div>
            </div>

            {/* Carrier & Shipment Tracking Controls */}
            {shipment && (
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} style={{ color: shipment.carrierColor || 'var(--accent-cyan)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {shipment.carrierIcon} {shipment.carrierName}
                    </span>
                    <code
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.85rem'
                      }}
                    >
                      {shipment.trackingCode}
                    </code>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={handleSimulateStep}
                    disabled={isSimulatingStep || order.fulfillment_status === 'delivered'}
                  >
                    <Zap size={14} />
                    <span>{isSimulatingStep ? 'Đang cập nhật...' : '⚡ Mô phỏng mốc bưu tá tiếp theo'}</span>
                  </button>
                </div>

                {/* Carrier Switcher Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Đổi hãng vận chuyển:</span>
                  {[
                    { key: 'GHN', label: 'GHN ⚡' },
                    { key: 'GHTK', label: 'GHTK 🛵' },
                    { key: 'VIETTEL_POST', label: 'ViettelPost 📮' },
                    { key: 'HOA_TOC_2H', label: 'Hỏa tốc 2H 🚀' }
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => handleUpdateCarrier(c.key)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: shipment.carrierKey === c.key ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                        background: shipment.carrierKey === c.key ? 'var(--bg-surface-elevated)' : 'transparent',
                        color: shipment.carrierKey === c.key ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Driver Info */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Bưu tá: <strong style={{ color: 'var(--text-main)' }}>{shipment.driverName}</strong></span>
                  <span>SĐT: <strong style={{ color: 'var(--accent-emerald)' }}>{shipment.driverPhone}</strong></span>
                  {shipment.estimatedDeliveryDate && (
                    <span>Dự kiến giao: <strong style={{ color: 'var(--accent-cyan)' }}>{new Date(shipment.estimatedDeliveryDate).toLocaleDateString('vi-VN')}</strong></span>
                  )}
                </div>

                {/* Checkpoint list */}
                {shipment.timeline && shipment.timeline.length > 0 && (
                  <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>Lộ trình bưu cục ({shipment.timeline.length} mốc):</div>
                    {shipment.timeline.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: i === shipment.timeline.length - 1 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                          • {ev.hub_name}: {ev.description}
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', minWidth: '120px', textAlign: 'right' }}>
                          {new Date(ev.created_at).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '24px',
                  fontSize: '0.9rem',
                  borderTop: '1px solid var(--border-glass)',
                  flexWrap: 'wrap'
                }}
              >
                <div>Tạm tính: <strong>{formatMoney(order.subtotal)}</strong></div>
                {parseFloat(order.discount_total) > 0 && (
                  <div style={{ color: 'var(--accent-emerald)' }}>
                    Chiết khấu ({order.promotion_code}): <strong>-{formatMoney(order.discount_total)}</strong>
                  </div>
                )}
                <div>Phí vận chuyển: <strong>{order.shipping_fee > 0 ? formatMoney(order.shipping_fee) : '0đ'}</strong></div>
                <div>Tổng thu: <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{formatMoney(order.total_amount)}</strong></div>
              </div>
            </div>

            {/* Audit Logs History */}
            {order.logs && order.logs.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  📜 Lịch sử thay đổi &amp; Nhật ký đơn hàng (Audit Trail)
                </h4>
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}
                >
                  {order.logs.map((log) => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '4px' }}>
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
