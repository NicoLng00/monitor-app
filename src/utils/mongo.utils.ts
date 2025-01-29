// src/utils/mongo.utils.ts
import { MongoClient, Db } from 'mongodb';

export class MongoConnector {
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  static async connect(uri: string, options: any) {
    if (!this.client) {
      this.client = new MongoClient(uri, options);
      await this.client.connect();
      this.db = this.client.db();
    }
  }

  static getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect first.');
    }
    return this.db;
  }

  static async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}