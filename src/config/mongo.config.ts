import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI!;

export const mongoClient = new MongoClient(MONGO_URI);