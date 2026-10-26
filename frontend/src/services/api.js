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

export async function fetchApi(endpoint, options = {}, token = null, retryCount = 1) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(endpoint, { ...options, headers });
    const rawText = await res.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (_) {
      // Nếu máy chủ đang khởi động lại hoặc cổng proxy trả về trang HTML tạm thời (502/503)
      if (retryCount > 0) {
        await new Promise((r) => setTimeout(r, 1200));
        return fetchApi(endpoint, options, token, retryCount - 1);
      }
      throw new Error('Máy chủ đang khởi động hoặc phản hồi không hợp lệ. Vui lòng thử lại sau giây lát.');
    }

    if (!res.ok) {
      throw new Error((data && data.message) || `Lỗi máy chủ (${res.status})`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

/**
 * Đọc file ảnh từ máy người dùng, tối ưu kích thước (nếu ảnh quá lớn) và tải lên /api/products/upload-image
 */
export async function uploadImageFile(file, token) {
  if (!file) {
    throw new Error('Vui lòng chọn tệp hình ảnh');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Tệp được chọn phải là định dạng hình ảnh (PNG, JPG, WEBP, SVG)');
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== 'string') {
        return reject(new Error('Không thể đọc tệp hình ảnh'));
      }
      // Nếu là SVG hoặc GIF hoặc ảnh nhỏ dưới 600KB thì giữ nguyên
      if (file.type.includes('svg') || file.type.includes('gif') || file.size <= 600 * 1024) {
        return resolve(result);
      }
      // Nén nhẹ ảnh chụp lớn qua Canvas (tối đa 1280px)
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file từ thiết bị'));
    reader.readAsDataURL(file);
  });

  const res = await fetchApi(
    '/api/products/upload-image',
    {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        dataUrl
      })
    },
    token
  );

  return res.data.url;
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
