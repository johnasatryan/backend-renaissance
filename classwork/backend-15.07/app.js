require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
app.use(express.json());
const cors = require('cors');
app.use(cors());
const filePath = path.join(__dirname, 'users.json');
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

const blackList = new Set();

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (blackList.has(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  jwt.verify(token, SECRET_KEY, (err, data) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = data.username;
    next();
  });
};

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Fields required' });
  }
  const users = JSON.parse(fs.readFileSync(filePath));
  let existUser = users.find((u) => u.username === username);
  if (existUser) {
    return res.status(400).json({ message: 'User already exist' });
  }
  users.push({ username, password });

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  res.status(201).json({ message: 'User created successfully' });
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Fields required' });
  }
  const users = JSON.parse(fs.readFileSync(filePath));
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, {
    expiresIn: 60 * 60,
  });
  res.status(200).json({ token });
});
app.get('/profile', auth, (req, res) => {
  const user = req.user;
  res.status(200).json({ message: `Welcome ${user}` });
});
app.post('/logout', (req, res) => {
  blackList.add(req.headers['authorization'].split(' ')[1]);
  res.status(200).json({ message: 'Logged out' });
});

app.listen(PORT, () => {
  console.log(`Server runing on ${PORT}`);
});
