require('dotenv').config(); 


const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { pool } = require('./config/connectToDatabase');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task.js');

//const result = require('dotenv').config();
//console.log('dotenv:', result.error ? result.error.message : Object.keys(result.parsed));

const app = express();
const PORT = process.env.PORT || 4000; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));




