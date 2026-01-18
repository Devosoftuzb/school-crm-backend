import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const start = async () => {
  try {
    const app = await NestFactory.create(AppModule, { cors: true });

    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const PORT = process.env.API_PORT || 9999;

    app.use(cookieParser());

    app.use((req, res, next) => {
      const startTime = Date.now();
      res.on('finish', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        console.log(
          `${req.method} ${req.originalUrl} ${res.statusCode}, ${responseTime}ms`,
        );
      });
      next();
    });

    app.setGlobalPrefix('api');

    app.enableVersioning({
      type: VersioningType.URI,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        // whitelist: true,
        // forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('EDU CRM')
      .setDescription('EDU CRM API Documentation')
      .setVersion('7.3.1')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    await app.listen(PORT);
    console.log(`🚀 Server started on port: ${PORT}`);
  } catch (err) {
    console.error('❌ Server start error:', err);
    process.exit(1);
  }
};

start();
