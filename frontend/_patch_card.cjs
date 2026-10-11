const fs = require('fs');
const p = 'src/components/ui/Card.tsx';
let s = fs.readFileSync(p, 'utf8');

// StatCard signature
s = s.replace(
  "export function StatCard({\n  label, value, delta, hint, icon, accent = 'brand',\n}: {\n  label: string;\n  value: string | number;\n  delta?: string;\n  hint?: string;\n  icon?: ReactNode;\n  accent?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet'| 'teal';\n}) {",
  `export function StatCard({
  label, value, delta, hint, icon, accent = 'brand', onClick,
}: {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal';
  onClick?: () => void;
}) {`
);

// Wrap Card usage with onClick + interactive + keyboard
s = s.replace(
  "  return (\n    <Card>\n      <div className=\"flex items-start justify-between gap-3\">",
  `  const clickableProps = onClick
    ? {
        onClick,
        interactive: true,
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
        },
      }
    : {};

  return (
    <Card {...(clickableProps as any)}>
      <div className="flex items-start justify-between gap-3">`
);

fs.writeFileSync(p, s);
console.log('P2 Card.tsx StatCard patched');
