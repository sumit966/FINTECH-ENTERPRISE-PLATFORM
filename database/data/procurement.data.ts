// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Purchase Orders (deterministic)
// 2 POs per vendor = 50 rows.
// ============================================================================

import { vendorsData } from './vendors.data';

export interface PurchaseOrderData {
  poNumber: string;
  vendorCode: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  issuedAt: Date;
  deliveredAt: Date | null;
  status: 'OPEN' | 'DELIVERED' | 'CANCELLED' | 'PENDING_APPROVAL';
  approvedByCode: string;
}

const PO_TEMPLATES = [
  { title: 'Annual subscription renewal',  desc: 'Annual contract renewal with standard SLAs.' },
  { title: 'Professional services - Q1',   desc: 'Statement of work for a fixed-scope engagement.' },
];

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 3600 * 1000);
}

export const purchaseOrdersData: PurchaseOrderData[] = [];

for (let i = 0; i < vendorsData.length; i++) {
  const v = vendorsData[i];
  for (let k = 0; k < PO_TEMPLATES.length; k++) {
    const tpl = PO_TEMPLATES[k];
    const issuedAt = new Date(Date.UTC(2024, (i + k * 3) % 12, 1 + ((i * 7 + k * 11) % 28)));
    const baseAmount = 200000 + ((i * 137 + k * 293) % 1800000);
    const currency = v.country === 'India' ? 'INR' : 'USD';
    const deliveredAt = issuedAt < new Date(Date.UTC(2024, 9, 1)) ? addDays(issuedAt, 45) : null;
    const status = deliveredAt ? 'DELIVERED' : 'OPEN';

    purchaseOrdersData.push({
      poNumber: 'PO-' + String(i + 1).padStart(3, '0') + '-' + String(k + 1).padStart(2, '0'),
      vendorCode: v.vendorCode,
      title: tpl.title,
      description: tpl.desc,
      amount: baseAmount,
      currency,
      issuedAt,
      deliveredAt,
      status,
      approvedByCode: 'FITS-0004',
    });
  }
}

if (purchaseOrdersData.length !== 50) throw new Error('Expected 50 purchase orders, got ' + purchaseOrdersData.length);