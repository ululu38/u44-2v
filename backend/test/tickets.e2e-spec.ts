import request from 'supertest';
import { TestEnvironment } from './utils/test-env';

describe('TicketsModule (e2e)', () => {
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
      email: 'admin-ticket@example.com',
      password: 'Password123!',
      name: 'Admin Ticket',
    });
    await env.pool.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin-ticket@example.com'");
    
    const adminRes = await request(env.app.getHttpServer()).post('/auth/login').send({
      email: 'admin-ticket@example.com',
      password: 'Password123!',
    });
    adminToken = adminRes.body.access_token;
  });

  it('should create a ticket successfully (TC 51)', async () => {
    const res = await request(env.app.getHttpServer())
      .post('/tickets')
      .send({
        name: 'Test Customer',
        phone: '0812345678',
        email: 'customer@example.com',
        subject: 'Need help',
        message: 'Please assist with my account.'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.ticketId).toBeDefined(); // Assuming unique ticketId is returned
  });

  it('should fail creating ticket when fields are missing (TC 52)', async () => {
    const res = await request(env.app.getHttpServer())
      .post('/tickets')
      .send({
        name: 'Missing Fields',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should list all tickets for admin (TC 53)', async () => {
    // Seed ticket
    await request(env.app.getHttpServer())
      .post('/tickets')
      .send({
        name: 'Test List',
        phone: '0812345678',
        email: 'list@example.com',
        subject: 'List Subject',
        message: 'Message list'
      });

    const res = await request(env.app.getHttpServer())
      .get('/tickets')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data || res.body)).toBe(true);
  });

  it('should patch ticket status successfully (TC 54)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/tickets')
      .send({
        name: 'Test Patch',
        phone: '0812345678',
        email: 'patch@example.com',
        subject: 'Patch Subject',
        message: 'Message patch'
      });
    
    const id = createRes.body.id;

    // Based on checklist TC 54, "Resolved" status or something similar.
    // In schema there's `isRead: boolean`, but maybe there's a status Enum.
    // We send an update payload. If API uses isRead, this patch tests it.
    const res = await request(env.app.getHttpServer())
      .patch(`/tickets/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Resolved', // Could be isRead: true in actual implementation
        isRead: true
      });
    
    expect(res.status).toBe(200);
  });

  it('should return validation error for invalid enum status (TC 55)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/tickets')
      .send({
        name: 'Test Enum',
        phone: '0812345678',
        email: 'enum@example.com',
        subject: 'Enum Subject',
        message: 'Message enum'
      });
    
    const id = createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .patch(`/tickets/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'INVALID_STATUS_XYZ'
      });
    
    expect([400]).toContain(res.status); // Validation failed
  });

  it('should delete ticket successfully (TC 56)', async () => {
    const createRes = await request(env.app.getHttpServer())
      .post('/tickets')
      .send({
        name: 'To Delete',
        phone: '0812345678',
        email: 'delete@example.com',
        subject: 'Delete Subject',
        message: 'Message delete'
      });
    
    const id = createRes.body.id;

    const res = await request(env.app.getHttpServer())
      .delete(`/tickets/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect([200, 204]).toContain(res.status);
  });
});
