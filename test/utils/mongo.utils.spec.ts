import { MongoConnector } from '../../src/utils/mongo.utils';

describe('MongoConnector', () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';

  beforeAll(async () => {
    await MongoConnector.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await MongoConnector.disconnect();
  });

  it('should connect to the database', async () => {
    const db = MongoConnector.getDatabase();
    expect(db).toBeDefined();
    expect(db.databaseName).toBe('monitoring'); // Assicurati che il nome del database sia corretto
  });

  it('should throw an error if not connected', () => {
    MongoConnector.disconnect(); // Disconnetti per testare l'errore
    expect(() => MongoConnector.getDatabase()).toThrowError('Database not initialized. Call connect first.');
  });
}); 