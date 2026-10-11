const fs = require('fs');
const p = 'backend/src/routes/leaveRoutes.ts';
let s = fs.readFileSync(p, 'utf8');

// Insert new routes BEFORE the final export default
const before = "export default router;";
const after = `router.get('/:id',          requirePermission('leave.read'),    leave.detail);
router.post('/:id/approve',   requirePermission('leave.approve'), leave.approve);
router.post('/:id/reject',    requirePermission('leave.approve'), leave.reject);

export default router;`;

if (!s.includes('leave.approve')) {
  s = s.replace(before, after);
  fs.writeFileSync(p, s);
  console.log('leaveRoutes.ts: registered /:id, /:id/approve, /:id/reject');
} else {
  console.log('leaveRoutes.ts already patched');
}
