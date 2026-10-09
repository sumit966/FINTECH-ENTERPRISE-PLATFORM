import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { verifyPassword } from '../utils/password';
import { ok, fail } from '../utils/apiResponse';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      employee: { select: { id: true, employeeCode: true } },
      userRoles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    fail(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: user.failedAttempts + 1 } });
    fail(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    return;
  }

  const roleCodes: string[] = [];
  const permSet = new Set<string>();
  const rolesPublic: { code: string; name: string; level: number }[] = [];

  for (const ur of user.userRoles) {
    roleCodes.push(ur.role.code);
    rolesPublic.push({ code: ur.role.code, name: ur.role.name, level: ur.role.level });
    for (const rp of ur.role.permissions) permSet.add(rp.permission.code);
  }

  const token = signToken({ sub: user.id, email: user.email, roles: roleCodes });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), failedAttempts: 0 },
  });

  ok(res, {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      roles: rolesPublic,
      permissions: Array.from(permSet),
      employeeId: user.employee ? user.employee.id : null,
      employeeCode: user.employee ? user.employee.employeeCode : null,
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      employee: { select: { id: true, employeeCode: true } },
      userRoles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });

  if (!dbUser) {
    fail(res, 'User not found', 404, 'NOT_FOUND');
    return;
  }

  const rolesPublic: { code: string; name: string; level: number }[] = [];
  const permSet = new Set<string>();
  for (const ur of dbUser.userRoles) {
    rolesPublic.push({ code: ur.role.code, name: ur.role.name, level: ur.role.level });
    for (const rp of ur.role.permissions) permSet.add(rp.permission.code);
  }

  ok(res, {
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.fullName,
    phone: dbUser.phone,
    roles: rolesPublic,
    permissions: Array.from(permSet),
    employeeId: dbUser.employee ? dbUser.employee.id : null,
    employeeCode: dbUser.employee ? dbUser.employee.employeeCode : null,
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT — the client discards the token. Session table can be used later for revocation.
  ok(res, { message: 'Signed out' });
}