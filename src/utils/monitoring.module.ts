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

      const connectionString = process.env.MONGO_URI;
      
      if (!connectionString) {
        throw new Error('MongoDB URI undefined');
      }

      await MongoConnector.connect(connectionString);

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
