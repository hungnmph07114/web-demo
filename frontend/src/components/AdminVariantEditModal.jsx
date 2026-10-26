import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { X, Layers, Save, Plus, Trash2 } from 'lucide-react';

export default function AdminVariantEditModal({ productId, isOpen, onClose, token, onToast, onUpdated, unitLabel = 'sản phẩm' }) {
  if (!isOpen || !productId) return null;

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // New variant form state
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newStock, setNewStock] = useState('15');
  const [isCreating, setIsCreating] = useState(false);

  const loadProductVariants = () => {
    setIsLoading(true);
    fetchApi(`/api/products/${productId}`)
      .then((res) => {
        setProduct(res.data);
        setVariants(res.data.variants || []);
      })
      .catch((err) => onToast(err.message, 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProductVariants();
  }, [productId]);

  const handleFieldChange = (variantId, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleSaveVariant = async (variant) => {
    setSavingId(variant.id);
    try {
      await fetchApi(
        `/api/products/variants/${variant.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: variant.title,
            sku: variant.sku,
            price: parseFloat(variant.price) || 0,
            original_price: variant.original_price ? parseFloat(variant.original_price) : null,
            inventory_quantity: parseInt(variant.inventory_quantity, 10) || 0
          })
        },
        token
      );

      onToast(`Đã lưu thay đổi biến thể ${variant.sku}!`);
      if (onUpdated) onUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSku.trim() || !newPrice) {
      onToast('Vui lòng nhập Tên biến thể, Mã SKU và Giá bán', 'error');
      return;
    }
    setIsCreating(true);
    try {
      const optName = product?.options?.[0]?.title || 'Phân loại';
      await fetchApi(
        `/api/products/${productId}/variants`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: newTitle.trim(),
            sku: newSku.trim().toUpperCase(),
            price: parseFloat(newPrice) || 0,
            original_price: newOriginalPrice ? parseFloat(newOriginalPrice) : null,
            inventory_quantity: parseInt(newStock, 10) || 0,
            options_json: { [optName]: newTitle.trim() }
          })
        },
        token
      );
      onToast(`Đã thêm biến thể mới "${newTitle}" thành công!`);
      setNewTitle('');
      setNewSku('');
      setNewPrice('');
      setNewOriginalPrice('');
      setNewStock('15');
      loadProductVariants();
      if (onUpdated) onUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteVariant = async (variant) => {
    if (variants.length <= 1) {
      onToast('Sản phẩm phải có tối thiểu 1 biến thể đang hoạt động', 'error');
      return;
    }
    setDeletingId(variant.id);
    try {
      await fetchApi(`/api/products/variants/${variant.id}`, { method: 'DELETE' }, token);
      onToast(`Đã xóa biến thể ${variant.sku}`);
      loadProductVariants();
      if (onUpdated) onUpdated();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setDeletingId(null);
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
            <h2 style={{ fontSize: '1.3rem' }}>Quản Lý Biến Thể, Giá Bán &amp; Tồn Kho SKU</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {product ? `${product.title} (${variants.length} biến thể)` : 'Đang tải...'}
            </p>
          </div>
        </div>

        {isLoading || !product ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu biến thể...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Phiên bản / Biến thể</th>
                    <th>Mã SKU</th>
                    <th>Giá bán (VNĐ)</th>
                    <th>Giá gốc (VNĐ)</th>
                    <th>Tồn kho ({unitLabel})</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <input
                          type="text"
                          value={v.title}
                          onChange={(e) => handleFieldChange(v.id, 'title', e.target.value)}
                          className="form-input"
                          style={{ padding: '6px 8px', fontSize: '0.85rem', minWidth: '140px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleFieldChange(v.id, 'sku', e.target.value)}
                          className="form-input"
                          style={{ padding: '6px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', width: '125px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => handleFieldChange(v.id, 'price', e.target.value)}
                          className="form-input"
                          style={{ width: '125px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 700 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.original_price || ''}
                          onChange={(e) => handleFieldChange(v.id, 'original_price', e.target.value)}
                          placeholder="Không có"
                          className="form-input"
                          style={{ width: '125px', padding: '6px 8px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.inventory_quantity}
                          onChange={(e) => handleFieldChange(v.id, 'inventory_quantity', e.target.value)}
                          min="0"
                          className="form-input"
                          style={{
                            width: '85px',
                            padding: '6px 8px',
                            color: v.inventory_quantity <= 5 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleSaveVariant(v)}
                            disabled={savingId === v.id}
                          >
                            <Save size={13} />
                            <span>{savingId === v.id ? '...' : 'Lưu'}</span>
                          </button>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 8px', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                              onClick={() => handleDeleteVariant(v)}
                              disabled={deletingId === v.id}
                              title="Xóa biến thể này"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Variant Form */}
            <form
              onSubmit={handleCreateVariant}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
                ➕ Thêm Biến Thể SKU Mới Cho Sản Phẩm Này
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Tên biến thể (VD: Size XL / 100ml)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                  style={{ flex: '1 1 160px', padding: '7px 10px', fontSize: '0.82rem' }}
                  required
                />
                <input
                  type="text"
                  placeholder="Mã SKU (VD: SKU-XL-09)"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="form-input"
                  style={{ width: '140px', padding: '7px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                  required
                />
                <input
                  type="number"
                  placeholder="Giá bán *"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="form-input"
                  style={{ width: '130px', padding: '7px 10px', fontSize: '0.82rem' }}
                  required
                />
                <input
                  type="number"
                  placeholder="Giá gốc"
                  value={newOriginalPrice}
                  onChange={(e) => setNewOriginalPrice(e.target.value)}
                  className="form-input"
                  style={{ width: '120px', padding: '7px 10px', fontSize: '0.82rem' }}
                />
                <input
                  type="number"
                  placeholder="Tồn kho"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '7px 10px', fontSize: '0.82rem' }}
                  min="0"
                />
                <button type="submit" className="btn btn-primary" disabled={isCreating} style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                  <Plus size={14} />
                  <span>{isCreating ? 'Đang thêm...' : 'Thêm SKU'}</span>
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng cửa sổ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
