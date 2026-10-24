/**
 * Notes CRUD Controller
 */
const { pool } = require('../config/db');

// Lay danh sach ghi chu
async function getNotes(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// Them ghi chu moi
async function createNote(req, res, next) {
  const { title, content } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Tieu de khong duoc de trong' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title.trim(), (content || '').trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// Xoa ghi chu theo ID
async function deleteNote(req, res, next) {
  const noteId = parseInt(req.params.id, 10);
  if (isNaN(noteId)) {
    return res.status(400).json({ error: 'ID ghi chu phai la so nguyen hop le' });
  }

  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1', [noteId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Khong tim thay ghi chu de xoa' });
    }
    res.json({ success: true, message: 'Da xoa thanh cong' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotes,
  createNote,
  deleteNote
};
