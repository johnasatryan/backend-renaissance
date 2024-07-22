const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function createDb() {
  await client.connect();

  try {
    const adminDb = client.db('admin');
    await adminDb.command({
      createUser: 'admin',
      pwd: 'password',
      roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }],
    });
  } finally {
    client.close();
  }
}

// createDb().catch(console.log);
async function run() {
  await client.connect();
  try {
    const adminDb = client.db('school');
    const students = adminDb.collection('students');

    await students.insertMany([
      { name: 'Bob', age: 21, grade: 'A' },
      { name: 'James', age: 20, grade: 'B' },
      { name: 'Ann', age: 19, grade: 'C' },
      { name: 'Charlie', age: 21, grade: 'A' },
      { name: 'Suzan', age: 21, grade: 'A' },
    ]);

    const getStudents = await students
      .aggregate([{ $group: { _id: null, ages: { $avg: '$age' } } }])
      .toArray();
    console.log(getStudents);
  } finally {
    client.close();
  }
}

run().catch(console.log);
