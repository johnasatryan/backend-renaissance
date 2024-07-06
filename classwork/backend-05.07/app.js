require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const bodyParser = require('body-parser');
const usersFile = 'users.json';

const generateKEY = () => {
  const Key = crypto.randomBytes(32).toString('hex');
  return Key;
};

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

const auth = (req, res, next) => {
  const authHeader = req.headers['chlp']; // x-api-key

  if (!authHeader) {
    return res.status(401).json({ message: 'API key required' });
  }

  if (
    authHeader ===
    '2e309c864aeaf21c968d28ced362d6e76740109d9bd3d7a6180f687f692943d3'
  ) {
    return next();
  }
  res.status(401).json({ message: 'Invalid key' });
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile));
  const isUser = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!isUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  const key = generateKEY();
  res.status(200).json({ key: key });
});

app.get('/protected', auth, (req, res) => {
  res.status(200).json({ message: 'Protected Route' });
});

app.listen(PORT, () => {
  console.log(`Server runing on http://localhost${PORT}`);
});
