// src/utils/logger.utils.ts
import { createLogger, transports, format, Logger } from 'winston';
import { Format } from 'logform';

export class QueryLogger {
  private logger: Logger;
  private static instance: QueryLogger;

  private constructor() {
    this.logger = createLogger({
      level: 'info',
      format: this.getLogFormat(),
      transports: this.getTransports()
    });
  }

  static getInstance(): QueryLogger {
    if (!QueryLogger.instance) {
      QueryLogger.instance = new QueryLogger();
    }
    return QueryLogger.instance;
  }

  private getLogFormat(): Format {
    return format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    );
  }

  private getTransports() {
    return [
      new transports.File({ 
        filename: 'logs/query.log',
        maxsize: 5 * 1024 * 1024 // 5MB
      }),
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      })
    ];
  }

  logQuery(data: object): void {
    this.logger.info(data);
  }

  logError(error: Error): void {
    this.logger.error(error);
  }
}