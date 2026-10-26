import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { X, Plus, Trash2, PackagePlus, Layers } from 'lucide-react';

export default function AdminCreateProductModal({ isOpen, onClose, token, onToast, onCreated }) {
  if (!isOpen) return null;

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic variants
  const [variants, setVariants] = useState([
    {
      title: 'Tiêu chuẩn - Màu Mặc Định',
      sku: `TP-${Date.now().toString().slice(-4)}`,
      price: '1990000',
      original_price: '2290000',
      inventory_quantity: '20'
    }
  ]);

  useEffect(() => {
    fetchApi('/api/products/categories')
      .then((res) => {
        setCategories(res.data);
        if (res.data && res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        title: `Phiên bản #${variants.length + 1}`,
        sku: `SKU-${Date.now().toString().slice(-4)}-${variants.length + 1}`,
        price: '2990000',
        original_price: '3490000',
        inventory_quantity: '15'
      }
    ]);
  };

  const handleRemoveVariant = (idx) => {
    if (variants.length <= 1) {
      onToast('Sản phẩm phải có ít nhất 1 biến thể SKU!', 'info');
      return;
    }
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx, field, val) => {
    const updated = [...variants];
    updated[idx][field] = val;
    setVariants(updated);
  };

  const generateSlug = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast('Vui lòng nhập tên sản phẩm', 'error');
      return;
    }

    const slug = generateSlug(title) + '-' + Date.now().toString().slice(-4);
    const parsedVariants = variants.map((v) => ({
      title: v.title.trim(),
      sku: v.sku.trim(),
      price: parseFloat(v.price) || 0,
      original_price: parseFloat(v.original_price) || null,
      inventory_quantity: parseInt(v.inventory_quantity) || 0,
      options_json: { "Cấu hình": v.title.trim() }
    }));

    setIsLoading(true);
    try {
      await fetchApi('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
          slug,
          description: description.trim(),
          thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          category_id: categoryId ? parseInt(categoryId) : null,
          options: ['Cấu hình & Phiên bản'],
          variants: parsedVariants
        })
      }, token);

      onToast(`Đã thêm sản phẩm "${title}" và ${parsedVariants.length} biến thể thành công!`);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <PackagePlus size={22} style={{ color: 'var(--accent-cyan)' }} />
          <h2 style={{ fontSize: '1.35rem' }}>Thêm Sản Phẩm & Biến Thể Mới (Medusa Model)</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Tên sản phẩm *
              </label>
              <input
                type="text"
                placeholder="VD: Bàn phím cơ không dây Logitech MX Mechanical"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Danh mục sản phẩm
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '📱'} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Phụ đề / Điểm nhấn nổi bật
              </label>
              <input
                type="text"
                placeholder="VD: Switch Tactile Quiet, Kết nối 3 thiết bị đồng thời"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Link ảnh Thumbnail (URL)
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Mô tả chi tiết sản phẩm
            </label>
            <textarea
              rows={2}
              placeholder="Nhập thông số kỹ thuật, bảo hành chính hãng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Variants Section */}
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
                <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>Danh Sách Biến Thể Cấu Hình ({variants.length})</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={handleAddVariant}
              >
                <Plus size={14} />
                <span>Thêm Biến Thể</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.8fr 36px',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'var(--bg-surface-elevated)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Tên biến thể</span>
                    <input
                      type="text"
                      placeholder="VD: Xám / 512GB"
                      value={v.title}
                      onChange={(e) => handleVariantChange(idx, 'title', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: 'none', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Mã SKU</span>
                    <input
                      type="text"
                      placeholder="SKU-..."
                      value={v.sku}
                      onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: 'none', border: '1px solid var(--border-glass)', borderRadius: '4px', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Giá bán (VNĐ)</span>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: 'none', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Giá gốc</span>
                    <input
                      type="number"
                      value={v.original_price}
                      onChange={(e) => handleVariantChange(idx, 'original_price', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: 'none', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Tồn kho</span>
                    <input
                      type="number"
                      value={v.inventory_quantity}
                      onChange={(e) => handleVariantChange(idx, 'inventory_quantity', e.target.value)}
                      style={{ width: '100%', padding: '6px', background: 'none', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                      required
                      min="0"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Xóa biến thể"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isLoading}
            style={{ marginTop: '6px' }}
          >
            <PackagePlus size={18} />
            <span>{isLoading ? 'Đang lưu vào PostgreSQL...' : 'Đăng Bán Sản Phẩm Mới'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
