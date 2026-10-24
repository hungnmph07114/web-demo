/**
 * API Service Client for MathKids Backend
 */
class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // Lay danh sach bang vinh danh
  async getLeaderboard(mode = 'all', grade = 'all') {
    let url = `${this.baseUrl}/math/leaderboard?`;
    const params = new URLSearchParams();
    if (mode && mode !== 'all') params.append('mode', mode);
    if (grade && grade !== 'all') params.append('grade', grade);

    const res = await fetch(`${url}${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Không thể tải bảng vinh danh`);
    return await res.json();
  }

  // Luu diem nguoi choi len he thong
  async submitScore(payload) {
    const res = await fetch(`${this.baseUrl}/math/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Không thể lưu điểm`);
    return await res.json();
  }

  // Lay thong ke tong the
  async getStats() {
    const res = await fetch(`${this.baseUrl}/math/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Không thể lấy thống kê`);
    return await res.json();
  }

  // Kiem tra trang thai server & database
  async getStatus() {
    const res = await fetch(`${this.baseUrl}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Lỗi kiểm tra máy chủ`);
    return await res.json();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
