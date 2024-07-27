require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');


const app = express();
app.use(express.json());
// const connectDb = require('./config/db');

async function connectDB() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Mongodb connected with async function');
  } catch (err) {
    console.error(err);
    process.exit();
  }
  return client;
}

const client = connectDB();

client.then((result) => {
  const db = result.db('library');
  const booksCollection = db.collection('books');

  app.post('/books', async (req, res) => {
    const book = req.body;

    Object.keys(book).forEach((item) => {
      if (!book[item]) {
        return res.status(400).json({ message: `${item} field is required` });
      }
    });

    try {
      const id = (await booksCollection.insertOne(book)).insertedId;
      return res.status(201).json({ id });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/books/:id', async (req, res) => {
    const _id = new ObjectId(req.params.id);
    const updatedBook = req.body;
    try {
      const updatedValue = await booksCollection.replaceOne(
        { _id },
        updatedBook
      );
      return res.status(200).json({ updatedValue });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/books/:id', async (req, res) => {
    const _id = new ObjectId(req.params.id);
    const updatedField = req.body;
    try {
      const updatedValue = await booksCollection.updateOne(
        { _id },
        { $set: updatedField }
      );
      return res.status(200).json({ updatedValue });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
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
});
