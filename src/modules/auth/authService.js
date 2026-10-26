const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
const { JWT_SECRET } = require('../../middlewares/auth');

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw { status: 400, message: 'Vui lòng nhập đầy đủ Email và Mật khẩu' };
    }

    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (res.rows.length === 0) {
      throw { status: 401, message: 'Tài khoản Email không tồn tại trong hệ thống' };
    }

    const user = res.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw { status: 401, message: 'Mật khẩu không chính xác' };
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      }
    };
  }

  async register({ email, password, full_name, phone }) {
    if (!email || !password || !full_name) {
      throw { status: 400, message: 'Vui lòng cung cấp Email, Mật khẩu và Họ tên' };
    }

    const exist = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (exist.rows.length > 0) {
      throw { status: 409, message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác' };
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES ($1, $2, $3, $4, 'customer')
      RETURNING id, email, full_name, phone, role;
    `, [email.toLowerCase().trim(), password_hash, full_name.trim(), phone ? phone.trim() : null]);

    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user };
  }

  async getProfile(userId) {
    const res = await pool.query('SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1', [userId]);
    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy thông tin tài khoản' };
    }
    return res.rows[0];
  }

  async updateProfile(userId, { full_name, phone }) {
    if (!full_name || !full_name.trim()) {
      throw { status: 400, message: 'Họ và tên không được để trống' };
    }
    const res = await pool.query(`
      UPDATE users
      SET full_name = $1, phone = $2
      WHERE id = $3
      RETURNING id, email, full_name, phone, role, created_at;
    `, [full_name.trim(), phone ? phone.trim() : null, userId]);

    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy tài khoản' };
    }
    return res.rows[0];
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw { status: 400, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' };
    }
    if (String(newPassword).length < 6) {
      throw { status: 400, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' };
    }

    const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (res.rows.length === 0) {
      throw { status: 404, message: 'Không tìm thấy tài khoản người dùng' };
    }

    const user = res.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw { status: 401, message: 'Mật khẩu hiện tại không chính xác' };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
    return true;
  }
}

module.exports = new AuthService();
