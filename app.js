const express = require('express');
const { pool } = require('./connectToDatabase');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 4000;


async function start() {
  await connectDB();
}
app.listen(PORT, () => console.log(`Server is running at ${PORT}`));



