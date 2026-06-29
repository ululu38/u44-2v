import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TestDatabaseManager } from './test-container.util';

export async function setupE2EApp(): Promise<INestApplication> {
  // Container logic is handled here or in jest global hooks
  await TestDatabaseManager.startContainer();
  
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  
  // Apply the same global pipes as main.ts
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  await app.init();
  return app;
}

export async function teardownE2EApp(app: INestApplication) {
  if (app) {
    await app.close();
  }
}
