import React, { useState } from 'react';
import { formatMoney, fetchApi } from '../services/api';
import { X, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  onOpenCheckout,
  onToast
}) {
  const [voucherInput, setVoucherInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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

  const handleApply = async () => {
    if (!voucherInput.trim()) {
      onToast('Vui lòng nhập mã giảm giá', 'error');
      return;
    }
    setIsApplying(true);
    try {
      const res = await fetchApi('/api/promotions/validate', {
        method: 'POST',
        body: JSON.stringify({ code: voucherInput.trim(), subtotal })
      });
      onApplyVoucher(res.data);
      onToast(`Áp dụng mã ${res.data.code} thành công: Giảm ${formatMoney(res.data.discountAmount)}!`);
      setVoucherInput('');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={(e) => e.target.classList.contains('drawer-overlay') && onClose()}>
      <div className="cart-drawer">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={20} />
            <span>Giỏ Hàng Của Bạn</span>
            <span className="drawer-badge">{totalItems} món</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Đóng giỏ hàng">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Items */}
        <div className="drawer-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🛒</div>
              <h4>Giỏ hàng đang trống</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Khám phá các thiết bị công nghệ đỉnh cao và thêm vào giỏ nhé!
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.variantId}-${idx}`} className="cart-item">
                <div className="cart-item-thumb">
                  <img src={item.thumbnail} alt={item.productTitle} />
                </div>
                <div className="cart-item-info">
                  <span className="cart-item-title">{item.productTitle}</span>
                  <span className="cart-item-variant">{item.variantTitle}</span>
                  <div className="cart-item-bottom">
                    <span className="cart-item-price">{formatMoney(item.price * item.quantity)}</span>
                    <div className="cart-item-qty">
                      <button
                        className="qty-mini-btn"
                        onClick={() => onUpdateQty(idx, -1)}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        className="qty-mini-btn"
                        onClick={() => onUpdateQty(idx, 1)}
                      >
                        +
                      </button>
                      <button
                        className="cart-item-delete"
                        onClick={() => onRemoveItem(idx)}
                        aria-label="Xóa sản phẩm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Voucher Input */}
            <div className="voucher-input-group">
              <input
                type="text"
                placeholder="Nhập mã: VIP10 hoặc TECHPULSE50K"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? '...' : 'Áp dụng'}
              </button>
            </div>

            {appliedVoucher && discount > 0 && (
              <div className="applied-voucher-alert">
                <span>
                  🎉 Đã áp dụng mã <strong>{appliedVoucher.code}</strong>: Giảm {formatMoney(discount)}
                </span>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={onRemoveVoucher}
                >
                  Gỡ bỏ
                </button>
              </div>
            )}

            {/* Price Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="summary-row discount-row">
                <span>Giảm giá Voucher:</span>
                <span>-{formatMoney(discount)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{shipping === 0 ? 'Miễn phí' : formatMoney(shipping)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Tổng thanh toán:</span>
                <span className="total-price">{formatMoney(total)}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-lg" onClick={onOpenCheckout}>
              <span>⚡ Tiến hành đặt hàng & Thanh toán</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
