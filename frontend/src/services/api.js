export function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0)) + 'đ';
}

export function copyText(text, label = 'Nội dung', onToast) {
  navigator.clipboard.writeText(text).then(() => {
    if (onToast) onToast(`Đã sao chép ${label}: ${text}`);
  }).catch(() => {
    if (onToast) onToast(`Không thể sao chép tự động`, 'error');
  });
}

export async function fetchApi(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(endpoint, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Lỗi khi gọi API');
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

/**
 * Xuất danh sách đơn hàng ra file CSV chuẩn UTF-8 (mở được trên Microsoft Excel không bị lỗi font tiếng Việt)
 */
export function exportOrdersToCSV(orders) {
  if (!orders || orders.length === 0) {
    throw new Error('Không có dữ liệu đơn hàng để xuất file');
  }

  const headers = [
    'Mã đơn hàng',
    'Tên khách hàng',
    'Số điện thoại',
    'Email',
    'Địa chỉ nhận hàng',
    'Ghi chú đơn hàng',
    'Ngày đặt hàng',
    'Tạm tính (VNĐ)',
    'Mã giảm giá',
    'Chiết khấu (VNĐ)',
    'Phí vận chuyển (VNĐ)',
    'Tổng thanh toán (VNĐ)',
    'Phương thức thanh toán',
    'Trạng thái thanh toán',
    'Trạng thái giao vận',
    'Mã giao dịch ngân hàng (Ref)',
    'Danh sách mặt hàng & Biến thể'
  ];

  const rows = orders.map((o) => {
    const itemsSummary = (o.items || [])
      .map((i) => `${i.product_title} (${i.variant_title}) x${i.quantity} [${Math.round(i.unit_price)}đ]`)
      .join('; ');

    const dateStr = new Date(o.created_at).toLocaleString('vi-VN');

    const paymentLabel =
      o.payment_status === 'captured' ? 'Đã thanh toán (Captured)' :
      o.payment_status === 'refunded' ? 'Đã hoàn tiền' : 'Chờ thanh toán VietQR';

    const fulfillmentLabel =
      o.fulfillment_status === 'delivered' ? 'Đã nhận hàng' :
      o.fulfillment_status === 'shipped' ? 'Đang giao hàng' :
      o.fulfillment_status === 'packing' ? 'Đang đóng gói' :
      o.fulfillment_status === 'canceled' ? 'Đã hủy' : 'Chờ xử lý';

    return [
      `"${o.display_id || ''}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_phone || ''}"`,
      `"${o.customer_email || ''}"`,
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
      `"${(o.note || '').replace(/"/g, '""')}"`,
      `"${dateStr}"`,
      Math.round(o.subtotal || 0),
      `"${o.promotion_code || ''}"`,
      Math.round(o.discount_total || 0),
      Math.round(o.shipping_fee || 0),
      Math.round(o.total_amount || 0),
      `"${o.payment_method || ''}"`,
      `"${paymentLabel}"`,
      `"${fulfillmentLabel}"`,
      `"${o.transaction_ref || ''}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`
    ].join(',');
  });

  // \uFEFF là BOM (Byte Order Mark) để Microsoft Excel nhận diện UTF-8 tiếng Việt
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateSuffix = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `BaoCao_DonHang_TechPulse_${dateSuffix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
