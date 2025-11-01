import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Game Crawler Data Service')
    .setDescription('API documentation for Google Play crawler')
    .setVersion('1.0')
    .addTag('google-play')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);

  console.log('🚀 App running on: http://localhost:3000');
  console.log('📘 Swagger docs: http://localhost:3000/api/docs');
}
bootstrap();
