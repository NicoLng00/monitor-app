import { MongoConnector } from './mongo.utils';
import { QueryLogger } from './logger.utils';
import { MongoQueryWatcher } from './monitoring.utils';
import * as dotenv from 'dotenv';

dotenv.config();
export class MonitoringModule {
  private logger: QueryLogger;
  private watcher: MongoQueryWatcher;

  async initialize() {
    try {
      const uri = process.env.MONGO_URI;
      const dbName = process.env.MONGO_DB;

      if (!uri) {
        throw new Error('MongoDB URI is undefined');
      }

      if (!dbName) {
        throw new Error('MongoDB database name is undefined');
      }

      const connection = {
        uri: uri,
        dbName: dbName,
        authSource: "admin",
        autoIndex: true,
      };

      await MongoConnector.connect(connection);

      this.logger = QueryLogger.getInstance();
      this.watcher = new MongoQueryWatcher(
        MongoConnector.getDatabase(),
        this.logger,
        {
          pollInterval: 1500,
          minDuration: 100
        }
      );

      // Avvia il monitoraggio
      this.watcher.startMonitoring();
      console.log('Monitoring system initialized');

      // Gestione shutdown pulito
      process.on('SIGINT', async () => {
        console.log('\nStopping monitoring...');
        this.watcher.stopMonitoring();
        await MongoConnector.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      process.exit(1);
    }
  }
}
