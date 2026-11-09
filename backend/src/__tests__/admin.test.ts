import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app';
import { SuperAdmin } from '../models/SuperAdmin';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { env } from '../config/env';

describe('QuantumShield Super Admin Subsystem Tests', () => {
  let adminToken: string;
  let customerToken: string;
  let testOrgId: string;
  let testUserId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    // 1. Create a test Super Admin
    const passwordHash = await bcrypt.hash('TestAdminPass123!', 10);
    const admin = await SuperAdmin.create({
      name: 'Test Super Admin',
      email: `test-admin-${Date.now()}@quantumshieldscan.com`,
      passwordHash,
      role: 'superadmin',
      isActive: true,
    });

    // 2. Create a test Organization & User
    const org = await Organization.create({
      name: 'Target Test Org',
      slug: `target-org-${Date.now()}`,
      plan: 'none',
      maxProjects: 1,
      maxScansPerMonth: 0,
    });
    testOrgId = String(org._id);

    const user = await User.create({
      name: 'Target Customer',
      email: `customer-${Date.now()}@example.com`,
      passwordHash,
      role: 'owner',
      organizationId: org._id,
    });
    testUserId = String(user._id);

    // Customer token
    customerToken = jwt.sign(
      {
        userId: testUserId,
        organizationId: testOrgId,
        role: 'owner',
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await SuperAdmin.deleteMany({ email: /test-admin-/ });
    await Organization.deleteMany({ _id: testOrgId });
    await User.deleteMany({ _id: testUserId });
  });

  it('rejects unauthenticated requests to /api/admin/dashboard/stats', async () => {
    const res = await request(app).get('/api/admin/dashboard/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects customer tokens on administrative endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('authenticates Super Admin credentials and returns an admin JWT', async () => {
    const admin = await SuperAdmin.findOne({ email: /test-admin-/ });
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: admin!.email,
        password: 'TestAdminPass123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.admin.role).toBe('superadmin');
    adminToken = res.body.token;
  });

  it('retrieves platform stats via /api/admin/dashboard/stats', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalOrgs).toBeGreaterThanOrEqual(1);
    expect(res.body.stats.telemetry).toBeDefined();
    expect(res.body.stats.planCounts).toBeDefined();
  });

  it('allows Super Admin to override tenant plan and quota limits', async () => {
    const res = await request(app)
      .patch(`/api/admin/organizations/${testOrgId}/plan`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plan: 'developer',
        maxProjects: 15,
        maxScansPerMonth: 100,
        reason: 'Enterprise pilot trial grant',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.organization.plan).toBe('developer');
    expect(res.body.organization.maxProjects).toBe(15);
    expect(res.body.organization.maxScansPerMonth).toBe(100);
  });

  it('allows Super Admin to suspend an organization and verifies customer rejection', async () => {
    const suspendRes = await request(app)
      .patch(`/api/admin/organizations/${testOrgId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'suspended',
        reason: 'Payment delinquency review',
      });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.organization.status).toBe('suspended');

    // Verify customer token is now blocked
    const customerReq = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(customerReq.status).toBe(403);
    expect(customerReq.body.code).toBe('ORG_SUSPENDED');

    // Unsuspend
    await request(app)
      .patch(`/api/admin/organizations/${testOrgId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });
  });

  it('generates an impersonation session token for support debugging', async () => {
    const res = await request(app)
      .post('/api/admin/auth/impersonate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ organizationId: testOrgId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.customerToken).toBeDefined();

    // Verify impersonated customer token works on customer endpoints
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${res.body.customerToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toContain('customer-');
  });

  it('executes temp storage purge endpoint', async () => {
    const res = await request(app)
      .post('/api/admin/scans/purge-temp')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.purgedCount).toBe('number');
  });
});
