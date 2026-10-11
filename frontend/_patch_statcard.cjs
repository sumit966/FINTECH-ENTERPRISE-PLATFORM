const fs = require('fs');
const p = 'src/components/ui/Card.tsx';
let s = fs.readFileSync(p, 'utf8');

// Replace the StatCard signature block verbatim by locating the function and
// rewriting its parameter list up to the first `{` of the body.
const start = s.indexOf('export function StatCard(');
if (start === -1) {
  console.error('StatCard not found');
  process.exit(1);
}
// Find the `) {` that ends the params
const openBody = s.indexOf(') {', s.indexOf('{', start));
// But we need the closing of the whole param type — find the `}) {` sequence
const closer = s.indexOf('}) {', start);
if (closer === -1) {
  console.error('StatCard closer not found');
  process.exit(1);
}

const newSig = `export function StatCard({
  label, value, delta, hint, icon, accent = 'brand', onClick,
}: {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal';
  onClick?: () => void;
`;

s = s.slice(0, start) + newSig + s.slice(closer);

// Ensure the clickableProps block exists once
if (!/clickableProps/.test(s)) {
  s = s.replace(
    '  return (\n    <Card>',
    `  const clickableProps = onClick
    ? {
        onClick,
        interactive: true,
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
        },
      }
    : {};

  return (
    <Card {...(clickableProps as any)}>`
  );
}

fs.writeFileSync(p, s);
console.log('StatCard rewritten');
