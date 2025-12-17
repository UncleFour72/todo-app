import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add MONGODB_URI to Environment Variables');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  try {
    const database = (await clientPromise).db('todo-app');
    const collection = database.collection('todos');

    if (req.method === 'GET') {
      const todos = await collection.find({}).toArray();
      res.status(200).json(todos);
    } else if (req.method === 'POST') {
      const { text } = req.body;
      const result = await collection.insertOne({ text });
      res.status(201).json({ _id: result.insertedId, text });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};