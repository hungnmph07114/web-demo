import React, { useState, useEffect } from 'react';
import { fetchApi, uploadImageFile } from '../services/api';
import { X, Edit3, Upload, Eye, EyeOff, Save } from 'lucide-react';

export default function AdminEditProductModal({
  product,
  isOpen,
  onClose,
  token,
  onToast,
  onProductUpdated
}) {
  if (!isOpen || !product) return null;

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState(product.title || '');
  const [subtitle, setSubtitle] = useState(product.subtitle || '');
  const [categoryId, setCategoryId] = useState(product.category_id || '');
  const [description, setDescription] = useState(product.description || '');
  const [thumbnail, setThumbnail] = useState(product.thumbnail || '');
  const [isPublished, setIsPublished] = useState(product.is_published !== false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(product.title || '');
    setSubtitle(product.subtitle || '');
    setCategoryId(product.category_id || '');
    setDescription(product.description || '');
    setThumbnail(product.thumbnail || '');
    setIsPublished(product.is_published !== false);

    fetchApi('/api/products/categories')
      .then((res) => setCategories(res.data || []))
      .catch(console.error);
  }, [product]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageFile(file, token);
      setThumbnail(uploadedUrl);
      onToast('Đã tải ảnh sản phẩm lên thành công!');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetchApi(
        `/api/products/${product.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: title.trim(),
            subtitle: subtitle.trim(),
            category_id: categoryId ? parseInt(categoryId, 10) : null,
            description: description.trim(),
            thumbnail: thumbnail.trim(),
            is_published: isPublished
          })
        },
        token
      );
      onToast(`Đã cập nhật sản phẩm "${title}" thành công!`);
      if (onProductUpdated) onProductUpdated();
      onClose();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-card modal-lg">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Edit3 size={22} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Chỉnh Sửa Thông Tin Sản Phẩm</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Cập nhật tên, mô tả, ngành hàng, tải ảnh từ thiết bị hoặc bật/tắt trạng thái mở bán
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Tên sản phẩm *
              </label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Danh mục ngành hàng *
              </label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Mô tả ngắn (Subtitle)
              </label>
              <input
                type="text"
                className="form-input"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Tóm tắt chất liệu, xuất xứ, điểm nổi bật..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Trạng thái kinh doanh trên cửa hàng
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={isPublished ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ width: '100%', justifyContent: 'center', padding: '10px 12px' }}
              >
                {isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                <span>
                  {isPublished
                    ? '✅ Đang mở bán công khai trên Storefront'
                    : '⏸️ Đang tạm ẩn (Ngừng hiển thị ngoài trang chủ)'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Ảnh đại diện sản phẩm (Nhập link hoặc Tải ảnh trực tiếp từ máy)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Preview"
                  style={{
                    width: '54px',
                    height: '54px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)'
                  }}
                />
              )}
              <input
                type="text"
                className="form-input"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
                placeholder="/assets/editorial/fashion-trench.svg hoặc /uploads/..."
              />
              <label
                className="btn btn-secondary"
                style={{ cursor: 'pointer', margin: 0, whiteSpace: 'nowrap' }}
              >
                <Upload size={15} />
                <span>{isUploading ? 'Đang tải lên...' : '📤 Tải ảnh từ máy'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Mô tả chi tiết sản phẩm
            </label>
            <textarea
              rows={3}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết chất liệu, công năng, hướng dẫn bảo quản..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving || isUploading}>
              <Save size={16} />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Sản Phẩm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
