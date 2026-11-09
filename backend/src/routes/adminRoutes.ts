import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireSuperAdmin } from '../middleware/adminAuth';
import { AdminAuthController } from '../controllers/admin/adminAuthController';
import { AdminDashboardController } from '../controllers/admin/adminDashboardController';
import { AdminOrgController } from '../controllers/admin/adminOrgController';
import { AdminUserController } from '../controllers/admin/adminUserController';
import { AdminPaymentController } from '../controllers/admin/adminPaymentController';
import { AdminScanController } from '../controllers/admin/adminScanController';
import { AdminSettingsController } from '../controllers/admin/adminSettingsController';
import { AdminAuditController } from '../controllers/admin/adminAuditController';

const router = Router();

// Strict rate limiting on admin login
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Too many administrative login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin Auth (Public login, protected profile & impersonation)
router.post('/auth/login', adminLoginLimiter, AdminAuthController.login);
router.get('/auth/me', requireSuperAdmin, AdminAuthController.getProfile);
router.post('/auth/impersonate', requireSuperAdmin, AdminAuthController.impersonateTenant);

// Dashboard & Telemetry
router.get('/dashboard/stats', requireSuperAdmin, AdminDashboardController.getStats);

// Organizations (Tenants)
router.get('/organizations', requireSuperAdmin, AdminOrgController.listOrganizations);
router.get('/organizations/:id', requireSuperAdmin, AdminOrgController.getOrganization);
router.patch('/organizations/:id/plan', requireSuperAdmin, AdminOrgController.updatePlan);
router.patch('/organizations/:id/status', requireSuperAdmin, AdminOrgController.updateStatus);

// Users
router.get('/users', requireSuperAdmin, AdminUserController.listUsers);
router.patch('/users/:id/reset-password', requireSuperAdmin, AdminUserController.resetPassword);
router.delete('/users/:id', requireSuperAdmin, AdminUserController.deleteUser);

// Payments & Accounting
router.get('/payments', requireSuperAdmin, AdminPaymentController.listPayments);
router.post('/payments/manual-credit', requireSuperAdmin, AdminPaymentController.manualCredit);
router.get('/payments/export-csv', requireSuperAdmin, AdminPaymentController.exportCSV);

// Scans & System Disk
router.get('/scans', requireSuperAdmin, AdminScanController.listScans);
router.get('/scans/:id', requireSuperAdmin, AdminScanController.getScan);
router.post('/scans/:id/abort', requireSuperAdmin, AdminScanController.abortScan);
router.post('/scans/purge-temp', requireSuperAdmin, AdminScanController.purgeTempStorage);

// Platform Settings & Maintenance
router.get('/settings', requireSuperAdmin, AdminSettingsController.getSettings);
router.patch('/settings', requireSuperAdmin, AdminSettingsController.updateSetting);

// Audit Logs
router.get('/audit-logs', requireSuperAdmin, AdminAuditController.listAuditLogs);

export default router;
