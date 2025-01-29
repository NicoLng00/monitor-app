// src/main.ts
import * as dotenv from 'dotenv';
import { MonitoringModule } from './utils/monitoring.module';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const monitoringModule = new MonitoringModule();
  await monitoringModule.initialize();

  await app.listen(5000);
  console.log('Application is running on: http://localhost:5000');
}

bootstrap();