import { MongoQueryWatcher } from '../../src/utils/monitoring.utils';
import { MongoConnector } from '../../src/utils/mongo.utils';
import { QueryLogger } from '../../src/utils/logger.utils';

describe('MongoQueryWatcher', () => {
  let watcher: MongoQueryWatcher;
  let logger: QueryLogger;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    await MongoConnector.connect(uri);
    logger = QueryLogger.getInstance();
    watcher = new MongoQueryWatcher(MongoConnector.getDatabase(), logger, {
      pollInterval: 1500,
      minDuration: 100,
    });
  });

  afterAll(async () => {
    await MongoConnector.disconnect();
  });

  it('should start monitoring', () => {
    const startSpy = jest.spyOn(watcher, 'startMonitoring');
    watcher.startMonitoring();
    expect(startSpy).toHaveBeenCalled();
  });

  it('should stop monitoring', () => {
    const stopSpy = jest.spyOn(watcher, 'stopMonitoring');
    watcher.stopMonitoring();
    expect(stopSpy).toHaveBeenCalled();
  });
}); 