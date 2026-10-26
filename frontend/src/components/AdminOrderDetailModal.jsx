import React, { useState, useEffect } from 'react';
import { fetchApi, formatMoney } from '../services/api';
import { X, CheckCircle, Package, Truck, DollarSign, Clock, ShieldAlert, ArrowRight, User, MapPin, Printer, Zap } from 'lucide-react';

export default function AdminOrderDetailModal({ orderId, isOpen, onClose, token, onToast, onOrderUpdated }) {
  if (!isOpen || !orderId) return null;

  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSimulatingStep, setIsSimulatingStep] = useState(false);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/api/orders/${orderId}`);
      setOrder(res.data);

      // Load shipping info
      try {
        const shipRes = await fetchApi(`/api/shipping/tracking/${orderId}`);
        if (shipRes.success && shipRes.data?.shipment) {
          setShipment(shipRes.data.shipment);
        }
      } catch (e) {
        // silent
      }
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

  const handleSimulateStep = async () => {
    setIsSimulatingStep(true);
    try {
      const res = await fetchApi(`/api/shipping/${order.id}/simulate-step`, {
        method: 'POST'
      }, token);
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
      const res = await fetchApi(`/api/shipping/${order.id}/carrier`, {
        method: 'POST',
        body: JSON.stringify({ carrier: carrierKey })
      }, token);
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
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      onToast('Vui lòng cho phép popup trình duyệt để mở bản in', 'error');
      return;
    }

    const itemsHtml = (order.items || []).map((item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong>${item.product_title}</strong><br/>
          <span style="font-size: 12px; color: #64748b;">${item.variant_title} | SKU: ${item.sku}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatMoney(item.unit_price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${formatMoney(item.total_price)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa Đơn #${order.display_id} - TechPulse</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #06b6d4; padding-bottom: 16px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #0f172a; }
          .logo span { color: #06b6d4; }
          .store-info { font-size: 13px; color: #64748b; line-height: 1.4; text-align: right; }
          .invoice-title { font-size: 20px; font-weight: 800; text-align: center; text-transform: uppercase; margin: 16px 0 6px; }
          .invoice-sub { text-align: center; font-size: 13px; color: #64748b; margin-bottom: 20px; }
          .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; }
          .info-block h4 { margin: 0 0 6px; font-size: 13px; text-transform: uppercase; color: #06b6d4; }
          .info-block p { margin: 2px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #0f172a; color: #fff; padding: 10px; font-size: 13px; text-align: left; }
          th.center, td.center { text-align: center; }
          th.right, td.right { text-align: right; }
          .total-box { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .total-table { width: 320px; font-size: 14px; }
          .total-table tr td { padding: 6px 0; }
          .total-table tr.grand-total td { font-size: 16px; font-weight: 800; color: #0f172a; border-top: 2px solid #cbd5e1; padding-top: 10px; }
          .payment-notice { padding: 12px 16px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; font-weight: 600; }
          .payment-notice.captured { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
          .payment-notice.cod { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
          .signature-row { display: grid; grid-template-columns: 1fr 1fr; text-align: center; margin-top: 40px; font-size: 13px; }
          .sig-line { margin-top: 60px; font-weight: bold; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #06b6d4; color: #fff; border: none; padding: 8px 18px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ In Hóa Đơn (Ctrl + P)
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo">TechPulse <span>Engine</span></div>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Hệ thống Bán lẻ Thiết bị Công nghệ & Phụ kiện Đa Biến Thể</p>
          </div>
          <div class="store-info">
            <strong>Hotline CSKH:</strong> 1900 8888 (24/7)<br/>
            <strong>Kho đóng hàng:</strong> 123 Phố Công Nghệ, Cầu Giấy, Hà Nội<br/>
            <strong>Cổng VietQR:</strong> MB Bank (0987654321)
          </div>
        </div>

        <div class="invoice-title">HÓA ĐƠN GIAO HÀNG & PHIẾU BẢO HÀNH</div>
        <div class="invoice-sub">Mã đơn: <strong>#${order.display_id}</strong> • Thời gian tạo: ${new Date(order.created_at).toLocaleString('vi-VN')}</div>

        <div class="grid-info">
          <div class="info-block">
            <h4>Đơn vị gửi hàng</h4>
            <p><strong>Kho vận TechPulse Store</strong></p>
            <p>Địa chỉ: 123 Phố Công Nghệ, Cầu Giấy, Hà Nội</p>
            <p>SĐT Điều phối: 0987.654.321</p>
          </div>
          <div class="info-block">
            <h4>Khách hàng nhận máy</h4>
            <p><strong>${order.customer_name}</strong> - <strong>${order.customer_phone}</strong></p>
            <p>Địa chỉ: ${order.shipping_address}</p>
            ${order.note ? `<p style="color: #ea580c;"><strong>Ghi chú:</strong> ${order.note}</p>` : ''}
          </div>
        </div>

        ${order.payment_status === 'captured' ? `
          <div class="payment-notice captured">
            ✅ ĐÃ THANH TOÁN CHUYỂN KHOẢN (VIETQR NAPAS 24/7) - SỐ TIỀN THU HỘ (COD): 0 VNĐ
          </div>
        ` : `
          <div class="payment-notice cod">
            💰 ĐƠN HÀNG THU TIỀN KHI NHẬN (COD) - SỐ TIỀN CẦN THU HỘ: ${formatMoney(order.total_amount)}
          </div>
        `}

        <table>
          <thead>
            <tr>
              <th class="center" style="width: 40px;">STT</th>
              <th>Mặt hàng / Cấu hình biến thể</th>
              <th class="center" style="width: 60px;">SL</th>
              <th class="right" style="width: 120px;">Đơn giá</th>
              <th class="right" style="width: 130px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <table class="total-table">
            <tr>
              <td style="color: #64748b;">Tổng tiền hàng:</td>
              <td style="text-align: right; font-weight: 600;">${formatMoney(order.subtotal)}</td>
            </tr>
            ${parseFloat(order.discount_total) > 0 ? `
              <tr>
                <td style="color: #16a34a;">Voucher (${order.promotion_code}):</td>
                <td style="text-align: right; color: #16a34a; font-weight: 600;">-${formatMoney(order.discount_total)}</td>
              </tr>
            ` : ''}
            <tr>
              <td style="color: #64748b;">Phí vận chuyển:</td>
              <td style="text-align: right; font-weight: 600;">${order.shipping_fee > 0 ? formatMoney(order.shipping_fee) : 'Miễn phí'}</td>
            </tr>
            <tr class="grand-total">
              <td>TỔNG THANH TOÁN:</td>
              <td style="text-align: right;">${formatMoney(order.total_amount)}</td>
            </tr>
          </table>
        </div>

        <div style="font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
          * Quý khách vui lòng đồng kiểm số lượng, seal và phụ kiện trước khi nhận hàng.<br/>
          * Sản phẩm được bảo hành chính hãng 12 tháng, hỗ trợ 1-đổi-1 trong 30 ngày nếu phát sinh lỗi phần cứng từ nhà sản xuất.
        </div>

        <div class="signature-row">
          <div>
            <strong>Đại diện Kho TechPulse</strong>
            <div class="sig-line">Xác nhận xuất kho</div>
          </div>
          <div>
            <strong>Khách hàng nhận máy</strong>
            <div style="font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</div>
            <div class="sig-line">...................................................</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  onClick={handlePrintInvoice}
                  title="In phiếu gửi hàng & Hóa đơn giao hàng chuẩn"
                >
                  <Printer size={15} />
                  <span>In Hóa Đơn</span>
                </button>

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
                {order.transaction_ref && (
                  <div><strong>Mã GD ngân hàng:</strong> <code style={{ color: 'var(--accent-emerald)' }}>{order.transaction_ref}</code></div>
                )}
              </div>
            </div>

            {/* Carrier & Shipment Tracking Controls */}
            {shipment && (
              <div style={{
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} style={{ color: shipment.carrierColor || 'var(--accent-cyan)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {shipment.carrierIcon} {shipment.carrierName}
                    </span>
                    <code style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                      {shipment.trackingCode}
                    </code>
                  </div>

                  {/* Simulate next step button */}
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
                        background: shipment.carrierKey === c.key ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
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
                  <span>Bưu tá: <strong style={{ color: '#fff' }}>{shipment.driverName}</strong></span>
                  <span>SĐT: <strong style={{ color: 'var(--accent-emerald)' }}>{shipment.driverPhone}</strong></span>
                  {shipment.estimatedDeliveryDate && (
                    <span>Dự kiến giao: <strong style={{ color: 'var(--accent-cyan)' }}>{new Date(shipment.estimatedDeliveryDate).toLocaleDateString('vi-VN')}</strong></span>
                  )}
                </div>

                {/* Checkpoint list */}
                {shipment.timeline && shipment.timeline.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>Lộ trình bưu cục ({shipment.timeline.length} mốc):</div>
                    {shipment.timeline.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: i === shipment.timeline.length - 1 ? 'var(--accent-emerald)' : '#fff' }}>
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
