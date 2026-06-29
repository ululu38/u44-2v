import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AllExceptionsFilter } from './interface/filter/all-exceptions.filter.js';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './domain/entities/user.entity.js';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // ปิดการเสิร์ฟ Static Assets ของ NestJS เพื่อบังคับให้ใช้ Nginx แทน
  // รูปภาพจะถูกดึงผ่าน Nginx ที่ Port 8080 แทน Port 4000

  // เปิดใช้งาน Cookie Parser
  app.use(cookieParser());
  
  // เปิดใช้งาน Helmet ป้องกัน HTTP Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
  
  // เปิดใช้งาน Global Exception Filter — ป้องกัน DB errors/stack traces รั่วออก
  app.useGlobalFilters(new AllExceptionsFilter());

  // เปิดใช้งาน Validation Pipe ทั่วทั้งระบบ
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // เปิดใช้งาน CORS เพื่อให้ Frontend (Next.js) เรียกใช้งานได้
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    credentials: true,
  });

  // Protect Swagger route
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['access_token'];
    if (!token) {
      return res.status(401).send('Unauthorized: You must be logged in as an admin to view the API documentation.');
    }
    try {
      const jwtService = app.get(JwtService);
      const payload = jwtService.verify(token);
      if (payload.role !== UserRole.ADMIN) {
        return res.status(403).send('Forbidden: Only administrators can view the API documentation.');
      }
      next();
    } catch (e) {
      return res.status(401).send('Unauthorized: Invalid or expired token.');
    }
  });

  // ตั้งค่า Swagger
  const config = new DocumentBuilder()
    .setTitle('U44Tech API')
    .setDescription('The U44Tech API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('tickets')
    .addTag('posts')
    .addTag('partners')
    .addTag('media')
    .addTag('hashtags')
    .addTag('client-groups')
    .addTag('clients')
    .addTag('banners')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(4000);
  console.log('🚀 Backend running on: http://localhost:4000');
}
bootstrap();
