import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ปิดการเสิร์ฟ Static Assets ของ NestJS เพื่อบังคับให้ใช้ Nginx แทน
  // รูปภาพจะถูกดึงผ่าน Nginx ที่ Port 8080 แทน Port 4000

  // เปิดใช้งาน Cookie Parser
  app.use(cookieParser());
  
  // เปิดใช้งาน CORS เพื่อให้ Frontend (Next.js) เรียกใช้งานได้
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // ตั้งค่า Swagger
  const config = new DocumentBuilder()
    .setTitle('U44Tech API')
    .setDescription('The U44Tech API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('tickets')
    .addTag('management')
    .addTag('posts')
    .addTag('categories')
    .addTag('partners')
    .addTag('gallery')
    .addTag('search')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(4000);
  console.log('🚀 Backend running on: http://localhost:4000');
}
bootstrap();
