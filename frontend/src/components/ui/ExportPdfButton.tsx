import { useState } from 'react';
import { FileDown } from 'lucide-react';
import Button from './Button';

interface Props {
  targetId: string;
  filename: string;
  label?: string;
}

export default function ExportPdfButton({ targetId, filename, label = 'Export PDF' }: Props) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setBusy(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(el, { backgroundColor: '#0b1120', scale: 1.5 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let w = pageW - 40; let h = w / ratio;
      if (h > pageH - 40) { h = pageH - 40; w = h * ratio; }
      pdf.addImage(img, 'PNG', 20, 20, w, h);
      pdf.save(filename.endsWith('.pdf') ? filename : filename + '.pdf');
    } finally { setBusy(false); }
  };
  return (
    <Button variant="secondary" size="sm" onClick={onClick} loading={busy}>
      <FileDown size={14} /> {label}
    </Button>
  );
}
