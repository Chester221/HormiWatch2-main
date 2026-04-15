import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TrimPipe } from './pipes/trim.pipe';
import { QueryFailedFilter } from './common/filters/query-failed.filter';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose'], //logger
  });

  // static req
  app.set('trust proxy', true);

  // Use cookie-parser
  app.use(cookieParser());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('HormiWatch API')
    .setDescription('API endpoints and schemas')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true }, // Mantiene la sesión activa en Swagger UI
  });

  // Filters
  app.useGlobalFilters(new QueryFailedFilter());

  app.useGlobalPipes(new TrimPipe());

  // validators pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // set global api prefix
  app.setGlobalPrefix('api');

  // endpoint versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // cors config
  app.enableCors({
    origin: true, // Reflects the request origin, allowing all with credentials
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
