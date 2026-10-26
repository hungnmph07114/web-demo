import React, { useState, useEffect } from 'react';
import { formatMoney, copyText, fetchApi } from '../services/api';
import { X, CheckCircle, Smartphone, Banknote, Copy, Clock, ArrowRight, Zap, Check } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  appliedVoucher,
  user,
  onSubmitOrder,
  onToast,
  onSwitchToAdminOrders
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState('form'); // 'form' | 'vietqr'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    shipping_address: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isAutoCaptured, setIsAutoCaptured] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percentage') {
      discount = (subtotal * appliedVoucher.value) / 100;
      if (appliedVoucher.max_discount && discount > appliedVoucher.max_discount) {
        discount = appliedVoucher.max_discount;
      }
    } else {
      discount = appliedVoucher.discountAmount || appliedVoucher.value;
    }
    discount = Math.min(discount, subtotal);
  }
  const shipping = subtotal >= 5000000 || subtotal === 0 ? 0 : 30000;
  const total = Math.max(0, subtotal - discount + shipping);

  // VietQR Countdown Timer
  useEffect(() => {
    if (step !== 'vietqr') return;
    setTimeLeft(15 * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Realtime Webhook Auto-polling (Every 2.5s)
  useEffect(() => {
    if (step !== 'vietqr' || !createdOrder || isAutoCaptured) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetchApi(`/api/orders/${createdOrder.display_id}`);
        if (res.data && res.data.payment_status === 'captured') {
          setIsAutoCaptured(true);
          onToast('⚡ Cổng VietQR 24/7 đã tự động xác nhận nhận tiền thành công!', 'success');
          clearInterval(pollInterval);
        }
      } catch (err) {
        // silent fail on poll
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [step, createdOrder, isAutoCaptured, onToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        payment_method: paymentMethod,
        promotion_code: appliedVoucher ? appliedVoucher.code : null,
        items: cart.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
      };
      const order = await onSubmitOrder(payload);
      setCreatedOrder(order);

      if (paymentMethod === 'vietqr' && order.vietqr_image) {
        setStep('vietqr');
        setIsAutoCaptured(false);
      } else {
        onToast(`Đã tạo đơn hàng COD thành công: #${order.display_id}`);
        onClose();
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setIsSimulating(true);
    try {
      const res = await fetchApi('/api/webhooks/vietqr/simulate', {
        method: 'POST',
        body: JSON.stringify({
          display_id: createdOrder.display_id,
          amount: createdOrder.total_amount,
          bank_name: 'MB Bank (Simulator 24/7)'
        })
      });
      if (res.success) {
        setIsAutoCaptured(true);
        onToast('⚡ Webhook đã gửi tín hiệu ngân hàng và khớp tiền tự động!');
      } else {
        onToast(res.message, 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const formatTimer = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        {step === 'form' ? (
          /* Step 1: Shipping & Payment Form */
          <div>
            <div className="modal-header-compact" style={{ marginBottom: '18px' }}>
              <h2 className="modal-title" style={{ fontSize: '1.3rem' }}>Thông Tin Thanh Toán & Nhận Hàng</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tạo đơn hàng nhanh chóng, hỗ trợ cổng VietQR chuẩn NAPAS 247
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Địa chỉ email (nhận hóa đơn) *
                </label>
                <input
                  type="email"
                  placeholder="nguyenvana@gmail.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Địa chỉ giao nhận hàng *
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh thành..."
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Ghi chú giao hàng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              {/* Payment Methods */}
              <div style={{ marginTop: '6px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  Phương thức thanh toán:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label
                    className={`payment-card ${paymentMethod === 'vietqr' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('vietqr')}
                  >
                    <Smartphone size={22} className="pay-icon" />
                    <div className="payment-card-inner">
                      <strong>Chuyển khoản VietQR 24/7</strong>
                      <p>Khớp tiền tự động tức thì</p>
                    </div>
                  </label>

                  <label
                    className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <Banknote size={22} className="pay-icon" />
                    <div className="payment-card-inner">
                      <strong>Thanh toán khi nhận (COD)</strong>
                      <p>Trả tiền mặt khi nhận hàng</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="checkout-total-banner" style={{ marginTop: '8px' }}>
                <span>Số tiền thanh toán:</span>
                <strong>{formatMoney(total)}</strong>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Đang tạo đơn hàng...' : '🚀 Xác Nhận Đặt Hàng & Tạo Mã VietQR'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: VietQR Dynamic Presentation & Realtime Webhook Status */
          <div className="vietqr-container">
            {isAutoCaptured ? (
              /* Success Captured Screen */
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid var(--accent-emerald)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Check size={36} />
                </div>
                <span className="status-badge pay-captured" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                  ✅ ĐÃ NHẬN TIỀN CHUYỂN KHOẢN THÀNH CÔNG!
                </span>
                <h3 style={{ fontSize: '1.4rem', marginTop: '14px', marginBottom: '8px' }}>
                  Cổng VietQR 24/7 Đã Khớp Đơn #{createdOrder?.display_id}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
                  Hệ thống tự động ghi nhận thanh toán đủ <strong>{formatMoney(createdOrder?.total_amount)}</strong>. Đơn hàng đã được chuyển sang bộ phận kho để chuẩn bị đóng gói và vận chuyển.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={onClose}>
                    Đóng cửa sổ
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      onSwitchToAdminOrders();
                    }}
                  >
                    <span>Xem trạng thái đơn trong Quản trị</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* Waiting for Payment Screen */
              <div>
                <div className="vietqr-header">
                  <span className="qr-success-badge">
                    ✅ Đặt hàng thành công: <strong>#{createdOrder?.display_id}</strong>
                  </span>
                  <h3>Quét Mã VietQR NAPAS 247 Để Thanh Toán</h3>
                  <p>Mở ứng dụng Ngân hàng (MB, VCB, Techcombank, MoMo...) bất kỳ để quét</p>
                </div>

                <div className="vietqr-body">
                  <div className="qr-frame">
                    <img src={createdOrder?.vietqr_image} alt="VietQR NAPAS 247" className="qr-image" />
                    <div className="qr-timer">
                      <span>⏱️ Thời gian giữ hàng & thanh toán: </span>
                      <strong>{formatTimer()}</strong>
                    </div>
                  </div>

                  <div className="vietqr-details-table">
                    <div className="detail-row">
                      <span className="detail-label">Ngân hàng thụ hưởng:</span>
                      <span className="detail-val">MB Bank (Quân Đội)</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Chủ tài khoản:</span>
                      <span className="detail-val">NGUYEN MANH HUNG</span>
                    </div>
                    <div className="detail-row highlight">
                      <span className="detail-label">Số tài khoản:</span>
                      <div className="copy-cell">
                        <span className="detail-val">0987654321</span>
                        <button className="btn-copy" onClick={() => copyText('0987654321', 'Số tài khoản', onToast)}>
                          Sao chép
                        </button>
                      </div>
                    </div>
                    <div className="detail-row highlight">
                      <span className="detail-label">Số tiền cần chuyển:</span>
                      <div className="copy-cell">
                        <span className="detail-val" style={{ color: 'var(--accent-cyan)' }}>
                          {formatMoney(createdOrder?.total_amount)}
                        </span>
                        <button
                          className="btn-copy"
                          onClick={() => copyText(Math.round(createdOrder?.total_amount), 'Số tiền', onToast)}
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>
                    <div className="detail-row highlight">
                      <span className="detail-label">Nội dung chuyển khoản:</span>
                      <div className="copy-cell">
                        <span className="detail-val">{createdOrder?.vietqr_content}</span>
                        <button
                          className="btn-copy"
                          onClick={() => copyText(createdOrder?.vietqr_content, 'Nội dung chuyển khoản', onToast)}
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook Simulator Banner for Demo */}
                <div style={{
                  margin: '16px 0',
                  padding: '12px 16px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Hệ thống đang tự động lắng nghe Webhook ngân hàng 24/7 (tự khớp tiền không cần F5).
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}
                    onClick={handleSimulatePayment}
                    disabled={isSimulating}
                  >
                    <span>{isSimulating ? 'Đang gửi...' : '⚡ Test Webhook Chuyển Tiền'}</span>
                  </button>
                </div>

                <div className="vietqr-footer">
                  <button className="btn btn-secondary" onClick={onClose}>
                    Đóng
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      onSwitchToAdminOrders();
                    }}
                  >
                    <span>Xem chi tiết trong Quản trị</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
