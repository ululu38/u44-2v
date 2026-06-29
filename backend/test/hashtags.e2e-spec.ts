import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('HashtagsModule (e2e)', () => {
  let env: TestEnvironment;
  let adminToken: string;

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
      email: 'admin-tag@example.com',
      password: 'Password123!',
      name: 'Admin Tag',
    });
    await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin-tag@example.com'");
    
    const adminRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'admin-tag@example.com',
      password: 'Password123!',
    });
    adminToken = adminRes.body.access_token;
  });

  it('should create hashtag successfully (TC 31)', async () => {
    const res = await request(env.app.getHttpServer())
      .post('/hashtags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'NewTag',
      });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('NewTag');
  });

  it('should return conflict for duplicate hashtag (TC 32)', async () => {
    // 1st time
    await request(env.app.getHttpServer())
      .post('/hashtags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'DuplicateTag',
      });
    
    // 2nd time
    const res = await request(env.app.getHttpServer())
      .post('/hashtags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'DuplicateTag',
      });
    
    expect([400, 409]).toContain(res.status);
  });

  it('should list hashtags for autocomplete (TC 33)', async () => {
    await request(env.app.getHttpServer())
      .post('/hashtags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'AutoSearchTag',
      });

    const res = await request(env.app.getHttpServer())
      .get('/hashtags'); // or /hashtags?search=Auto
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t: any) => t.name === 'AutoSearchTag')).toBe(true);
  });

  it('should delete hashtag successfully (TC 34)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/hashtags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'ToDelete',
      });
    
    const tagId = createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .delete(`/hashtags/${tagId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect([200, 204]).toContain(res.status);
  });
});
