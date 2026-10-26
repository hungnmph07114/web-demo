import React, { useState } from 'react';
import { fetchApi } from '../services/api';
import { X, Tag, Plus, Check } from 'lucide-react';

export default function AdminCreatePromoModal({ isOpen, onClose, token, onToast, onCreated }) {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('percentage'); // 'percentage' | 'fixed'
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('0');
  const [usageLimit, setUsageLimit] = useState('100');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !value) {
      onToast('Vui lòng nhập mã Voucher và giá trị ưu đãi', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await fetchApi('/api/promotions', {
        method: 'POST',
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description,
          type,
          value: parseFloat(value),
          min_order_value: parseFloat(minOrderValue) || 0,
          max_discount: parseFloat(maxDiscount) || 0,
          usage_limit: parseInt(usageLimit) || 100
        })
      }, token);

      onToast(`Đã tạo thành công mã voucher ${code.trim().toUpperCase()}!`);
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
      <div className="modal-card modal-sm">
        <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Tag size={20} style={{ color: 'var(--accent-cyan)' }} />
          <h2 style={{ fontSize: '1.25rem' }}>Tạo Mã Giảm Giá Mới</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Mã Voucher (Code) *
            </label>
            <input
              type="text"
              placeholder="VD: TECHFEST2026, VIP20..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-cyan)',
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Mô tả khuyến mãi
            </label>
            <input
              type="text"
              placeholder="VD: Giảm ngay 10% cho đơn hàng đón lễ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Loại ưu đãi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
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
                <option value="percentage">Giảm theo %</option>
                <option value="fixed">Giảm tiền mặt (VNĐ)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Giá trị giảm * ({type === 'percentage' ? '%' : 'VNĐ'})
              </label>
              <input
                type="number"
                placeholder={type === 'percentage' ? '10' : '100000'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
                min="1"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Đơn tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                placeholder="VD: 500000"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
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
                Giảm tối đa (VNĐ)
              </label>
              <input
                type="number"
                placeholder="0 = Không giới hạn"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
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
              Số lượt dùng tối đa
            </label>
            <input
              type="number"
              placeholder="100"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
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

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
            style={{ marginTop: '8px' }}
          >
            <Plus size={16} />
            <span>{isLoading ? 'Đang tạo...' : 'Kích hoạt Mã Khuyến Mãi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
