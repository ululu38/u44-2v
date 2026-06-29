import { DrizzleService } from './src/infrastructure/db/connector.js';
import { MediaService } from './src/service/media.service.js';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    providers: [DrizzleService, MediaService],
  }).compile();

  const mediaService = moduleFixture.get<MediaService>(MediaService);

  // Test failing filename
  const filename = 'hcu-logo-d694cea2-6395-40ca-ad81-3ee6d8be07e6-mini.webp';
  const result = await mediaService.getFileBuffer(filename);
  
  if (result) {
    console.log("Success! Buffer size:", result.buffer.length);
  } else {
    console.log("Failed to find buffer for", filename);
  }

  // Also try what happens if we pass the full URL path from Nginx
  const filename2 = 'media/uploads/hcu-logo-d694cea2-6395-40ca-ad81-3ee6d8be07e6-mini.webp';
  const result2 = await mediaService.getFileBuffer(filename2);
  if (result2) {
    console.log("Success 2! Buffer size:", result2.buffer.length);
  } else {
    console.log("Failed 2 to find buffer for", filename2);
  }
}

bootstrap();
