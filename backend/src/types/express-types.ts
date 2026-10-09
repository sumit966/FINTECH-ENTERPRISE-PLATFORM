// Runtime module whose only purpose is to augment Express.Request globally.
// Imported for side effects in app.ts.
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: string;
        roles: string[];
        permissions: string[];
        employeeId: string | null;
      };
    }
  }
}

export {};