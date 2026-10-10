const express = require('express');
const { pool } = require('../config/connectToDatabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const TASK_FIELDS = 'id, description AS title, completed';

// POST /api/tasks   body: { title }
router.post('/', async (req, res) => {
  try {
    const title = req.body.title?.trim();
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, description, completed)
       VALUES ($1, $2, $3)
       RETURNING ${TASK_FIELDS}`,
      [req.user.id, title, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create task error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${TASK_FIELDS} FROM tasks WHERE user_id = $1 ORDER BY id DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get tasks error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body.title?.trim() || null;
    const completed = typeof req.body.completed === 'boolean' ? req.body.completed : null;

    const result = await pool.query(
      `UPDATE tasks
       SET description = COALESCE($1, description),
           completed   = COALESCE($2, completed)
       WHERE id = $3 AND user_id = $4
       RETURNING ${TASK_FIELDS}`,
      [title, completed, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task updated', todo: result.rows[0] });
  } catch (err) {
    console.error('Update task error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;