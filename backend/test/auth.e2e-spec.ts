import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('AuthModule (e2e)', () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment();
    await env.start();
  }, 60000); // 60s timeout for starting container

  afterAll(async () => {
    await env.stop();
  });

  afterEach(async () => {
    await env.wipeDatabase();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully (TC 1)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test1@example.com',
          password: 'Password123!',
          name: 'Test User 1',
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('test1@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail if email already exists (TC 2)', async () => {
      // First registration
      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      // Second registration with same email
      const res = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Another User',
        });
      
      expect([400, 409]).toContain(res.status);
    });

    it('should fail validation on missing or weak password (TC 3)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak@example.com',
          password: '123', // Too short
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a user to test login against
      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'CorrectPassword1!',
          name: 'Login User',
        });
    });

    it('should login successfully and return JWT (TC 4)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'CorrectPassword1!',
        });
      
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('access_token');
    });

    it('should fail with wrong password (TC 5)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword!',
        });
      
      expect(res.status).toBe(401);
    });

    it('should fail with non-existent email (TC 6)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'Password123!',
        });
      
      expect(res.status).toBe(401);
    });
  });

  describe('/auth/me (GET)', () => {
    let token: string;

    beforeEach(async () => {
      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'me@example.com',
          password: 'Password123!',
          name: 'Me User',
        });
      
      const loginRes = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'me@example.com',
          password: 'Password123!',
        });
      
      token = loginRes.body.access_token;
    });

    it('should fetch profile with valid token (TC 7)', async () => {
      const res = await request(env.app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('me@example.com');
    });

    it('should fail without token (TC 8)', async () => {
      const res = await request(env.app.getHttpServer())
        .get('/auth/me');
      
      expect(res.status).toBe(401);
    });
  });
});
