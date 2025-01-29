// src/main.ts
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { SwaggerConfig } from './config/swagger.config';
import { createValidationPipe } from './utils/validation.util';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'X-TENANT'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configurazione Swagger
  SwaggerConfig.setup(app);

  // Util per validazione dei dati in ingresso
  app.useGlobalPipes(createValidationPipe());


  await app.listen(4002);
  console.log('Application is running on: http://localhost:4002');
}

bootstrap();