// src/utils/mongo.utils.ts
import { MongoClient, Db } from 'mongodb';
import { config } from '../config';

export class MongoConnector {
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  static async connect(uri: string) {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Using connection URI: ${uri}`);

    if (!this.client) {
      try {
        if (!uri) {
          throw new Error('MongoDB URI is not defined.');
        }
        this.client = new MongoClient(uri);
        await this.client.connect();
        this.db = this.client.db(config.mongo.dbName);
        console.log('Successfully connected to MongoDB.');
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error; // Rilancia l'errore dopo il log
      }
    } else {
      console.log('MongoDB client already initialized.');
    }
  }

  static getDatabase() {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect first.');
    }
    return this.db;
  }

  static async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB.');
      this.client = null;
      this.db = null;
    }
  }
}