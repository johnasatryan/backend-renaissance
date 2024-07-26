const { MongoClient } = require('mongodb');
const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI);

const connectDB = () => {
  return client
    .connect()
    .then(() => {
      console.log('Connected to MongoDB');
      return client.db('soicalNetwork');
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectDB;
