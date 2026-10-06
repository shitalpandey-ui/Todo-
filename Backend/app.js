const express = require('express');
const cors = require('cors');
const { pool } = require('./config/connectToDatabase');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes  = require('./routes/auth');
const taskRoutes  = require('./routes/task.js');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 8000;


async function start() {
  await connectDB();
}

app.use(express.urlencoded({ extended: true }));

//middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));




