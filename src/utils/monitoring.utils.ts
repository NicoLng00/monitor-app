// src/utils/monitoring.utils.ts
import { Db } from 'mongodb';
import { QueryLogger } from './logger.utils';

interface MonitoringOptions {
  pollInterval?: number;
  operations?: string[];
  minDuration?: number;
}

export class MongoQueryWatcher {
  private lastTimestamp = new Date();
  private pollInterval: NodeJS.Timeout;

  constructor(
    private db: Db,
    private logger: QueryLogger,
    private options: MonitoringOptions = {}
  ) {
    this.options = {
      pollInterval: 2000,
      operations: ['query', 'insert', 'update', 'remove'],
      minDuration: 0,
      ...options
    };
  }

  startMonitoring(): void {
    this.pollInterval = setInterval(async () => {
      try {
        await this.pollQueries();
      } catch (error) {
        this.logger.logError(error as Error);
      }
    }, this.options.pollInterval);
  }

  stopMonitoring(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private async pollQueries(): Promise<void> {
    const queryFilter = {
      ts: { $gt: this.lastTimestamp },
      op: { $in: this.options.operations },
      millis: { $gte: this.options.minDuration }
    };

    const newQueries = await this.db.collection('system.profile')
      .find(queryFilter)
      .sort({ ts: 1 })
      .toArray();

    if (newQueries.length > 0) {
      newQueries.forEach(query => this.logQuery(query));
      this.lastTimestamp = newQueries[newQueries.length - 1].ts;
    }
  }

  private logQuery(query: any): void {
    const sanitizedQuery = {
      timestamp: query.ts,
      operation: query.op,
      namespace: query.ns,
      durationMs: query.millis,
      command: this.sanitizeCommand(query.command),
      planSummary: query.planSummary,
      keysExamined: query.keysExamined,
      docsExamined: query.docsExamined
    };

    this.logger.logQuery(sanitizedQuery);
  }

  private sanitizeCommand(command: any): any {
    // Rimuove dati sensibili da eventuali filtri
    const sensitiveKeys = ['password', 'token', 'creditCard'];
    const sanitized = { ...command };
    
    sensitiveKeys.forEach(key => {
      if (sanitized.filter && sanitized.filter[key]) {
        sanitized.filter[key] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }
}