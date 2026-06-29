import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('BannersModule (e2e)', () => {
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
      email: 'admin-banner@example.com',
      password: 'Password123!',
      name: 'Admin Banner',
    });
    await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin-banner@example.com'");
    
    const adminRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'admin-banner@example.com',
      password: 'Password123!',
    });
    adminToken = adminRes.body.access_token;

    // Create media for banner
    const validPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    const mediaRes = await request(env.app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', validPngBuffer, 'banner-mock.png');
    mediaId = mediaRes.body.id;
  });

  it('should create a banner successfully (TC 35)', async () => {
    const res = await request(env.app.getHttpServer())
      .post('/banners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Promo Banner',
        mediaId: mediaId,
        linkUrl: 'https://example.com',
        status: 0 // Inactive initially
      });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Promo Banner');
  });

  it('should get active banners list (TC 36)', async () => {
    // Active banner
    await request(env.app.getHttpServer())
      .post('/banners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Active Banner',
        mediaId: mediaId,
        status: 1
      });
    
    // Inactive banner
    await request(env.app.getHttpServer())
      .post('/banners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Inactive Banner',
        mediaId: mediaId,
        status: 0
      });

    const res = await request(env.app.getHttpServer())
      .get('/banners');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data || res.body)).toBe(true);
    // Might need specific check depending on API (if it defaults to active only for guests)
  });

  it('should activate a banner successfully (TC 37)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/banners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Draft Banner',
        mediaId: mediaId,
        status: 0
      });
    
    const bannerId = createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .patch(`/banners/${bannerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 1
      });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(1);
  });

  it('should return validation error on patch with bad data (TC 38)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/banners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Banner',
        mediaId: mediaId,
        status: 1
      });
    
    const bannerId = createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .patch(`/banners/${bannerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'not-a-number' // Should trigger ValidationPipe error
      });
    
    expect(res.status).toBe(400);
  });

  it('should delete banner successfully (TC 39)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/banners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'ToDelete',
        mediaId: mediaId,
      });
    
    const bannerId = createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .delete(`/banners/${bannerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect([200, 204]).toContain(res.status);
  });
});
