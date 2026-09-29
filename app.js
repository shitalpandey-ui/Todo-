const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));



