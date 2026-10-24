/**
 * Math Thinking & Leaderboard Controller
 */
const { pool } = require('../config/db');

// Lay bang xep hang (ho tro loc theo mode va grade)
async function getLeaderboard(req, res, next) {
  const { mode, grade } = req.query;
  try {
    let query = 'SELECT player_name, grade, score, stars, mode, avatar, created_at FROM math_leaderboard';
    const params = [];
    const conditions = [];

    if (mode && mode !== 'all') {
      params.push(mode);
      conditions.push(`mode = $${params.length}`);
    }
    if (grade && grade !== 'all') {
      const gradeNum = parseInt(grade, 10);
      if (!isNaN(gradeNum)) {
        params.push(gradeNum);
        conditions.push(`grade = $${params.length}`);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY score DESC, stars DESC, created_at DESC LIMIT 15';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// Luu diem nguoi choi moi
async function submitScore(req, res, next) {
  const { player_name, grade, score, stars, mode, avatar } = req.body;
  if (!player_name || !player_name.trim()) {
    return res.status(400).json({ error: 'Tên người chơi không được để trống' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO math_leaderboard (player_name, grade, score, stars, mode, avatar) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        player_name.trim().slice(0, 50),
        parseInt(grade, 10) || 1,
        parseInt(score, 10) || 0,
        parseInt(stars, 10) || 0,
        (mode || 'practice').slice(0, 50),
        (avatar || '🦉').slice(0, 10)
      ]
    );
    res.status(201).json({ success: true, record: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// Thong ke tong hop
async function getStats(req, res, next) {
  try {
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_plays,
        COALESCE(SUM(stars), 0) as total_stars,
        COALESCE(MAX(score), 0) as high_score
      FROM math_leaderboard
    `);
    res.json(statsRes.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLeaderboard,
  submitScore,
  getStats
};
