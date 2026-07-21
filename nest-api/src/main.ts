import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toLaravelValidationErrors } from './common/validation/laravel-validation';
import { LaravelExceptionFilter } from './common/filters/laravel-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('port');

  // Serve static files like Laravel's storage/public
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/storage',
  });

  // Enable CORS for the specified origins
  const corsOrigins = configService.get('cors.origins') as string[];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  // Set the global prefix (same as Laravel's /api)
  app.setGlobalPrefix('api');

  // Use global exception filter
  app.useGlobalFilters(new LaravelExceptionFilter());

  // Set up validation pipe with Laravel-like error format
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new UnprocessableEntityException({
          success: false,
          message: 'The given data was invalid.',
          errors: toLaravelValidationErrors(errors),
        }),
    }),
  );

  await app.listen(port);
  console.log(`🚀 NestJS API listening on http://localhost:${port}/api`);
}

bootstrap();
