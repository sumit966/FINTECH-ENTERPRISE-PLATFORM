import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/prisma';
import { fail } from '../utils/apiResponse';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      fail(res, 'Missing or invalid Authorization header', 401, 'UNAUTHENTICATED');
      return;
    }
    const token = header.slice('Bearer '.length).trim();
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        employee: { select: { id: true, employeeCode: true } },
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      fail(res, 'User not found or inactive', 401, 'UNAUTHENTICATED');
      return;
    }

    const roleCodes: string[] = [];
    const permSet = new Set<string>();
    for (const ur of user.userRoles) {
      roleCodes.push(ur.role.code);
      for (const rp of ur.role.permissions) {
        permSet.add(rp.permission.code);
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: roleCodes,
      permissions: Array.from(permSet),
      employeeId: user.employee ? user.employee.id : null,
    };

    next();
  } catch (e: any) {
    fail(res, 'Invalid or expired token', 401, 'UNAUTHENTICATED');
  }
}