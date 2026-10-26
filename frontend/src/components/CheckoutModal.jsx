import React, { useState, useEffect } from 'react';
import { formatMoney, copyText } from '../services/api';
import { X, CheckCircle, Smartphone, Banknote, Copy, Clock, ArrowRight } from 'lucide-react';

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
          <div>
            <h2 className="modal-title">Thông Tin Giao Hàng & Đặt Hàng</h2>
            <p className="modal-subtitle">Điền thông tin nhận máy để tạo phiên thanh toán tự động</p>

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên người nhận *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="form-input"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0987654321"
                    className="form-input"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ Email (nhận hóa đơn & bảo hành) *</label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="form-input"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ nhận máy chi tiết *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                  className="form-textarea"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Ghi chú đơn hàng (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  className="form-input"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label>Phương thức thanh toán:</label>
                <div className="payment-methods">
                  <label
                    className={`payment-card ${paymentMethod === 'vietqr' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('vietqr')}
                  >
                    <Smartphone size={22} className="pay-icon" />
                    <div className="payment-card-inner">
                      <strong>Chuyển khoản VietQR 24/7 (Khuyên dùng)</strong>
                      <p>Mã QR NAPAS chuẩn ngân hàng, duyệt tự động</p>
                    </div>
                  </label>

                  <label
                    className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <Banknote size={22} className="pay-icon" />
                    <div className="payment-card-inner">
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <p>Kiểm tra hàng trước khi trả tiền mặt</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="checkout-total-banner">
                <span>Số tiền thanh toán:</span>
                <strong>{formatMoney(total)}</strong>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Đang tạo đơn hàng...' : '🚀 Xác Nhận Đặt Hàng & Tạo Mã VietQR'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: VietQR Dynamic Presentation */
          <div className="vietqr-container">
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

            <div className="vietqr-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Hoàn tất / Đóng
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
    </div>
  );
}
