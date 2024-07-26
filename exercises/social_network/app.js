require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const app = express();
const connectDb = require('./config/db');

connectDb()
  .then(() => {})
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is runing on http://localhost:${PORT}`);
});
