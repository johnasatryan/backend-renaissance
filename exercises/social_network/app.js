require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const app = express();
app.use(express.json());
// const connectDb = require('./config/db');

const client = new MongoClient(MONGO_URI);
let db;
let usersCollection;

client
  .connect()
  .then(() => {
    console.log('Connected MongoDB');
    db = client.db('library');

    usersCollection = db.collection('users');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Fields are required' });
  }
  usersCollection
    .findOne({ email })
    .then((result) => {
      if (result) {
        return res.status(409).json({ message: 'User already exist' });
      }
      crypto.pbkdf2(
        password,
        'salt',
        6,
        20,
        'sha512',
        (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ message: 'Internal server error' });
          }
          usersCollection
            .insertOne({
              email,
              password: hashedPassword.toString('hex'),
            })
            .then((result) => {
              return res.status(201).json({ id: result.insertedId });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).json({ message: 'Internal server error' });
            });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Fields are required' });
  }
  usersCollection.findOne({ email }).then((result) => {
    crypto.pbkdf2(password, 'salt', 6, 21, 'sha512', (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (result.password !== hashedPassword.toString('hex')) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      return res.status(200).json({ id: result._id });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is runing on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Server is down...');
  client
    .close()
    .then(() => {
      console.log('Disconnected MongoDB');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});
