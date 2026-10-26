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
