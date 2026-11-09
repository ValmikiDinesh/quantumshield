import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { Organization } from '../models/Organization';

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AuthenticatedUser;
    req.user = decoded;

    // Check organization suspension
    if (decoded.organizationId) {
      const org = await Organization.findById(decoded.organizationId).select('status suspendedReason');
      if (org && org.status === 'suspended') {
        res.status(403).json({
          success: false,
          code: 'ORG_SUSPENDED',
          error: `This organization has been suspended: ${org.suspendedReason || 'Administrative suspension'}. Please contact support@valmikisoftwares.com.`,
        });
        return;
      }
    }

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
