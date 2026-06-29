import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('UsersModule (e2e)', () => {
  let env: TestEnvironment;

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

  describe('/users (GET)', () => {
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
      // Create admin user
      await request(env.app.getHttpServer()).post('/auth/register').send({
        email: 'admin@example.com',
        password: 'Password123!',
        name: 'Admin User',
      });
      // Mock db change to make them admin (since register usually creates standard users)
      await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com'");
      
      const adminLogin = await request(env.app.getHttpServer()).post('/auth/login').send({
        email: 'admin@example.com',
        password: 'Password123!',
      });
      adminToken = adminLogin.body.access_token;

      // Create normal user
      await request(env.app.getHttpServer()).post('/auth/register').send({
        email: 'user@example.com',
        password: 'Password123!',
        name: 'Normal User',
      });
      
      const userLogin = await request(env.app.getHttpServer()).post('/auth/login').send({
        email: 'user@example.com',
        password: 'Password123!',
      });
      userToken = userLogin.body.access_token;
    });

    it('Admin gets all users list (TC 9)', async () => {
      const res = await request(env.app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data || res.body)).toBe(true);
    });

    it('Normal user getting users list receives Forbidden (TC 10)', async () => {
      const res = await request(env.app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
    });
  });

  describe('/users/:id (GET, PATCH, DELETE)', () => {
    let adminToken: string;
    let targetUserId: string;

    beforeEach(async () => {
      // Create admin user
      await request(env.app.getHttpServer()).post('/auth/register').send({
        email: 'admin2@example.com',
        password: 'Password123!',
        name: 'Admin User 2',
      });
      await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin2@example.com'");
      
      const adminLogin = await request(env.app.getHttpServer()).post('/auth/login').send({
        email: 'admin2@example.com',
        password: 'Password123!',
      });
      adminToken = adminLogin.body.access_token;

      // Create target user
      const targetUser = await request(env.app.getHttpServer()).post('/auth/register').send({
        email: 'target@example.com',
        password: 'Password123!',
        name: 'Target User',
      });
      targetUserId = targetUser.body.id;
    });

    it('should get user by existing ID (TC 11)', async () => {
      const res = await request(env.app.getHttpServer())
        .get(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(targetUserId);
    });

    it('should return 404 for non-existing user ID (TC 12)', async () => {
      const fakeId = '999999';
      const res = await request(env.app.getHttpServer())
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(404);
    });

    it('should update user successfully (TC 13)', async () => {
      const res = await request(env.app.getHttpServer())
        .patch(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Target User',
        });
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Target User');
    });

    it('should fail validation on update with bad format (TC 14)', async () => {
      const res = await request(env.app.getHttpServer())
        .patch(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'not-an-email', // Assuming email is validated
        });
      
      expect(res.status).toBe(400);
    });

    it('should delete user successfully (TC 15)', async () => {
      const res = await request(env.app.getHttpServer())
        .delete(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 204]).toContain(res.status);

      // Verify user is deleted
      const fetchRes = await request(env.app.getHttpServer())
        .get(`/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(fetchRes.status).toBe(404);
    });
  });
});
