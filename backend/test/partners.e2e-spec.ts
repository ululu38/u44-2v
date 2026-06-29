import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('PartnersModule (e2e)', () => {
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
      email: 'admin-partner@example.com',
      password: 'Password123!',
      name: 'Admin Partner',
    });
    await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin-partner@example.com'");
    
    const adminRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'admin-partner@example.com',
      password: 'Password123!',
    });
    adminToken = adminRes.body.access_token;

    const validPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    const mediaRes = await request(env.app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', validPngBuffer, 'partner-logo.png');
    mediaId = mediaRes.body.id;
  });

  it('should create partner successfully (TC 40)', async () => {
    const res = await request(env.app.getHttpServer())
      .post('/partners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Tech Corp',
        logoMediaId: mediaId,
        description: 'A tech partner'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Tech Corp');
  });

  it('should list partners (TC 41)', async () => {
    await request(env.app.getHttpServer())
      .post('/partners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'List Partner',
      });

    const res = await request(env.app.getHttpServer())
      .get('/partners');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data || res.body)).toBe(true);
  });

  it('should edit partner data (TC 42)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/partners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Old Name',
      });
    
    const partnerId = createRes.body.partnerId || createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .patch(`/partners/${partnerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Name',
      });
    
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
  });

  it('should delete partner successfully (TC 43)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/partners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'ToDelete',
      });
    
    const partnerId = createRes.body.partnerId || createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .delete(`/partners/${partnerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect([200, 204]).toContain(res.status);
  });
});
