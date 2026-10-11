const fs = require('fs');
const p = 'src/pages/hr/PayrollPage.tsx';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(
  '<Card className="mb-4" className="border-slate-400/30 bg-slate-500/5">',
  '<Card className="mb-4 border-slate-400/30 bg-slate-500/5">'
);
fs.writeFileSync(p, s);
console.log('PayrollPage Card className fixed');
