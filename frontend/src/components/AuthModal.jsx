import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { X, Lock, UserCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, user, token, onAuthSuccess, onProfileUpdated, onToast }) {
  if (!isOpen) return null;

  const [tab, setTab] = useState(user ? 'security' : 'login'); // 'login' | 'register' | 'security'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setTab('security');
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    } else {
      setTab('login');
    }
  }, [user, isOpen]);

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
      onToast('Đăng ký tài khoản thành công!');
      onClose();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetchApi(
        '/api/auth/profile',
        {
          method: 'PUT',
          body: JSON.stringify({ full_name: fullName, phone })
        },
        token
      );
      if (res.success && res.data) {
        if (onProfileUpdated) onProfileUpdated(res.data);
        onToast('Đã cập nhật hồ sơ cá nhân thành công!');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetchApi(
        '/api/auth/change-password',
        {
          method: 'POST',
          body: JSON.stringify({ currentPassword, newPassword })
        },
        token
      );
      if (res.success) {
        onToast(res.message || 'Đã đổi mật khẩu bảo mật thành công!');
        setCurrentPassword('');
        setNewPassword('');
        onClose();
      }
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
          {!user ? (
            <>
              <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
                Đăng Nhập
              </button>
              <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
                Đăng Ký
              </button>
            </>
          ) : (
            <button className="auth-tab active" style={{ width: '100%' }}>
              🔒 Hồ Sơ &amp; Bảo Mật Tài Khoản
            </button>
          )}
        </div>

        {!user && (
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
        )}

        {/* Login Form */}
        {tab === 'login' && !user && (
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
        )}

        {/* Register Form */}
        {tab === 'register' && !user && (
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

        {/* Logged-in Profile & Change Password Form */}
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <form onSubmit={handleUpdateProfileSubmit} className="auth-form">
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={15} />
                <span>Thông tin tài khoản ({user.email})</span>
              </div>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-block" disabled={isLoading}>
                <span>Lưu Hồ Sơ Cá Nhân</span>
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
              <form onSubmit={handleChangePasswordSubmit} className="auth-form">
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} />
                  <span>Đổi mật khẩu bảo mật</span>
                </div>
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu đang dùng"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới (tối thiểu 6 ký tự) *</label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  <span>{isLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Mới'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
