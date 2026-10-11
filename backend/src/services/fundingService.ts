import { prisma } from '../config/prisma';

export async function listFunding() {
  const rows = await prisma.fundingRecord.findMany({
    orderBy: { recordedAt: 'desc' },
    include: { disbursements: true, documents: true },
  });
  return rows.map((r) => ({
    id: r.id,
    fundingCode: r.fundingCode,
    source: r.source,
    sourceType: r.sourceType,
    country: r.country,
    amount: Number(r.amount),
    currency: r.currency,
    fundingType: r.fundingType,
    status: r.status,
    recordedAt: r.recordedAt,
    verifiedAt: r.verifiedAt,
    approvedAt: r.approvedAt,
    notes: r.notes,
    totalDisbursed: r.disbursements.filter((d) => d.receivedAt).reduce((s, d) => s + Number(d.amount), 0),
    totalPlanned: r.disbursements.reduce((s, d) => s + Number(d.amount), 0),
    disbursementCount: r.disbursements.length,
    documentCount: r.documents.length,
  }));
}

export async function getFundingDetail(fundingCode: string) {
  const r = await prisma.fundingRecord.findUnique({
    where: { fundingCode },
    include: { disbursements: { orderBy: { expectedDate: 'asc' } }, documents: true },
  });
  if (!r) return null;
  const totalDisbursed = r.disbursements.filter((d) => d.receivedAt).reduce((s, d) => s + Number(d.amount), 0);
  const totalPlanned = r.disbursements.reduce((s, d) => s + Number(d.amount), 0);
  return {
    id: r.id,
    fundingCode: r.fundingCode,
    source: r.source,
    sourceType: r.sourceType,
    country: r.country,
    amount: Number(r.amount),
    currency: r.currency,
    fundingType: r.fundingType,
    status: r.status,
    recordedAt: r.recordedAt,
    verifiedAt: r.verifiedAt,
    approvedAt: r.approvedAt,
    notes: r.notes,
    supportingDocumentUrl: r.supportingDocumentUrl,
    totalDisbursed,
    totalPlanned,
    pending: totalPlanned - totalDisbursed,
    disbursements: r.disbursements.map((d) => ({
      id: d.id,
      amount: Number(d.amount),
      expectedDate: d.expectedDate,
      receivedAt: d.receivedAt,
      status: d.status,
      reference: d.reference,
      notes: d.notes,
    })),
    documents: r.documents.map((d) => ({
      id: d.id, title: d.title, category: d.category, url: d.url, verifiedAt: d.verifiedAt,
    })),
  };
}

export async function getFundingSummary() {
  const rows = await prisma.fundingRecord.findMany({ include: { disbursements: true } });
  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  const byStatus = ['RECORDED', 'VERIFIED', 'APPROVED', 'DISBURSED', 'RECEIVED', 'REJECTED'].map((st) => ({
    status: st,
    count: rows.filter((r) => r.status === st).length,
    amount: rows.filter((r) => r.status === st).reduce((s, r) => s + Number(r.amount), 0),
  }));
  const received = rows.reduce(
    (s, r) => s + r.disbursements.filter((d) => d.receivedAt).reduce((x, d) => x + Number(d.amount), 0),
    0
  );
  return { total, received, pending: total - received, byStatus, count: rows.length };
}

export async function ensureFundingSeeded() {
  const existing = await prisma.fundingRecord.count();
  if (existing > 0) return { created: 0, existing };
  const seed = [
    {
      fundingCode: 'FND-001',
      source: 'Dubai Street-Food Company',
      sourceType: 'COMMERCIAL',
      country: 'UAE',
      amount: 250000000,
      currency: 'INR',
      fundingType: 'EQUITY' as const,
      status: 'RECORDED' as const,
      notes: 'Strategic investment from a Dubai-based street-food company. Source identity anonymised pending legal disclosure.',
    },
    {
      fundingCode: 'FND-002',
      source: 'College Institutional Funding',
      sourceType: 'INSTITUTIONAL',
      country: 'India',
      amount: 100000000,
      currency: 'INR',
      fundingType: 'GRANT' as const,
      status: 'RECORDED' as const,
      notes: 'Institutional funding for R&D collaboration. College name withheld pending signed agreement.',
    },
    {
      fundingCode: 'FND-003',
      source: 'Delhi Government / Startup India Innovation Cell',
      sourceType: 'GOVERNMENT',
      country: 'India',
      amount: 250000000,
      currency: 'INR',
      fundingType: 'GRANT' as const,
      status: 'RECORDED' as const,
      notes: 'Recorded under Startup India Innovation Cell programme. Not yet verified - no official grant letter on file. Does not imply an awarded partnership.',
    },
  ];
  let created = 0;
  for (const s of seed) {
    await prisma.fundingRecord.create({ data: s });
    created++;
  }
  return { created, existing: 0 };
}