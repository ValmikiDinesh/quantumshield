import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter, scanLimiter } from '../middleware/rateLimiter';

import {
  AuthController,
  registerSchema,
  loginSchema,
} from '../controllers/authController';
import {
  ProjectController,
  createProjectSchema,
  updateProjectSchema,
} from '../controllers/projectController';
import { ScanController } from '../controllers/scanController';
import { DashboardController } from '../controllers/dashboardController';
import {
  OrganizationController,
  updatePlanSchema,
} from '../controllers/organizationController';
import { openApiSpec } from '../docs/openapi';

const router = Router();

// Configure safe in-memory multer upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const isZip =
      file.mimetype === 'application/zip' ||
      file.mimetype === 'application/x-zip-compressed' ||
      file.mimetype === 'application/octet-stream' ||
      file.originalname.toLowerCase().endsWith('.zip');

    if (isZip) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip archive files are permitted for repository scanning.'));
    }
  },
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    product: 'QuantumShield',
    organization: 'Valmiki Softwares',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// OpenAPI Spec
router.get('/docs/openapi.json', (req, res) => {
  res.status(200).json(openApiSpec);
});

// Authentication endpoints
router.post('/auth/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/auth/login', authLimiter, validate(loginSchema), AuthController.login);
router.get('/auth/me', requireAuth, AuthController.me);
router.post('/auth/logout', requireAuth, AuthController.logout);

// Project management endpoints
router.get('/projects', requireAuth, ProjectController.listProjects);
router.post('/projects', requireAuth, validate(createProjectSchema), ProjectController.createProject);
router.get('/projects/:id', requireAuth, ProjectController.getProject);
router.patch('/projects/:id', requireAuth, validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/projects/:id', requireAuth, ProjectController.deleteProject);

// Scan operations
router.post(
  '/projects/:projectId/scans',
  requireAuth,
  scanLimiter,
  upload.single('file'),
  ScanController.uploadAndScan
);
router.post(
  '/projects/:projectId/quick-scan-demo',
  requireAuth,
  scanLimiter,
  ScanController.quickScanDemo
);
router.get('/projects/:projectId/scans', requireAuth, ScanController.listProjectScans);
router.get('/scans/compare', requireAuth, ScanController.compareScans);
router.get('/scans/:scanId', requireAuth, ScanController.getScan);
router.get('/scans/:scanId/report/json', requireAuth, ScanController.downloadReportJSON);
router.get('/scans/:scanId/report/pdf', requireAuth, ScanController.downloadReportPDF);
router.post('/scans/:scanId/findings/:findingId/ai-explain', requireAuth, ScanController.explainFindingWithAI);

// Dashboard stats
router.get('/dashboard/stats', requireAuth, DashboardController.getStats);

// Organization & Plan
router.get('/organizations/current', requireAuth, OrganizationController.getCurrent);
router.patch('/organizations/current/plan', requireAuth, validate(updatePlanSchema), OrganizationController.updatePlan);

export default router;
