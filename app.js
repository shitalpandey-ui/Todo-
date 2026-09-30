const express = require('express');
const { pool } = require('./config/connectToDatabase');
const path = require('path');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 4000;


async function start() {
  await connectDB();
}

app.use(express.urlencoded({ extended: true }));
//middlewares
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
  res.send("Hello World");
});

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));



