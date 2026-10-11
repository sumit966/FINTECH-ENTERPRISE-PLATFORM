const fs = require('fs');
const p = 'src/components/ui/Kpi.tsx';
let s = fs.readFileSync(p, 'utf8');

// Remove the trailing ", onClick?: () => void" that was appended to the accent line
s = s.replace(
  /(accent\?\:\s*'brand'\s*\|\s*'emerald'\s*\|\s*'amber'\s*\|\s*'rose'\s*\|\s*'violet'\s*\|\s*'teal')\s*,\s*onClick\?\:\s*\(\)\s*=>\s*void\s*;/,
  '$1;'
);

// Safety: if it survived with different spacing
s = s.replace(/,\s*onClick\?\:\s*\(\)\s*=>\s*void(?=\s*[;,}])/g, (match, offset) => {
  const before = s.slice(0, offset);
  // keep the first occurrence (the one on its own line); drop subsequent ones
  return before.includes('onClick?: () => void;') ? '' : match;
});

// Ensure there's exactly one `onClick?: () => void;` right after `interface KpiProps {`
const header = 'interface KpiProps {';
const idx = s.indexOf(header);
if (idx !== -1) {
  const afterHeader = s.slice(idx + header.length);
  const beforeClick = afterHeader.split(/onClick\?\:/)[0] || '';
  const cleaned = beforeClick.replace(/^\s*\n\s*/, '\n  ');
  const rest = 'onClick?: () => void;\n' + afterHeader.slice(beforeClick.length + 'onClick?: () => void;'.length).replace(/^\s*/, '');
  s = s.slice(0, idx + header.length) + cleaned.trimEnd() + '\n  ' + rest;
}

fs.writeFileSync(p, s);
console.log('Kpi dedup done');
