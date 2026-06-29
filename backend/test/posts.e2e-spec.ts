import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('PostsModule (e2e)', () => {
  let env: TestEnvironment;
  let adminToken: string;
  let userToken: string;

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
    // Setup Admin and User
    await request(env.app.getHttpServer()).post('/auth/register').send({
      email: 'admin-post@example.com',
      password: 'Password123!',
      name: 'Admin Post User',
    });
    await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin-post@example.com'");
    const adminRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'admin-post@example.com',
      password: 'Password123!',
    });
    adminToken = adminRes.body.access_token;

    await request(env.app.getHttpServer()).post('/auth/register').send({
      email: 'user-post@example.com',
      password: 'Password123!',
      name: 'Normal Post User',
    });
    const userRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'user-post@example.com',
      password: 'Password123!',
    });
    userToken = userRes.body.access_token;
  });

  describe('/posts (POST)', () => {
    it('should create post successfully (TC 16)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Post',
          contentHtml: '<p>Test</p>',
          contentText: 'Test',
        });
      
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Post');
    });

    it('should create post with hashtags successfully (TC 17)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Hashtag Post',
          contentHtml: '<p>Content</p>',
          contentText: 'Content',
          tags: ['Tech', 'News'],
        });
      
      expect(res.status).toBe(201);
      expect(res.body.tags).toContain('Tech');
    });

    it('should fail if missing title (TC 18)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contentHtml: '<p>Content</p>',
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('/posts (GET)', () => {
    beforeEach(async () => {
      // Seed posts
      for (let i = 1; i <= 15; i++) {
        await request(env.app.getHttpServer())
          .post('/posts')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: `Seeded Post ${i}`,
            contentHtml: `<p>Content ${i}</p>`,
            contentText: `Content ${i}`,
            tags: i % 2 === 0 ? ['Even'] : ['Odd'],
          });
      }
    });

    it('should get posts with pagination (TC 19)', async () => {
      const res = await request(env.app.getHttpServer())
        .get('/posts?page=1&limit=10');
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(10);
      expect(res.body.meta.total).toBe(15);
    });

    it('should get posts by keyword search (TC 20)', async () => {
      const res = await request(env.app.getHttpServer())
        .get('/posts?search=Seeded Post 5');
      
      expect(res.status).toBe(200);
      expect(res.body.data.some((p: any) => p.title.includes('5'))).toBe(true);
    });

    it('should get posts filtered by hashtag (TC 21)', async () => {
      const res = await request(env.app.getHttpServer())
        .get('/posts?tag=Even');
      
      expect(res.status).toBe(200);
      // All posts should have Even tag
      expect(res.body.data.every((p: any) => p.tags.includes('Even'))).toBe(true);
    });
  });

  describe('/posts/:id (GET, PATCH, DELETE)', () => {
    let postId: number;

    beforeEach(async () => {
      const createRes = await request(env.app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Target Post',
          contentHtml: '<p>Target Content</p>',
          contentText: 'Target Content',
        });
      postId = createRes.body.postId || createRes.body.id;
    });

    it('should get post by ID (TC 22)', async () => {
      const res = await request(env.app.getHttpServer())
        .get(`/posts/${postId}`);
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Target Post');
    });

    it('should return 404 for non-existing post ID (TC 23)', async () => {
      const res = await request(env.app.getHttpServer())
        .get(`/posts/999999`);
      
      expect(res.status).toBe(404);
    });

    it('should patch post successfully (TC 24)', async () => {
      const res = await request(env.app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Patched Post',
        });
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Patched Post');
    });

    it('should forbid non-owner non-admin to patch post (TC 25)', async () => {
      const res = await request(env.app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Hacked Post',
        });
      
      expect(res.status).toBe(403);
    });

    it('should delete post successfully (TC 26)', async () => {
      const res = await request(env.app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 204]).toContain(res.status);

      const fetchRes = await request(env.app.getHttpServer())
        .get(`/posts/${postId}`);
      
      expect(fetchRes.status).toBe(404);
    });
  });
});
