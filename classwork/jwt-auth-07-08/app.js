require('dotenv').config();
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;

const bodyParser = require('body-parser');
app.use(express.json());

const filePath = path.join(__dirname, 'users.json');

if (!fs.existsSync(filePath)) {
  fs.writeFileSync('users.json', JSON.stringify([]));
}

app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(filePath));
  const user = users.find((item) => item.email === email);
  if (user) {
    return res.status(409).json({ message: 'User already exist' });
  }

  crypto.pbkdf2(password, 'salt', 10, 32, 'sha512', (err, key) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Something went wrong during password hashing' });
    }
    const hashedPassword = key.toString('hex');
    users.push({ email, hashedPassword });
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    return res.status(201).json({ mssage: 'User created successfully' });
  });
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(filePath));
  crypto.pbkdf2(password, 'salt', 10, 32, 'sha512', (err, key) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Something went wrong during password hashing' });
    }
    const hashedPassword = key.toString('hex');

    const user = users.find((item) => {
      return item.email === email && item.hashedPassword === hashedPassword;
    });

    if (!user) {
      res.status(400).json({ message: 'User not found' });
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: 60 });
    return res.json({ token });
  });
});

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization required' });
  }
  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      req.user = user;
      console.log(user);
      next();
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
app.get('/protected', auth, (req, res) => {
  res.json({ message: `Welcome to your account ${req.user.email}` });
});
app.listen(PORT, () => {
  console.log(`Server runing on http://localhost:${PORT}`);
});
