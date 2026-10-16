import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import AdmZip from 'adm-zip';
import app from '../app';
import { connectDB, disconnectDB } from '../db/connection';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Project } from '../models/Project';
import { Scan } from '../models/Scan';

describe('QuantumShield API End-to-End Integration Tests', () => {
  let userToken: string;
  let userOrgId: string;
  let testProjectId: string;
  let createdScanId: string;
  let sampleFindingId: string;

  beforeAll(async () => {
    await connectDB();
    // Clean up test data if any
    await User.deleteMany({ email: /test-valmiki/ });
    await Organization.deleteMany({ name: /Test Valmiki/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test-valmiki/ });
    await Organization.deleteMany({ name: /Test Valmiki/ });
    await disconnectDB();
  });

  it('GET /api/health returns healthy status and Valmiki Softwares branding', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.organization).toBe('Valmiki Softwares');
    expect(res.body.product).toBe('QuantumShield');
  });

  it('GET /api/docs/openapi.json returns OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toContain('QuantumShield');
  });

  it('POST /api/auth/register successfully registers user and creates organization', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Valmiki Lead Architect',
        email: 'test-valmiki-lead@example.com',
        password: 'Password123!Secure',
        organizationName: 'Test Valmiki Security Lab',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test-valmiki-lead@example.com');
    expect(res.body.data.organization.name).toBe('Test Valmiki Security Lab');

    userToken = res.body.data.token;
    userOrgId = res.body.data.organization.id;
  });

  it('POST /api/auth/register rejects duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'test-valmiki-lead@example.com',
        password: 'Password123!Secure',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already exists');
  });

  it('POST /api/auth/login authenticates registered user and issues JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-valmiki-lead@example.com',
        password: 'Password123!Secure',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/forgot-password and /reset-password updates password successfully', async () => {
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test-valmiki-lead@example.com' });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);
    // Crucial security test: code must NOT be leaked in the client response
    expect((forgotRes.body as any).resetCode).toBeUndefined();
    if (forgotRes.body.data) {
      expect((forgotRes.body.data as any).resetCode).toBeUndefined();
    }

    // Retrieve the code securely from the database as would happen via the received email
    const user = await User.findOne({ email: 'test-valmiki-lead@example.com' });
    expect(user).toBeDefined();
    expect(user?.resetPasswordToken).toBeDefined();
    const resetCode = user!.resetPasswordToken!;

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'test-valmiki-lead@example.com',
        code: resetCode,
        newPassword: 'BrandNewSecurePassword456!',
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // Verify authentication succeeds with the newly updated password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-valmiki-lead@example.com',
        password: 'BrandNewSecurePassword456!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    userToken = loginRes.body.data.token;
  });

  it('GET /api/auth/me returns current user and organization profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('test-valmiki-lead@example.com');
    expect(res.body.data.organization.id).toBe(userOrgId);
  });

  it('Rejects unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/projects creates a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Core Payment Service',
        description: 'Microservice handling customer checkouts and tokenization',
        projectType: 'api',
        tags: ['payments', 'critical'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Core Payment Service');
    expect(res.body.data.projectType).toBe('api');
    testProjectId = res.body.data.id;
  });

  it('GET /api/projects lists projects belonging to user organization', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].id).toBe(testProjectId);
  });

  it('POST /api/projects/:id/quick-scan-demo runs classical vulnerable crypto demo', async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/quick-scan-demo`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ demoType: 'classical-vulnerable' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.findingsCount).toBeGreaterThan(0);
    expect(res.body.data.algorithmInventory.length).toBeGreaterThan(0);
    expect(res.body.data.readinessAssessment).toBeDefined();

    createdScanId = res.body.data.id;
    sampleFindingId = res.body.data.findings[0]?.findingId;
  });

  it('POST /api/projects/:id/scans accepts real ZIP upload and performs analysis', async () => {
    const zip = new AdmZip();
    zip.addFile(
      'src/auth.ts',
      Buffer.from(
        `import crypto from 'crypto';\nexport function key() { return crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }); }`,
        'utf-8'
      )
    );
    zip.addFile(
      'src/pqc.ts',
      Buffer.from(
        `// ML-KEM-768 post-quantum key exchange\nconst kem = "ML-KEM-768";\nconst hybrid = "X25519MLKEM768";`,
        'utf-8'
      )
    );
    zip.addFile('package.json', Buffer.from(JSON.stringify({ name: 'my-service' }), 'utf-8'));

    const zipBuffer = zip.toBuffer();

    const res = await request(app)
      .post(`/api/projects/${testProjectId}/scans`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', zipBuffer, 'source-code.zip');

    if (res.status !== 201) {
      console.error('Scan Upload Failure Body:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.findingsCount).toBeGreaterThanOrEqual(2);
    expect(res.body.data.readinessAssessment.pqcDetectedCount).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/scans/:scanId returns scan details and algorithm inventory', async () => {
    const res = await request(app)
      .get(`/api/scans/${createdScanId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdScanId);
    expect(res.body.data.findings.length).toBeGreaterThan(0);
  });

  it('GET /api/scans/:scanId/report/json downloads structured JSON readiness report', async () => {
    const res = await request(app)
      .get(`/api/scans/${createdScanId}/report/json`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/json');
    expect(res.body.reportType).toContain('Post-Quantum Security Readiness Assessment');
    expect(res.body.organization).toBe('Valmiki Softwares');
  });

  it('GET /api/scans/:scanId/report/pdf downloads executive PDF report', async () => {
    const res = await request(app)
      .get(`/api/scans/${createdScanId}/report/pdf`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('application/pdf');
    expect(res.body.length).toBeGreaterThan(1000); // Binary PDF buffer length
  });

  it('POST /api/scans/:scanId/findings/:findingId/ai-explain returns plain English remediation advice', async () => {
    if (!sampleFindingId) return;

    const res = await request(app)
      .post(`/api/scans/${createdScanId}/findings/${sampleFindingId}/ai-explain`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plainEnglishSummary).toBeDefined();
    expect(res.body.data.quantumThreatExplanation).toBeDefined();
    expect(res.body.data.stepByStepMigrationGuide.length).toBeGreaterThan(0);
    expect(res.body.data.isAiGenerated).toBe(true);
  });

  it('GET /api/dashboard/stats returns organization aggregate counts and charts', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalProjects).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalScans).toBeGreaterThanOrEqual(1);
    expect(res.body.data.findingsBySeverity).toBeDefined();
  });

  it('PATCH /api/organizations/current/plan allows mock plan upgrade', async () => {
    const res = await request(app)
      .patch('/api/organizations/current/plan')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ plan: 'developer' });

    expect(res.status).toBe(200);
    expect(res.body.data.plan).toBe('developer');
    expect(res.body.data.maxProjects).toBe(10);
  });
});
