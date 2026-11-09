import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedAdminRequest, AuthenticatedSuperAdmin } from '../types';
import { SuperAdmin, SuperAdminRole } from '../models/SuperAdmin';

export async function requireSuperAdmin(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Administrative authentication required. Missing or malformed Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_ADMIN_SECRET, {
      algorithms: ['HS256'],
    }) as AuthenticatedSuperAdmin;

    if (!decoded.isSuperAdmin || !decoded.adminId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden. The provided token does not carry super administrative privileges.',
      });
      return;
    }

    // Verify admin is still active in database
    const adminDoc = await SuperAdmin.findById(decoded.adminId);
    if (!adminDoc || !adminDoc.isActive) {
      res.status(403).json({
        success: false,
        error: 'Administrative account is inactive or disabled. Contact system administrator.',
      });
      return;
    }

    req.admin = {
      adminId: String(adminDoc._id),
      email: adminDoc.email,
      name: adminDoc.name,
      role: adminDoc.role,
      isSuperAdmin: true,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired administrative token. Please sign in again.',
    });
  }
}

export function requireAdminRoles(allowedRoles: SuperAdminRole[]) {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Action requires one of roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
