import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as aiService from '../services/aiService';

export const askSchema = z.object({ question: z.string().min(1).max(500) });

export async function ask(req: Request, res: Response, next: NextFunction) {
  try {
    const { question } = askSchema.parse(req.body);
    const user = req.user!;
    const ctx = { userEmail: user.email, roles: user.roles, permissions: user.permissions };
    ok(res, await aiService.ask(question, ctx));
  } catch (e) { next(e); }
}

export async function provider(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, { provider: aiService.currentProvider() }); } catch (e) { next(e); }
}