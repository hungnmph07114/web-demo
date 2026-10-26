import React from 'react';
import { Tag } from 'lucide-react';

export default function HeroBanner({ onCopyVoucher }) {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <div className="hero-badge">🚀 Kiến trúc Headless Modular E-Commerce</div>
        <h1 className="hero-title">
          Đồ Công Nghệ Flagship &<br />
          <span className="gradient-text">Hệ Thống Đa Biến Thể</span>
        </h1>
        <p className="hero-desc">
          Trải nghiệm mua sắm thiết bị cao cấp với khả năng tùy chọn màu sắc, dung lượng và thanh toán tự động qua cổng <strong>VietQR NAPAS 247</strong>.
        </p>

        <div className="hero-vouchers">
          <span className="voucher-tag" onClick={() => onCopyVoucher('TECHPULSE50K')}>
            <Tag size={14} /> Giảm 50K: <strong>TECHPULSE50K</strong> (Click sao chép)
          </span>
          <span className="voucher-tag" onClick={() => onCopyVoucher('VIP10')}>
            <Tag size={14} /> Giảm 10%: <strong>VIP10</strong> (Click sao chép)
          </span>
        </div>
      </div>

      <div className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-status">
            <span className="status-dot"></span> Hệ thống đang hoạt động
          </div>
          <div className="hero-stat-row">
            <div className="stat-item">
              <span className="stat-num">15+</span>
              <span className="stat-label">Biến thể cấu hình</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">0%</span>
              <span className="stat-label">Phí VietQR 24/7</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-label">Chính hãng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
