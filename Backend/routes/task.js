const express = require('express');
const { pool } = require('../config/connectToDatabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require login
router.use(protect);

// Create a task
router.post('/', async (req, res) => {
  try {
    const { description, completed } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    const updateTodo = await pool.query(
      'INSERT INTO tasks (user_id, description, completed) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, description, completed || false]
    );
    res.status(201).json(updateTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get the logged-in user's tasks
router.get('/', async (req, res) => {
  try {
    const updateTodo = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY id',
      [req.user.id]
    );
    res.json(updateTodo.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;
    const updatedTodo = await pool.query(
      'UPDATE tasks SET description = $1, completed = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [description, completed, id, req.user.id]
    );
    if (updatedTodo.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({
        message: "Todo was updated!",
        todo: updatedTodo.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    
    );
     res.json("Task was deleted! ");

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;