import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {

  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useStaticAssets(
    join(process.cwd(), 'public'),
  );

  app.enableCors();


  // =========================
  // Swagger
  // =========================

  const config =
    new DocumentBuilder()
      .setTitle('Octane Academic Management System')
      .setDescription(
        'API documentation for Octane Academic Management System',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .build();


  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );


  SwaggerModule.setup(
    'api',
    app,
    document,
  );


  await app.listen(3000);


  console.log(
    'Server: http://localhost:3000',
  );

  console.log(
    'Swagger: http://localhost:3000/api',
  );
}

bootstrap();