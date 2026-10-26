import React, { useState, useEffect } from 'react';
import { fetchApi, uploadImageFile } from '../services/api';
import { X, Plus, Trash2, PackagePlus, Layers, Upload } from 'lucide-react';

export default function AdminCreateProductModal({ isOpen, onClose, token, onToast, onCreated }) {
  if (!isOpen) return null;

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [attributeName, setAttributeName] = useState('Kích cỡ & Màu sắc');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadImageFile(file, token);
      setThumbnail(url);
      onToast('Đã tải ảnh đại diện lên thành công!');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Dynamic variants
  const [variants, setVariants] = useState([
    {
      title: 'Be Cát / Size M',
      sku: `SKU-${Date.now().toString().slice(-4)}-1`,
      price: '890000',
      original_price: '1090000',
      inventory_quantity: '20'
    }
  ]);

  useEffect(() => {
    fetchApi('/api/products/categories')
      .then((res) => {
        setCategories(res.data || []);
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
        price: '890000',
        original_price: '1090000',
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

    const optKey = attributeName.trim() || 'Phiên bản';
    const slug = generateSlug(title) + '-' + Date.now().toString().slice(-4);
    const parsedVariants = variants.map((v) => ({
      title: v.title.trim(),
      sku: v.sku.trim(),
      price: parseFloat(v.price) || 0,
      original_price: parseFloat(v.original_price) || null,
      inventory_quantity: parseInt(v.inventory_quantity) || 0,
      options_json: { [optKey]: v.title.trim() }
    }));

    setIsLoading(true);
    try {
      await fetchApi(
        '/api/products',
        {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            subtitle: subtitle.trim(),
            slug,
            description: description.trim(),
            thumbnail: thumbnail.trim() || '/assets/editorial/fashion-trench.svg',
            category_id: categoryId ? parseInt(categoryId) : null,
            options: [optKey],
            variants: parsedVariants
          })
        },
        token
      );

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
          <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)' }}>
            Thêm Sản Phẩm &amp; Biến Thể Đa Ngành
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Tên sản phẩm *
              </label>
              <input
                type="text"
                placeholder="VD: Áo Khoác Linen / Ghế Bành Gỗ Sồi / Serum Thảo Mộc..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Danh mục ngành hàng
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-select"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '🛍️'} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Phụ đề / Điểm nhấn chất liệu
              </label>
              <input
                type="text"
                placeholder="VD: 100% Linen hữu cơ thoáng khí, khâu tay thủ công"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Tên thuộc tính phân loại *
              </label>
              <input
                type="text"
                placeholder="VD: Kích cỡ & Màu sắc, Dung tích, Chất liệu..."
                value={attributeName}
                onChange={(e) => setAttributeName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Ảnh đại diện (Nhập link hoặc tải từ máy)
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="/assets/editorial/fashion-trench.svg"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '8px 10px', whiteSpace: 'nowrap' }}>
                  <Upload size={14} />
                  <span>{isUploadingImage ? '...' : 'Tải ảnh'}</span>
                  <input type="file" accept="image/*" onChange={handleUploadThumbnail} style={{ display: 'none' }} disabled={isUploadingImage} />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Preset Thumbnails */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Ảnh mẫu nhanh:</span>
            {[
              { label: '🧥 Thời trang', url: '/assets/editorial/fashion-trench.svg', attr: 'Kích cỡ & Màu sắc' },
              { label: '👜 Túi da', url: '/assets/editorial/leather-tote.svg', attr: 'Màu da' },
              { label: '🪑 Nội thất', url: '/assets/editorial/living-chair.svg', attr: 'Chất liệu & Màu gỗ' },
              { label: '🧴 Mỹ phẩm', url: '/assets/editorial/beauty-serum.svg', attr: 'Dung tích' },
              { label: '☕ Cà phê / F&B', url: '/assets/editorial/coffee-roast.svg', attr: 'Khối lượng & Mức xay' },
              { label: '🎧 Thiết bị', url: '/assets/editorial/audio-studio.svg', attr: 'Phiên bản màu' }
            ].map((preset) => (
              <button
                key={preset.url}
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                onClick={() => {
                  setThumbnail(preset.url);
                  setAttributeName(preset.attr);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              Mô tả chi tiết (Chất liệu, xuất xứ, hướng dẫn bảo quản / sử dụng)
            </label>
            <textarea
              rows={2}
              placeholder="Nhập thông tin chi tiết về chất liệu, kích thước, hướng dẫn sử dụng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Variants Section */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
                <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>
                  Danh Sách Biến Thể ({attributeName || 'Phiên bản'}) ({variants.length})
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.75rem' }}
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
                    background: 'var(--bg-surface)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>
                      Giá trị ({attributeName})
                    </span>
                    <input
                      type="text"
                      placeholder="VD: Size M / 50ml / Gỗ Sồi"
                      value={v.title}
                      onChange={(e) => handleVariantChange(idx, 'title', e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.8rem' }}
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
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Giá bán (VNĐ)</span>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Giá niêm yết</span>
                    <input
                      type="number"
                      value={v.original_price}
                      onChange={(e) => handleVariantChange(idx, 'original_price', e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Tồn kho</span>
                    <input
                      type="number"
                      value={v.inventory_quantity}
                      onChange={(e) => handleVariantChange(idx, 'inventory_quantity', e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                      required
                      min="0"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-rose)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
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
            <span>{isLoading ? 'Đang lưu sản phẩm...' : 'Đăng Bán Sản Phẩm Mới'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
