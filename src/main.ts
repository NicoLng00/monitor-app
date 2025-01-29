// src/main.ts
import { MongoConnector } from './utils/mongo.utils';
import { QueryLogger } from './utils/logger.utils';
import { MongoQueryWatcher } from './utils/monitoring.utils';
import { config } from './config';

async function bootstrap() {
  try {
    // 1. Inizializza la connessione al database
    await MongoConnector.connect(config.mongo.uri, {
      appName: 'MongoDB Query Monitor',
      maxPoolSize: 5,
      minPoolSize: 1
    });

    // 2. Inizializza i componenti
    const logger = QueryLogger.getInstance();
    const watcher = new MongoQueryWatcher(
      MongoConnector.getDatabase(),
      logger,
      {
        pollInterval: 1500,
        minDuration: 100
      }
    );

    // 3. Avvia il monitoraggio
    watcher.startMonitoring();
    console.log('Monitoring system initialized');

    // 4. Gestione shutdown pulito
    process.on('SIGINT', async () => {
      console.log('\nStopping monitoring...');
      watcher.stopMonitoring();
      await MongoConnector.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to initialize monitoring:', error);
    process.exit(1);
  }
}

bootstrap();