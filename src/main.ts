import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    transform: true, // Transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw errors when non-whitelisted values are provided
    transformOptions: {
      enableImplicitConversion: true, // Automatically transform primitive types
    },
  }));

  await app.listen(3000);
}
bootstrap();
