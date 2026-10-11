import { Download } from 'lucide-react';
import Button from './Button';
import { exportRows } from '../../utils/csvExport';

interface Props<T extends Record<string, any>> {
  rows: T[];
  filename: string;
  columns?: { key: string; label: string; map?: (row: T) => any }[];
  label?: string;
  variant?: 'ghost' | 'secondary' | 'gradient' | 'primary';
  size?: 'sm' | 'md';
}

export default function ExportButton<T extends Record<string, any>>({
  rows, filename, columns, label = 'Export CSV', variant = 'secondary', size = 'sm',
}: Props<T>) {
  const disabled = !rows || rows.length === 0;
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={() => exportRows(filename, rows, columns)}
      title={disabled ? 'No rows to export' : 'Download ' + rows.length + ' rows as CSV'}
    >
      <Download size={14} /> {label}
    </Button>
  );
}
