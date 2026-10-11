const fs = require('fs');
const p = 'backend/src/services/financeService.ts';
if (!fs.existsSync(p)) { console.log('financeService not found — skipping'); process.exit(0); }
let s = fs.readFileSync(p, 'utf8');
console.log('financeService found. Manual patch may be needed if it does not already accept clientCode.');
console.log('If invoices() already accepts clientCode in its where clause, no change required.');
