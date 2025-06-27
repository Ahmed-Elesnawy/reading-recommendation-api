import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters';
import { LoggerService } from './logger/logger.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get logger service and set up global exception filter
  const loggerService = await app.resolve(LoggerService);
  app.useGlobalFilters(new GlobalExceptionFilter(loggerService));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw errors when non-whitelisted values are provided
      transformOptions: {
        enableImplicitConversion: true, // Automatically transform primitive types
      },
    }),
  );

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Reading List API')
    .setDescription('API for the Reading List application')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: '*', // TODO: change to the frontend url
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  await app.listen(port);
}

bootstrap();
