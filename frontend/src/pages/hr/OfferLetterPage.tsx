import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText, Printer, Download, RotateCcw, Copy, Check, AlertCircle, Building2,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import { useNotifications } from '../../context/NotificationContext';

interface OfferForm {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  department: string;
  location: string;
  reportingManager: string;
  joiningDate: string;
  annualCtc: number;
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  probationMonths: number;
  noticePeriodDays: number;
  benefits: string;
  expiryDate: string;
  terms: string;
  offerReference: string;
}

const DEFAULTS: OfferForm = {
  candidateName: '',
  candidateEmail: '',
  candidatePhone: '',
  jobTitle: '',
  department: '',
  location: 'Pune',
  reportingManager: '',
  joiningDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  annualCtc: 1200000,
  basic: 600000,
  hra: 240000,
  allowances: 240000,
  bonus: 120000,
  probationMonths: 3,
  noticePeriodDays: 60,
  benefits: 'Health insurance, Provident Fund, paid leave, learning budget',
  expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  terms: 'This offer is contingent on successful completion of background verification and submission of required documents.',
  offerReference: 'FITS-OFR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000),
};

const STORAGE_KEY = 'nexus.offer-letter.draft';

function loadDraft(): OfferForm {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

function formatLongDate(iso: string): string {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OfferLetterPage() {
  const { push } = useNotifications();
  const [form, setForm] = useState<OfferForm>(() => loadDraft());
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Persist draft on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  }, [form]);

  const set = <K extends keyof OfferForm>(key: K, value: OfferForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const monthlyCtc = useMemo(() => Math.round(form.annualCtc / 12), [form.annualCtc]);
  const grossMonthly = useMemo(
    () => Number(form.basic) + Number(form.hra) + Number(form.allowances) + Number(form.bonus),
    [form.basic, form.hra, form.allowances, form.bonus]
  );

  const validate = (): string | null => {
    if (!form.candidateName.trim()) return 'Candidate name is required';
    if (!form.jobTitle.trim()) return 'Job title is required';
    if (!form.department.trim()) return 'Department is required';
    if (!form.joiningDate) return 'Joining date is required';
    if (form.annualCtc <= 0) return 'Annual CTC must be greater than 0';
    if (grossMonthly > monthlyCtc) return 'Monthly component total (' + formatINR(grossMonthly) + ') exceeds monthly CTC (' + formatINR(monthlyCtc) + ')';
    return null;
  };

  const copySummary = async () => {
    const text = [
      'Offer Reference: ' + form.offerReference,
      'Candidate: ' + form.candidateName + ' <' + form.candidateEmail + '>',
      'Position: ' + form.jobTitle,
      'Department: ' + form.department,
      'Location: ' + form.location,
      'Reporting Manager: ' + form.reportingManager,
      'Joining Date: ' + formatLongDate(form.joiningDate),
      'Annual CTC: ' + formatINR(form.annualCtc),
      'Offer Valid Until: ' + formatLongDate(form.expiryDate),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      push({ variant: 'success', title: 'Summary copied', body: 'Offer summary is on your clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      push({ variant: 'error', title: 'Copy failed', body: 'Clipboard not available' });
    }
  };

  const doPrint = () => {
    window.print();
  };

  const downloadPdf = async () => {
    const err = validate();
    if (err) { push({ variant: 'error', title: 'Validation failed', body: err }); return; }
    if (!previewRef.current) return;

    setGenerating(true);
    try {
      // Dynamic imports so Vite only loads these when needed
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let remaining = imgHeight;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        remaining -= pageHeight;
        if (remaining > 0) {
          position -= pageHeight;
          pdf.addPage();
        }
      }

      const filename = 'Offer-' + form.candidateName.replace(/\s+/g, '-') + '-' + form.offerReference + '.pdf';
      pdf.save(filename);
      push({ variant: 'success', title: 'PDF downloaded', body: filename });
    } catch (e: any) {
      push({
        variant: 'error',
        title: 'PDF generation unavailable',
        body: 'Install jspdf + html2canvas, or use Print → Save as PDF.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const resetDraft = () => {
    if (!confirm('Reset the offer letter form to defaults? Your current draft will be lost.')) return;
    setForm({ ...DEFAULTS, offerReference: 'FITS-OFR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000) });
    push({ variant: 'info', title: 'Draft reset', body: 'Form has been cleared' });
  };

  const validationError = validate();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Offer Letter Generator"
        subtitle="Prototype — drafts saved locally, not synced to server"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={copySummary}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy summary'}
            </Button>
            <Button variant="secondary" size="sm" onClick={resetDraft}>
              <RotateCcw size={14} /> Reset
            </Button>
            <Button variant="secondary" size="sm" onClick={doPrint}>
              <Printer size={14} /> Print
            </Button>
            <Button variant="gradient" size="sm" onClick={downloadPdf} loading={generating}>
              <Download size={14} /> Download PDF
            </Button>
          </>
        }
      />

      {/* Honest scope banner */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Prototype mode.</strong> This form does <strong>not</strong> save to the backend or send email. Drafts persist in your browser's local storage only. Print uses the browser's native print dialog — choose <em>Save as PDF</em> there if you prefer not to install PDF dependencies. No offer is marked as accepted automatically.
          </div>
        </div>
      </Card>

      {validationError && (
        <Card className="border-rose-500/30 bg-rose-500/5">
          <div className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div>{validationError}</div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* ------------------------ FORM ------------------------ */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Candidate" subtitle="Who the offer is for" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Full Name *" value={form.candidateName} onChange={(e) => set('candidateName', e.target.value)} placeholder="e.g. Ravi Kumar" />
              <Input label="Email" type="email" value={form.candidateEmail} onChange={(e) => set('candidateEmail', e.target.value)} placeholder="name@example.in" />
              <Input label="Phone" value={form.candidatePhone} onChange={(e) => set('candidatePhone', e.target.value)} placeholder="+91-..." />
              <Input label="Offer Reference" value={form.offerReference} onChange={(e) => set('offerReference', e.target.value)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Position" subtitle="Role, department, and reporting" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Job Title *" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="e.g. Senior Backend Engineer" />
              <Input label="Department *" value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Backend Engineering" />
              <Input label="Location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Pune" />
              <Input label="Reporting Manager" value={form.reportingManager} onChange={(e) => set('reportingManager', e.target.value)} placeholder="e.g. Vikram Nair" />
              <Input label="Joining Date *" type="date" value={form.joiningDate} onChange={(e) => set('joiningDate', e.target.value)} />
              <Input label="Offer Valid Until" type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Compensation" subtitle={'Monthly CTC: ' + formatINR(monthlyCtc)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Annual CTC (INR) *" type="number" value={form.annualCtc} onChange={(e) => set('annualCtc', Number(e.target.value))} min={0} />
              <div className="flex items-end text-xs text-slate-500">
                Monthly CTC = {formatINR(monthlyCtc)}
              </div>
              <Input label="Basic (monthly)" type="number" value={form.basic} onChange={(e) => set('basic', Number(e.target.value))} min={0} />
              <Input label="HRA (monthly)" type="number" value={form.hra} onChange={(e) => set('hra', Number(e.target.value))} min={0} />
              <Input label="Allowances (monthly)" type="number" value={form.allowances} onChange={(e) => set('allowances', Number(e.target.value))} min={0} />
              <Input label="Bonus (monthly)" type="number" value={form.bonus} onChange={(e) => set('bonus', Number(e.target.value))} min={0} />
            </div>
            <div className={'mt-3 text-xs rounded-md p-3 ' + (grossMonthly > monthlyCtc ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'bg-slate-50 dark:bg-slate-900/60 text-slate-500')}>
              Component total: <strong>{formatINR(grossMonthly)}</strong> / month
              {grossMonthly > monthlyCtc && ' — exceeds monthly CTC'}
            </div>
          </Card>

          <Card>
            <CardHeader title="Employment Terms" subtitle="Probation, notice, benefits" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Probation (months)" type="number" value={form.probationMonths} onChange={(e) => set('probationMonths', Number(e.target.value))} min={0} />
              <Input label="Notice Period (days)" type="number" value={form.noticePeriodDays} onChange={(e) => set('noticePeriodDays', Number(e.target.value))} min={0} />
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Benefits</label>
              <textarea
                value={form.benefits}
                onChange={(e) => set('benefits', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Additional Terms</label>
              <textarea
                value={form.terms}
                onChange={(e) => set('terms', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          </Card>
        </div>

        {/* ------------------------ PREVIEW ------------------------ */}
        <div className="xl:sticky xl:top-20 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-slate-500">Live A4 Preview</div>
            <div className="text-[11px] text-slate-400">Updates as you type</div>
          </div>
          <div
            ref={previewRef}
            id="offer-letter-preview"
            className="bg-white text-slate-900 shadow-xl rounded-lg overflow-hidden"
            style={{ aspectRatio: '210 / 297', width: '100%', padding: '48px 56px', fontFamily: 'Georgia, serif', fontSize: '11px', lineHeight: '1.6' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-slate-900 grid place-items-center text-white font-bold text-lg">N</div>
                <div>
                  <div className="text-lg font-bold tracking-tight">FINTECH IT SOLUTIONS</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Pune · Bangalore · Noida</div>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <div>Ref: <span className="font-mono text-slate-700">{form.offerReference}</span></div>
                <div className="mt-1">{formatLongDate(new Date().toISOString().slice(0, 10))}</div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-center text-base font-bold tracking-wide mt-6 mb-4 underline underline-offset-4">
              OFFER OF EMPLOYMENT
            </h1>

            {/* Salutation */}
            <p className="mb-3">Dear <strong>{form.candidateName || '[Candidate Name]'}</strong>,</p>

            <p className="mb-3">
              We are delighted to extend this offer of employment to you for the position of <strong>{form.jobTitle || '[Job Title]'}</strong>
              {form.department && <> in the <strong>{form.department}</strong> department</>}
              {form.location && <>, based at our <strong>{form.location}</strong> office</>}.
              This offer is subject to the terms and conditions described below.
            </p>

            {/* Details table */}
            <table className="w-full mb-4 text-[11px]">
              <tbody>
                <tr><td className="py-1 w-1/3 text-slate-500">Position</td><td className="py-1 font-medium">{form.jobTitle || '\u2014'}</td></tr>
                <tr><td className="py-1 text-slate-500">Department</td><td className="py-1 font-medium">{form.department || '\u2014'}</td></tr>
                <tr><td className="py-1 text-slate-500">Location</td><td className="py-1 font-medium">{form.location || '\u2014'}</td></tr>
                <tr><td className="py-1 text-slate-500">Reporting Manager</td><td className="py-1 font-medium">{form.reportingManager || '\u2014'}</td></tr>
                <tr><td className="py-1 text-slate-500">Joining Date</td><td className="py-1 font-medium">{formatLongDate(form.joiningDate)}</td></tr>
                <tr><td className="py-1 text-slate-500">Offer Valid Until</td><td className="py-1 font-medium">{formatLongDate(form.expiryDate)}</td></tr>
              </tbody>
            </table>

            {/* Compensation */}
            <div className="mb-4">
              <div className="font-bold text-[12px] mb-2">Compensation</div>
              <table className="w-full text-[11px] border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-2 border-b border-slate-300">Component</th>
                    <th className="text-right p-2 border-b border-slate-300">Monthly (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2">Basic Salary</td><td className="p-2 text-right">{formatINR(form.basic)}</td></tr>
                  <tr><td className="p-2">House Rent Allowance</td><td className="p-2 text-right">{formatINR(form.hra)}</td></tr>
                  <tr><td className="p-2">Other Allowances</td><td className="p-2 text-right">{formatINR(form.allowances)}</td></tr>
                  <tr><td className="p-2">Performance Bonus</td><td className="p-2 text-right">{formatINR(form.bonus)}</td></tr>
                  <tr className="font-semibold bg-slate-50"><td className="p-2">Gross Monthly</td><td className="p-2 text-right">{formatINR(grossMonthly)}</td></tr>
                  <tr className="font-bold bg-slate-100"><td className="p-2">Annual CTC</td><td className="p-2 text-right">{formatINR(form.annualCtc)}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Terms */}
            <div className="mb-4">
              <div className="font-bold text-[12px] mb-1">Employment Terms</div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5">
                <li>Probation period: <strong>{form.probationMonths} months</strong></li>
                <li>Notice period: <strong>{form.noticePeriodDays} days</strong></li>
                {form.benefits && <li>Benefits: {form.benefits}</li>}
              </ul>
            </div>

            {form.terms && (
              <div className="mb-4">
                <div className="font-bold text-[12px] mb-1">Additional Terms</div>
                <p className="text-[10px] text-slate-600">{form.terms}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 mt-8 pt-4 border-t border-slate-300">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-8">For FINTECH IT SOLUTIONS</div>
                <div className="border-t border-slate-900 pt-1 text-[11px] font-medium">Authorized Signatory</div>
                <div className="text-[10px] text-slate-500">Founder &amp; CEO</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-8">Accepted by candidate</div>
                <div className="border-t border-slate-900 pt-1 text-[11px] font-medium">{form.candidateName || '\u2014'}</div>
                <div className="text-[10px] text-slate-500">Date: ____________________</div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-300 text-[9px] text-slate-400 text-center">
              This is a prototype document generated by the Nexus Enterprise Platform. It is not a legally binding offer.
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500">
            <Building2 size={12} className="inline mr-1" />
            Preview prints on A4. Use <strong>Print → Save as PDF</strong> or the Download PDF button above.
          </div>
        </div>
      </div>

      {/* Print-only stylesheet — hides everything except the preview */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #offer-letter-preview, #offer-letter-preview * { visibility: visible; }
          #offer-letter-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}