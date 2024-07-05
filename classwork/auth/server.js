const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT;
const app = express();

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).send('Authentication required');
  }
  const authentication = Buffer.from(
    authHeader.split(' ')[1],
    'base64'
  ).toString();
  const [username, password] = authentication.split(':');
  if (username === 'admin' && password === 'password') {
    return next();
  }
  res.status(401).send('Invalid credentials');
};

app.get('/', auth, (req, res) => {
  res.status(200).send('Welcome to our page');
});
app.listen(PORT, () => {
  console.log(`Server runing on http://localhost:${PORT}`);
});
