const fs = require('fs');
const p = 'backend/src/controllers/leaveController.ts';
let s = fs.readFileSync(p, 'utf8');

const additions = `

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const d = await leaveService.getLeaveDetail(req.params.id);
    if (!d) { res.status(404).json({ success: false, error: 'Leave request not found', code: 'NOT_FOUND' }); return; }
    ok(res, d);
  } catch (e) { next(e); }
}

export const rejectSchema = z.object({ reason: z.string().min(3).max(500) });

export async function approve(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await leaveService.approveLeave(req.params.id, req.user?.id || null)); } catch (e) { next(e); }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = rejectSchema.parse(req.body);
    ok(res, await leaveService.rejectLeave(req.params.id, reason, req.user?.id || null));
  } catch (e) { next(e); }
}
`;

s = s.replace(/\s*$/, '') + '\n' + additions.trimStart();
fs.writeFileSync(p, s);
console.log('leaveController.ts: added detail, approve, reject');
