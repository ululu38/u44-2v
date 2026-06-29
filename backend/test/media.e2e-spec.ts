import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('MediaModule (e2e)', () => {
  let env: TestEnvironment;
  let adminToken: string;
  let mediaId: number;

  beforeAll(async () => {
    env = new TestEnvironment();
    await env.start();
  }, 60000);

  afterAll(async () => {
    await env.stop();
  });

  afterEach(async () => {
    await env.wipeDatabase();
  });

  beforeEach(async () => {
    await request(env.app.getHttpServer()).post('/auth/register').send({
      email: 'admin-media@example.com',
      password: 'Password123!',
      name: 'Admin Media',
    });
    await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin-media@example.com'");
    
    const adminRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'admin-media@example.com',
      password: 'Password123!',
    });
    adminToken = adminRes.body.access_token;
  });

  // Create a tiny valid PNG buffer
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  it('should upload valid image successfully (TC 27)', async () => {
    const res = await request(env.app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', validPngBuffer, 'test.png');
    
    expect(res.status).toBe(201);
    expect(res.body.urlFull).toBeDefined();
    mediaId = res.body.id;
  });

  it('should reject invalid file type (TC 28)', async () => {
    const invalidBuffer = Buffer.from('echo "hello"', 'utf-8');
    const res = await request(env.app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', invalidBuffer, 'script.sh');
    
    expect(res.status).toBe(400);
  });

  it('should reject file exceeding size limit (TC 29)', async () => {
    // Generate a 6MB buffer (assuming limit is 5MB)
    const hugeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a');
    const res = await request(env.app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', hugeBuffer, 'huge.png');
    
    expect([413, 400]).toContain(res.status);
  });

  it('should delete media successfully (TC 30)', async () => {
    // First upload to have a valid ID
    const uploadRes = await request(env.app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', validPngBuffer, 'to-delete.png');
    
    const idToDelete = uploadRes.body.id;

    const res = await request(env.app.getHttpServer())
      .delete(`/media/${idToDelete}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect([200, 204]).toContain(res.status);
  });
});
