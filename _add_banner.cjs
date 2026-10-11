const fs = require('fs');

function addBanner(file, anchor, banner) {
  if (!fs.existsSync(file)) { console.log('skip (missing):', file); return; }
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('Synthetic demonstration data')) { console.log('already banner:', file); return; }
  if (!s.includes(anchor)) { console.log('anchor not found in:', file); return; }
  s = s.replace(anchor, banner + '\n' + anchor);
  fs.writeFileSync(file, s);
  console.log('banner added:', file);
}

const banner = `
      <Card className="border-slate-400/30 bg-slate-500/5">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <strong>Synthetic demonstration data.</strong> These figures reflect a synthetic 500-employee dataset spanning
          Oct 2024 to the latest recorded period. They do not represent the intended financial scale of a real
          operating business and are not suitable for planning, investment, or compliance purposes. See the master data
          note in the platform documentation for details.
        </div>
      </Card>`;

addBanner(
  'frontend/src/pages/finance/FinancePage.tsx',
  '<div>\n        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>',
  banner
);

addBanner(
  'frontend/src/pages/hr/PayrollPage.tsx',
  '<PageHeader\n        title="Payroll"',
  banner.replace('      <Card', '      <Card className="mb-4"')
);

addBanner(
  'frontend/src/pages/clients/ClientsPage.tsx',
  '<div>\n        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>',
  banner
);

console.log('Banner pass complete.');
