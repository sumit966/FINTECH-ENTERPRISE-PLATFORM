export interface CsvColumn<T> {
  key: string;
  label: string;
  map?: (row: T) => unknown;
}

export function toCsv<T extends Record<string, any>>(rows: T[], columns?: CsvColumn<T>[]): string {
  if (!rows || rows.length === 0) return '';
  const cols: CsvColumn<T>[] = columns && columns.length > 0
    ? columns
    : Object.keys(rows[0]).map((k) => ({ key: k, label: k }));

  const escape = (v: any): string => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const header = cols.map((c) => escape(c.label)).join(',');
  const body = rows.map((r) =>
    cols.map((c) => escape(c.map ? c.map(r) : (r as any)[c.key])).join(',')
  );
  return [header, ...body].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  if (!csv) return;
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRows<T extends Record<string, any>>(
  filename: string, rows: T[], columns?: CsvColumn<T>[]
): void {
  downloadCsv(filename, toCsv(rows, columns));
}
