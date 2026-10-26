import React, { useState } from 'react';
import { Tag } from 'lucide-react';

export default function HeroBanner({ storeSettings, onCopyVoucher }) {
  const [imgError, setImgError] = useState(false);

  const badge = storeSettings?.hero_badge || 'Nền tảng Bán lẻ Đa ngành Thế hệ mới';
  const title = storeSettings?.hero_title || 'Không Gian Mua Sắm Tuyển Chọn &';
  const highlight = storeSettings?.hero_highlight || 'Trải Nghiệm Đa Biến Thể';
  const subtitle =
    storeSettings?.hero_subtitle ||
    'Từ Thời trang thiết kế, Nội thất Bắc Âu, Mỹ phẩm thiên nhiên đến Cà phê thủ công và Thiết bị âm thanh — tùy chọn kích cỡ, chất liệu, dung tích linh hoạt cùng thanh toán VietQR 24/7 tức thì.';
  const heroImage =
    !imgError && storeSettings?.hero_image
      ? storeSettings.hero_image
      : '/assets/editorial/hero-flagship.svg';

  return (
    <div className="hero-banner">
      <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="hero-badge">{badge}</div>
        <h1 className="hero-title">
          {title}
          <br />
          <span className="gradient-text">{highlight}</span>
        </h1>
        <p className="hero-desc">{subtitle}</p>

        <div className="hero-vouchers">
          <button
            type="button"
            className="voucher-tag"
            onClick={() => onCopyVoucher('WELCOME50K')}
          >
            <Tag size={13} style={{ color: 'var(--accent-cyan)' }} />
            <span>
              Giảm 50K đơn từ 300K: <strong>WELCOME50K</strong> (Sao chép)
            </span>
          </button>
          <button
            type="button"
            className="voucher-tag"
            onClick={() => onCopyVoucher('VIP10')}
          >
            <Tag size={13} style={{ color: 'var(--accent-cyan)' }} />
            <span>
              Ưu đãi 10%: <strong>VIP10</strong> (Sao chép)
            </span>
          </button>
          <button
            type="button"
            className="voucher-tag"
            onClick={() => onCopyVoucher('FREESHIP')}
          >
            <Tag size={13} style={{ color: 'var(--accent-cyan)' }} />
            <span>
              Trợ giá vận chuyển: <strong>FREESHIP</strong>
            </span>
          </button>
        </div>
      </div>

      <div className="hero-card">
        <div style={{ width: '100%', aspectRatio: '16 / 9', background: 'var(--bg-media)', overflow: 'hidden' }}>
          <img
            src={heroImage}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div className="hero-stat-row">
          <div className="stat-item">
            <span className="stat-num">Đa ngành</span>
            <span className="stat-label">Thời trang · Nội thất · Mỹ phẩm · F&amp;B</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-num">24/7</span>
            <span className="stat-label">Đối soát VietQR tự động</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-num">100%</span>
            <span className="stat-label">Quản lý tồn kho theo SKU</span>
          </div>
        </div>
      </div>
    </div>
  );
}
