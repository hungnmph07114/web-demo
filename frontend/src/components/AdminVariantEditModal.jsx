import React, { useState, useEffect } from 'react';
import { fetchApi, formatMoney } from '../services/api';
import { X, Layers, Save, Check } from 'lucide-react';

export default function AdminVariantEditModal({ productId, isOpen, onClose, token, onToast, onUpdated }) {
  if (!isOpen || !productId) return null;

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchApi(`/api/products/${productId}`)
      .then((res) => {
        setProduct(res.data);
        setVariants(res.data.variants || []);
      })
      .catch((err) => onToast(err.message, 'error'))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleFieldChange = (variantId, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleSaveVariant = async (variant) => {
    setSavingId(variant.id);
    try {
      await fetchApi(`/api/products/variants/${variant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          price: parseFloat(variant.price),
          original_price: parseFloat(variant.original_price) || null,
          inventory_quantity: parseInt(variant.inventory_quantity) || 0
        })
      }, token);

      onToast(`Đã lưu thay đổi biến thể ${variant.sku}!`);
      if (onUpdated) onUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Layers size={22} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Điều Chỉnh Giá & Tồn Kho Biến Thể</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {product ? product.title : 'Đang tải...'}
            </p>
          </div>
        </div>

        {isLoading || !product ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu biến thể...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Phiên bản / Biến thể</th>
                    <th>Mã SKU</th>
                    <th>Giá bán (VNĐ)</th>
                    <th>Giá gốc (VNĐ)</th>
                    <th>Tồn kho (máy)</th>
                    <th>Lưu</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.title}</strong>
                      </td>
                      <td>
                        <code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{v.sku}</code>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => handleFieldChange(v.id, 'price', e.target.value)}
                          style={{
                            width: '130px',
                            padding: '6px 8px',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.original_price || ''}
                          onChange={(e) => handleFieldChange(v.id, 'original_price', e.target.value)}
                          placeholder="Không có"
                          style={{
                            width: '130px',
                            padding: '6px 8px',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '4px',
                            color: 'var(--text-dim)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.inventory_quantity}
                          onChange={(e) => handleFieldChange(v.id, 'inventory_quantity', e.target.value)}
                          min="0"
                          style={{
                            width: '80px',
                            padding: '6px 8px',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '4px',
                            color: v.inventory_quantity <= 5 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => handleSaveVariant(v)}
                          disabled={savingId === v.id}
                        >
                          <Save size={14} />
                          <span>{savingId === v.id ? 'Đang lưu...' : 'Lưu'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
