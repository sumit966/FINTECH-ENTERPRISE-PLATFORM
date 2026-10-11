const fs = require('fs');
const p = 'src/components/ui/Kpi.tsx';
let s = fs.readFileSync(p, 'utf8');

// Add onClick to props interface (idempotent)
if (!/onClick\?/.test(s)) {
  s = s.replace(/(\n\s*)interface\s+KpiProps\s*\{/, '$1interface KpiProps {$1  onClick?: () => void;');
  // If KpiProps was declared inline in the function signature instead, add there too
  s = s.replace(/(\baccent\??\s*:\s*[^,;}]+)([,;}])/, '$1, onClick?: () => void$2');
}

// Destructure onClick
s = s.replace(/export default function Kpi\(\{([^}]+)\}/, (m, inner) => {
  if (/\bonClick\b/.test(inner)) return m;
  return 'export default function Kpi({' + inner.trim().replace(/\s*$/, '') + ', onClick }';
});

// Make the outer Card/div clickable when onClick is set
s = s.replace(/<Card(\s|>)/, (m, sp) => {
  if (/onClick=/.test(s)) return m;
  return '<Card {...(onClick ? { onClick, interactive: true, role: "button", tabIndex: 0, onKeyDown: (e: any) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } } : {})}' + sp;
});

fs.writeFileSync(p, s);
console.log('Kpi patched');
