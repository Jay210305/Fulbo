import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configureApp } from './app.bootstrap.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const logger = new Logger('Bootstrap');

  const port = app.get(ConfigService).get<number>('PORT', 4000);
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

void bootstrap();
