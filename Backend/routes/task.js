const express = require('express');
const { pool } = require('../config/connectToDatabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const TASK_FIELDS = `
  id,
  description AS title,
  completed,
  due_date AS "dueDate",
  due_time AS "dueTime",
  priority,
  category,
  tags,
  created_at AS "createdAt"
`;

const PRIORITIES = ['low', 'medium', 'high'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

const cleanTags = (tags) =>
  Array.isArray(tags)
    ? [...new Set(tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))]
    : null;

 function validateOptional({ dueDate, dueTime, priority, category, tags }) {
  if (dueDate !== undefined && dueDate !== '' && !DATE_RE.test(dueDate)) return 'Invalid due date';
  if (dueTime !== undefined && dueTime !== '' && !TIME_RE.test(dueTime)) return 'Invalid due time';
  if (priority !== undefined && !PRIORITIES.includes(priority)) return 'Invalid priority';
  if (category !== undefined && (typeof category !== 'string' || category.length > 100)) return 'Invalid list name';
  if (tags !== undefined && !Array.isArray(tags)) return 'Tags must be a list';
  return null;
}


// POST /api/tasks   body: { title, dueDate?, dueTime?, priority?, category?, tags? }
router.post('/', async (req, res) => {
  try {
    const title = req.body.title?.trim();
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const invalid = validateOptional(req.body);
    if (invalid) return res.status(400).json({ message: invalid });

    const {
      dueDate = '',
      dueTime = '',
      priority = 'medium',
      category = '',
    } = req.body;
    const tags = cleanTags(req.body.tags) || [];

    const result = await pool.query(
      `INSERT INTO tasks (user_id, description, completed, due_date, due_time, priority, category, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING ${TASK_FIELDS}`,
      [req.user.id, title, false, dueDate, dueTime, priority, category.trim(), JSON.stringify(tags)]
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

// PUT /api/tasks/:id   body: any of the fields above, plus completed
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const invalid = validateOptional(req.body);
    if (invalid) return res.status(400).json({ message: invalid });

    // null means "leave unchanged" (COALESCE); "" is a real value that clears a field
    const title = req.body.title?.trim() || null;
    const completed = typeof req.body.completed === 'boolean' ? req.body.completed : null;
    const dueDate = req.body.dueDate ?? null;
    const dueTime = req.body.dueTime ?? null;
    const priority = req.body.priority ?? null;
    const category = req.body.category?.trim() ?? null;
    const tags = cleanTags(req.body.tags);

    const result = await pool.query(
      `UPDATE tasks
       SET description = COALESCE($1, description),
           completed   = COALESCE($2, completed),
           due_date    = COALESCE($3, due_date),
           due_time    = COALESCE($4, due_time),
           priority    = COALESCE($5, priority),
           category    = COALESCE($6, category),
           tags        = COALESCE($7::jsonb, tags)
       WHERE id = $8 AND user_id = $9
       RETURNING ${TASK_FIELDS}`,
      [
        title,
        completed,
        dueDate,
        dueTime,
        priority,
        category,
        tags ? JSON.stringify(tags) : null,
        id,
        req.user.id,
      ]
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