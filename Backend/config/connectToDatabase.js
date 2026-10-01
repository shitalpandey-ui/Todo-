// db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()')
    .then(() => console.log('Database Connected'))
    .catch((err) => console.error('Database connection failed:', err));

module.exports = { pool } ;