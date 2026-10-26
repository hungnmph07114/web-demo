import React, { useState, useEffect } from 'react';
import { fetchApi, formatMoney } from '../services/api';
import { X, Search, CheckCircle, Clock, Truck, Package, QrCode, Copy, AlertCircle, Zap } from 'lucide-react';

export default function OrderTrackingModal({ isOpen, onClose, onToast, initialOrderQuery = '' }) {
  if (!isOpen) return null;

  const [orderQuery, setOrderQuery] = useState(initialOrderQuery || '');
  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchOrder = async (displayId) => {
    try {
      const cleanId = displayId.trim().replace(/^#/, '');
      const res = await fetchApi(`/api/orders/${encodeURIComponent(cleanId)}`);
      setOrder(res.data);

      // Fetch live shipment tracking info
      try {
        const shipRes = await fetchApi(`/api/shipping/tracking/${encodeURIComponent(cleanId)}`);
        if (shipRes.success && shipRes.data?.shipment) {
          setShipment(shipRes.data.shipment);
        }
      } catch (e) {
        // silent
      }

      return res.data;
    } catch (err) {
      setErrorMsg(err.message || 'Không tìm thấy thông tin đơn hàng với mã vừa nhập');
      return null;
    }
  };

  useEffect(() => {
    if (initialOrderQuery) {
      setOrderQuery(initialOrderQuery);
      fetchOrder(initialOrderQuery);
    }
  }, [initialOrderQuery]);

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setOrder(null);

    try {
      await fetchOrder(orderQuery);
    } finally {
      setIsLoading(false);
    }
  };

  // Realtime Polling for Webhook confirmation (every 3 seconds)
  useEffect(() => {
    if (!order || order.payment_status === 'captured') return;

    const poll = setInterval(async () => {
      try {
        const updated = await fetchOrder(order.display_id);
        if (updated && updated.payment_status === 'captured') {
          onToast('⚡ Cổng VietQR 24/7 đã tự động xác nhận nhận tiền thành công!', 'success');
          clearInterval(poll);
        }
      } catch (e) {
        // silent
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [order?.display_id, order?.payment_status]);

  const handleSimulatePayment = async () => {
    if (!order) return;
    setIsSimulating(true);
    try {
      const res = await fetchApi('/api/webhooks/vietqr/simulate', {
        method: 'POST',
        body: JSON.stringify({
          display_id: order.display_id,
          amount: order.total_amount,
          bank_name: 'MB Bank (Simulator 24/7)'
        })
      });
      if (res.success) {
        onToast('⚡ Webhook ngân hàng đã khớp tiền tự động!');
        fetchOrder(order.display_id);
      } else {
        onToast(res.message, 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onToast(`Đã sao chép ${label}!`);
  };

  // Determine timeline step
  const getFulfillmentStep = (status) => {
    switch (status) {
      case 'processing': return 1;
      case 'packing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = order ? getFulfillmentStep(order.fulfillment_status) : 1;

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div className="modal-header-compact" style={{ marginBottom: '20px' }}>
          <h2 className="modal-title" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Tra Cứu Tiến Độ Đơn Hàng & VietQR</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Nhập mã đơn hàng hiển thị (ví dụ: <strong style={{ color: 'var(--accent-cyan)' }}>TP-9619</strong> hoặc ID đơn) để xem trạng thái giao vận và đối soát chuyển khoản.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchOrder} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Nhập mã đơn hàng (VD: TP-9619)..."
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.95rem'
              }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: '130px' }}>
            {isLoading ? <Clock size={16} className="animate-spin" /> : <Search size={16} />}
            <span>{isLoading ? 'Đang tra cứu...' : 'Tra cứu'}</span>
          </button>
        </form>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-rose)',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Order Overview Header Card */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Mã đơn hàng</span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-cyan)', margin: '2px 0' }}>#{order.display_id}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Payment Badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Thanh toán</div>
                  <span className={`status-badge ${order.payment_status === 'captured' ? 'pay-captured' : 'pay-pending'}`}>
                    {order.payment_status === 'captured' ? '✅ Đã thanh toán' : '⏳ Chờ quét VietQR'}
                  </span>
                </div>

                {/* Fulfillment Badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Giao hàng</div>
                  <span className={`status-badge ${
                    order.fulfillment_status === 'delivered' ? 'ful-delivered' :
                    order.fulfillment_status === 'shipped' ? 'ful-shipped' :
                    order.fulfillment_status === 'packing' ? 'ful-packing' :
                    order.fulfillment_status === 'canceled' ? 'ful-canceled' : 'ful-processing'
                  }`}>
                    {order.fulfillment_status === 'delivered' ? '🎉 Đã nhận hàng' :
                     order.fulfillment_status === 'shipped' ? '🚚 Đang giao' :
                     order.fulfillment_status === 'packing' ? '📦 Đang đóng gói' :
                     order.fulfillment_status === 'canceled' ? '✕ Đã hủy' : 'Chờ xử lý'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div style={{
              padding: '20px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Hành trình đơn hàng
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                {[
                  { step: 1, label: 'Tiếp nhận', icon: <CheckCircle size={18} />, desc: 'Đã xác nhận đơn' },
                  { step: 2, label: 'Đóng gói', icon: <Package size={18} />, desc: 'Kiểm tra & đóng hộp' },
                  { step: 3, label: 'Vận chuyển', icon: <Truck size={18} />, desc: 'Đã giao bưu cục' },
                  { step: 4, label: 'Hoàn tất', icon: <CheckCircle size={18} />, desc: 'Khách nhận máy' }
                ].map((s) => {
                  const isDone = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDone ? 'var(--gradient-brand)' : 'var(--bg-surface-elevated)',
                        color: isDone ? '#fff' : 'var(--text-dim)',
                        border: isCurrent ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                        boxShadow: isCurrent ? '0 0 12px rgba(6, 182, 212, 0.4)' : 'none',
                        marginBottom: '8px'
                      }}>
                        {s.icon}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500, color: isDone ? '#fff' : 'var(--text-dim)' }}>
                        {s.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{s.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Carrier & Checkpoint Timeline Card */}
            {shipment && (
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Header: Carrier Badge & Tracking Code */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${shipment.carrierColor}`,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{shipment.carrierIcon}</span>
                      <span>{shipment.carrierName}</span>
                    </span>

                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Hotline: <strong style={{ color: '#fff' }}>{shipment.carrierHotline}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mã vận đơn:</span>
                    <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {shipment.trackingCode}
                    </strong>
                    <button
                      type="button"
                      className="btn-copy-pill"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      onClick={() => copyToClipboard(shipment.trackingCode, 'Mã vận đơn')}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                {/* Driver Info Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald))',
                        color: '#000',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem'
                      }}
                    >
                      🛵
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {shipment.driverName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>SĐT Bưu tá:</span>
                        <a
                          href={`tel:${shipment.driverPhone}`}
                          style={{ color: 'var(--accent-emerald)', fontWeight: 700, textDecoration: 'none' }}
                        >
                          {shipment.driverPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {shipment.estimatedDeliveryDate && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Dự kiến giao hàng:</span>
                      <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.88rem' }}>
                        {new Date(shipment.estimatedDeliveryDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Checkpoint Timeline */}
                {shipment.timeline && shipment.timeline.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                      📍 Lộ Trình Di Chuyển Của Kiện Hàng ({shipment.timeline.length} mốc):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '20px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '6px',
                          top: '6px',
                          bottom: '6px',
                          width: '2px',
                          background: 'rgba(255, 255, 255, 0.1)'
                        }}
                      />

                      {shipment.timeline.map((ev, idx) => {
                        const isLatest = idx === shipment.timeline.length - 1;
                        return (
                          <div key={ev.id || idx} style={{ position: 'relative' }}>
                            <div
                              style={{
                                position: 'absolute',
                                left: '-18px',
                                top: '3px',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: isLatest ? 'var(--accent-emerald)' : 'var(--text-dim)',
                                boxShadow: isLatest ? '0 0 10px var(--accent-emerald)' : 'none'
                              }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.85rem', color: isLatest ? 'var(--accent-emerald)' : '#fff' }}>
                                {ev.hub_name}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(ev.created_at).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: isLatest ? '#E2E8F0' : 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                              {ev.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If VietQR awaiting payment: Display VietQR Card */}
            {order.payment_status !== 'captured' && order.vietqr_image && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '20px',
                padding: '20px',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-lg)',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={order.vietqr_image}
                    alt="VietQR NAPAS 247"
                    style={{ width: '100%', maxWidth: '180px', borderRadius: 'var(--radius-md)', background: '#fff', padding: '6px' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '6px', fontWeight: 600 }}>
                    <QrCode size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Quét nhanh bằng mọi App Banking
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: 'var(--accent-amber)', fontSize: '0.95rem' }}>
                      ⚠️ Đơn hàng đang chờ thanh toán
                    </h4>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                      onClick={handleSimulatePayment}
                      disabled={isSimulating}
                    >
                      <Zap size={13} />
                      <span>{isSimulating ? 'Đang gửi...' : '⚡ Giả lập Quét QR (Test Webhook)'}</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-glass)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Số tiền cần thanh toán:</span>
                    <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{formatMoney(order.total_amount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-glass)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Nội dung chuyển khoản:</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{order.vietqr_content}</strong>
                      <button
                        type="button"
                        className="btn-copy-pill"
                        style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                        onClick={() => copyToClipboard(order.vietqr_content, 'Nội dung CK')}
                      >
                        <Copy size={12} />
                      </button>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ngân hàng thụ hưởng:</span>
                    <strong>MB Bank - 0987654321 (NGUYEN MANH HUNG)</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', fontWeight: 700, fontSize: '0.9rem' }}>
                Danh sách sản phẩm ({order.items?.length || 0})
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(order.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.thumbnail}
                        alt={item.product_title}
                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-glass)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.product_title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {item.variant_title} | SKU: {item.sku}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {formatMoney(item.total_price)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {formatMoney(item.unit_price)} x {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial summary footer */}
              <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Tạm tính: </span>
                  <strong>{formatMoney(order.subtotal)}</strong>
                </div>
                {parseFloat(order.discount_total) > 0 && (
                  <div>
                    <span style={{ color: 'var(--accent-emerald)' }}>Voucher ({order.promotion_code}): </span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>-{formatMoney(order.discount_total)}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Phí ship: </span>
                  <strong>{order.shipping_fee > 0 ? formatMoney(order.shipping_fee) : 'Miễn phí'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán: </span>
                  <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.05rem' }}>{formatMoney(order.total_amount)}</strong>
                </div>
              </div>
            </div>

            {/* Customer & Shipping info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '14px 18px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Thông tin người nhận</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{order.customer_name}</div>
                <div style={{ color: 'var(--text-muted)' }}>SĐT: {order.customer_phone}</div>
                <div style={{ color: 'var(--text-muted)' }}>Email: {order.customer_email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Địa chỉ giao hàng</span>
                <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>{order.shipping_address}</div>
                {order.note && <div style={{ color: 'var(--accent-amber)', marginTop: '4px' }}>Ghi chú: {order.note}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
