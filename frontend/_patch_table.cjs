const fs = require('fs');
const p = 'src/components/ui/Table.tsx';
let s = fs.readFileSync(p, 'utf8');

// Add onRowClick to props interface (idempotent)
if (!/onRowClick\?/.test(s)) {
  s = s.replace(
    "  emptyMessage?: string;\n}",
    "  emptyMessage?: string;\n  onRowClick?: (row: T) => void;\n}"
  );
}

// Destructure it
s = s.replace(
  "export default function Table<T>({ columns, data, rowKey, emptyMessage = 'No records found' }: TableProps<T>) {",
  "export default function Table<T>({ columns, data, rowKey, emptyMessage = 'No records found', onRowClick }: TableProps<T>) {"
);

// Wire it on the <tr> with accessible keyboard support
s = s.replace(
  'data.map((row) => (\n              <tr key={rowKey(row)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">',
  `data.map((row) => (
              <tr
                key={rowKey(row)}
                className={
                  'hover:bg-slate-50 dark:hover:bg-slate-800/40 ' +
                  (onRowClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/40' : '')
                }
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
              >`
);

fs.writeFileSync(p, s);
console.log('P1 Table.tsx patched');
