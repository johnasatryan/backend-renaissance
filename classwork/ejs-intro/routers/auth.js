require('dotenv').config();

const express = require('express');
const authRouter = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const usersList = path.join(__dirname, '../model', 'users.json');

authRouter.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersList));

  if (username && email && password) {
    const existUser = users.find((u) => u.email === email);

    if (existUser) {
      return res.status(409).json({ message: 'User already exist' });
    }
    users.push({ username, email, password });
    fs.writeFileSync(usersList, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'User successfuly added' });
  }
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersList));

  console.log(email, password);
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ email: user.email }, SECRET_KEY, {
    expiresIn: 60 * 60,
  });

  res.status(200).json({ token });
});

module.exports = authRouter;
