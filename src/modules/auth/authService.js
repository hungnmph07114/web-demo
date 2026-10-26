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
}

module.exports = new AuthService();
