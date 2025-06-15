import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('PR Explainer Bot API')
    .setDescription('API for analyzing GitHub pull requests and providing summaries with risk assessments')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  const host = '0.0.0.0';
  const port = process.env.PORT ?? 3000;
  await app.listen(port, host);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation: http://${host}:${port}/api`);
}

bootstrap().catch(console.error);
