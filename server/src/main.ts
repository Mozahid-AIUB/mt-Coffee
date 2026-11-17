
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error('FRONTEND_URL is missing from the .env file.');
  }

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

 
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    errorHttpStatusCode: 422,
    exceptionFactory: (errors) => {
      const formattedErrors: Record<string, string> = {};

      for (const error of errors) {
        const constraints = error.constraints;

        if (constraints) {
          formattedErrors[error.property] =
            constraints.isNotEmpty ?? Object.values(constraints)[0];
        }
      }

      return new UnprocessableEntityException({
        success: false,
        message: 'Validation failed.',
        errors: formattedErrors,
      });
    },
  }),
);

const config = new DocumentBuilder()
  .setTitle('Manush Tech Lunch & Snacks Management API')
  .setDescription(
    'API documentation for the Manush Tech Lunch & Snacks Management System.',
  )
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('docs', app, document, {
  useGlobalPrefix: true,
});
  await app.listen(process.env.PORT ?? 4000);

  console.log(`Backend is running at: http://localhost:4000/api`);
}

bootstrap();
