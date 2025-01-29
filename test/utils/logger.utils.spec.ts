import { QueryLogger } from '../../src/utils/logger.utils';

describe('QueryLogger', () => {
  let logger: QueryLogger;

  beforeAll(() => {
    logger = QueryLogger.getInstance();
  });

  it('should log a query', () => {
    const logSpy = jest.spyOn(logger, 'logQuery');
    const queryData = { operation: 'find', durationMs: 100 };
    
    logger.logQuery(queryData);
    
    expect(logSpy).toHaveBeenCalledWith(queryData);
  });

  it('should log an error', () => {
    const logSpy = jest.spyOn(logger, 'logError');
    const error = new Error('Test error');
    
    logger.logError(error);
    
    expect(logSpy).toHaveBeenCalledWith(error);
  });
}); 