import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Star, CheckCircle, Trash2, Send, ThumbsUp, MessageSquare, Plus, X } from 'lucide-react';

export default function ProductReviews({ productId, token, currentUser, onToast }) {
  const [reviewsData, setReviewsData] = useState({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filterRating, setFilterRating] = useState('all'); // 'all' | 5 | 4 | 3 | 2 | 1 | 'verified'

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState(currentUser?.fullName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const starLabels = {
    1: 'Rất không hài lòng',
    2: 'Chưa hài lòng',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Rất xuất sắc! Cực kỳ hài lòng'
  };

  const loadReviews = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const res = await fetchApi(`/api/products/${productId}/reviews`);
      if (res.success && res.data) {
        setReviewsData(res.data);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    if (currentUser?.fullName) {
      setUserName(currentUser.fullName);
    }
  }, [productId, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      onToast('Vui lòng nhập nội dung nhận xét của bạn', 'error');
      return;
    }
    if (!userName.trim()) {
      onToast('Vui lòng nhập họ và tên của bạn', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchApi(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          title: title.trim(),
          comment: comment.trim(),
          userName: userName.trim(),
          userEmail: currentUser?.email || undefined
        })
      }, token);

      if (res.success) {
        onToast('🎉 Cảm ơn bạn! Đánh giá đã được đăng thành công.');
        setTitle('');
        setComment('');
        setShowForm(false);
        loadReviews();
      } else {
        onToast(res.message || 'Không thể gửi đánh giá', 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      const res = await fetchApi(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      }, token);
      if (res.success) {
        onToast('Đã xóa đánh giá thành công');
        loadReviews();
      } else {
        onToast(res.message, 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const { averageRating, totalReviews, distribution, reviews } = reviewsData;

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    if (filterRating === 'verified') return r.verified_purchase;
    return r.rating === Number(filterRating);
  });

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="product-reviews-container" style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--accent-cyan)" />
            <span>Đánh giá & Nhận xét của Khách hàng</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Trải nghiệm thực tế từ những người đã mua và sử dụng sản phẩm tại TechPulse
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? 'Đóng biểu mẫu' : 'Viết đánh giá'}</span>
        </button>
      </div>

      {/* Review Summary Scoreboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 1fr) 2fr',
          gap: '24px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        {/* Left score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid var(--border-glass)', paddingRight: '20px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {averageRating}
          </div>
          <div style={{ display: 'flex', gap: '4px', margin: '8px 0', color: '#FBBF24' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                fill={star <= Math.round(averageRating) ? '#FBBF24' : 'transparent'}
                color="#FBBF24"
              />
            ))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Dựa trên <strong>{totalReviews}</strong> lượt đánh giá
          </div>
        </div>

        {/* Right bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = distribution[s] || 0;
            const pct = getPercentage(count);
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                <span style={{ width: '42px', display: 'flex', alignItems: 'center', gap: '3px', color: '#fff' }}>
                  {s} <Star size={11} fill="#FBBF24" color="#FBBF24" />
                </span>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: s >= 4 ? 'var(--accent-emerald)' : s === 3 ? 'var(--accent-amber)' : '#EF4444',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <span style={{ width: '65px', textAlign: 'right', color: 'var(--text-muted)' }}>
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '24px',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
            Đánh giá sản phẩm của bạn
          </h4>

          {/* Star selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Mức độ hài lòng của bạn:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transform: (hoverRating || rating) >= s ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <Star
                      size={28}
                      fill={(hoverRating || rating) >= s ? '#FBBF24' : 'transparent'}
                      color="#FBBF24"
                    />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FBBF24', marginLeft: '8px' }}>
                {starLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Họ và tên của bạn: *
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn A"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Tiêu đề ngắn gọn:
              </label>
              <input
                type="text"
                placeholder="VD: Máy dùng rất mượt, pin trâu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Nội dung nhận xét chi tiết: *
            </label>
            <textarea
              rows="3"
              placeholder="Chia sẻ cảm nhận về thiết kế, hiệu năng, đóng gói hoặc tốc độ giao hàng của TechPulse..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <button
          type="button"
          onClick={() => setFilterRating('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: filterRating === 'all' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
            background: filterRating === 'all' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: filterRating === 'all' ? 'var(--accent-cyan)' : 'var(--text-muted)'
          }}
        >
          Tất cả ({totalReviews})
        </button>

        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterRating(s)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: filterRating === s ? '1px solid #FBBF24' : '1px solid var(--border-glass)',
              background: filterRating === s ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: filterRating === s ? '#FBBF24' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{s}</span>
            <Star size={11} fill={filterRating === s ? '#FBBF24' : 'none'} color="#FBBF24" />
            <span>({distribution[s] || 0})</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setFilterRating('verified')}
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: filterRating === 'verified' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
            background: filterRating === 'verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: filterRating === 'verified' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <CheckCircle size={12} />
          <span>Đã mua hàng ({reviews.filter((r) => r.verified_purchase).length})</span>
        </button>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Đang tải đánh giá từ khách hàng...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-glass)',
              color: 'var(--text-muted)'
            }}
          >
            Chưa có đánh giá nào phù hợp với bộ lọc này.
          </div>
        ) : (
          filteredReviews.map((r) => {
            const isAdmin = currentUser?.role === 'admin';
            const isOwner = currentUser?.id && r.user_id === currentUser.id;
            const initial = (r.user_name || 'U').charAt(0).toUpperCase();

            return (
              <div
                key={r.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
                        color: '#fff',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.95rem'
                      }}
                    >
                      {initial}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                          {r.user_name}
                        </span>
                        {r.verified_purchase && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: 'var(--accent-emerald)',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle size={10} />
                            <span>Đã mua tại TechPulse</span>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(r.created_at)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '2px', color: '#FBBF24' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= r.rating ? '#FBBF24' : 'transparent'}
                          color="#FBBF24"
                        />
                      ))}
                    </div>

                    {(isAdmin || isOwner) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        title="Xóa đánh giá"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.7
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {r.title && (
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '6px 0 4px 0' }}>
                    {r.title}
                  </h5>
                )}

                <p style={{ fontSize: '0.88rem', color: '#D1D5DB', lineHeight: 1.5, margin: 0 }}>
                  {r.comment}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
