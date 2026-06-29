import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('ClientsModule (e2e)', () => {
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
      email: 'admin-client@example.com',
      password: 'Password123!',
      name: 'Admin Client',
    });
    await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin-client@example.com'");
    
    const adminRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'admin-client@example.com',
      password: 'Password123!',
    });
    adminToken = adminRes.body.access_token;
  });

  describe('/client-groups', () => {
    it('should create client group successfully (TC 44)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/client-groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'VIP Clients',
        });
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('VIP Clients');
    });

    it('should get client groups list (TC 45)', async () => {
      await request(env.app.getHttpServer())
        .post('/client-groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Regular Clients',
        });

      const res = await request(env.app.getHttpServer())
        .get('/client-groups');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data || res.body)).toBe(true);
    });
  });

  describe('/clients', () => {
    let groupId: number;

    beforeEach(async () => {
      const groupRes = await request(env.app.getHttpServer())
        .post('/client-groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Target Group',
        });
      groupId = groupRes.body.groupId || groupRes.body.id;
    });

    it('should create client with valid group ID (TC 46)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Client A',
          groupIds: [groupId], // Assumes many-to-many or array format based on typical setup
        });
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Client A');
    });

    it('should return error for invalid group ID (TC 47)', async () => {
      const res = await request(env.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Client B',
          groupIds: [999999], // Invalid FK
        });
      
      expect([400, 404, 500]).toContain(res.status);
    });

    it('should get clients list with nested group details (TC 48)', async () => {
      await request(env.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Client C',
          groupIds: [groupId],
        });

      const res = await request(env.app.getHttpServer())
        .get('/clients');
      
      expect(res.status).toBe(200);
      // Validate join result
      const client = (res.body.data || res.body).find((c: any) => c.name === 'Client C');
      expect(client).toBeDefined();
      expect(client.groups).toBeDefined(); // Based on schema relation name
    });

    it('should patch client to new group (TC 49)', async () => {
      const createRes = await request(env.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Client D',
          groupIds: [groupId],
        });
      
      const clientId = createRes.body.clientId || createRes.body.id;

      const newGroupRes = await request(env.app.getHttpServer())
        .post('/client-groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Group',
        });
      
      const newGroupId = newGroupRes.body.groupId || newGroupRes.body.id;

      const res = await request(env.app.getHttpServer())
        .patch(`/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          groupIds: [newGroupId],
        });
      
      expect(res.status).toBe(200);
    });

    it('should delete client without affecting group (TC 50)', async () => {
      const createRes = await request(env.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Client E',
          groupIds: [groupId],
        });
      
      const clientId = createRes.body.clientId || createRes.body.id;

      const res = await request(env.app.getHttpServer())
        .delete(`/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 204]).toContain(res.status);

      // Group should still exist
      const groupRes = await request(env.app.getHttpServer())
        .get('/client-groups');
      const group = (groupRes.body.data || groupRes.body).find((g: any) => g.groupId === groupId || g.id === groupId);
      expect(group).toBeDefined();
    });
  });
});
