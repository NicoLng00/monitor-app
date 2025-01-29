import { MongoClient, Db } from 'mongodb';

export class MongoConnector {
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  static async connect(connection: { uri: string; dbName: string; authSource?: string; }) {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Using connection URI: ${connection.uri}`);

    if (!this.client) {
      try {
        if (!connection.uri) {
          throw new Error('MongoDB URI is not defined.');
        }
        this.client = new MongoClient(connection.uri, {
          authSource: connection.authSource,
        });
        await this.client.connect();
        this.db = this.client.db(connection.dbName);
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
