const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/connectToDatabase');
const { protect } = require('../middleware/auth'); 


const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', 
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
 
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Name, email, password and confirm password are required',
      });
    }
 
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
 
    // 3. Reject duplicate emails
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
 
    // 4. Create the user 
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
 
    // 5. Log the user in right away
    const token = generateToken(newUser.rows[0].id);
    res.cookie('token', token, cookieOptions);
 
    return res.status(201).json({ user: newUser.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide the email and password' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userData = result.rows[0];
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(userData.id);
    res.cookie('token', token, cookieOptions);

    return res.json({
      user: { id: userData.id, name: userData.name, email: userData.email },
    });
  } catch (err) {
  console.error('Login error:', err);
  return res.status(500).json({ message: err.message }); 
}
});

// GET /api/auth/me  (req.user is set by the protect middleware)
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;