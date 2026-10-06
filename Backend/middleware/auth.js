const jwt = require('jsonwebtoken');
const { pool } = require('../config/connectToDatabase');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { protect };