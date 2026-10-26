import React, { useState } from 'react';
import { fetchApi } from '../services/api';
import { X, Zap } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onToast }) {
  if (!isOpen) return null;

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFillAdmin = () => {
    setEmail('admin@techpulse.vn');
    setPassword('admin123');
    setTab('login');
  };

  const handleFillCustomer = () => {
    setEmail('user@techpulse.vn');
    setPassword('user123');
    setTab('login');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      onAuthSuccess(res.data);
      onToast(`Đăng nhập thành công! Chào mừng ${res.data.user.full_name}`);
      onClose();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, phone })
      });
      onAuthSuccess(res.data);
      onToast(`Đăng ký tài khoản thành công!`);
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

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Đăng Nhập
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Đăng Ký
          </button>
        </div>

        {/* Quick Fill Box */}
        <div className="quick-fill-box">
          <span className="quick-fill-title">⚡ Điền nhanh tài khoản thử nghiệm:</span>
          <div className="quick-fill-btns">
            <button type="button" className="btn-pill" onClick={handleFillAdmin}>
              👑 Quản trị viên (admin@techpulse.vn)
            </button>
            <button type="button" className="btn-pill" onClick={handleFillCustomer}>
              👤 Khách hàng (user@techpulse.vn)
            </button>
          </div>
        </div>

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label>Email đăng nhập</label>
              <input
                type="email"
                required
                placeholder="admin@techpulse.vn"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                required
                placeholder="nguyenvana@gmail.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                placeholder="0987654321"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                required
                placeholder="Ít nhất 6 ký tự"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              <span>{isLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
