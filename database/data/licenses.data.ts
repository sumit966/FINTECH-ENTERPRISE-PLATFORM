// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Software Licenses (30)
// ============================================================================

export interface LicenseData {
  licenseCode: string;
  product: string;
  vendorCode: string | null;
  seats: number;
  usedSeats: number;
  costPerSeat: number;
  currency: string;
  purchasedAt: Date;
  renewalAt: Date;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CANCELLED';
}

function d(y: number, m: number, day: number): Date {
  return new Date(Date.UTC(y, m - 1, day));
}

export const licensesData: LicenseData[] = [
  { licenseCode: 'LIC-001', product: 'Atlassian Jira',         vendorCode: 'VEN-008', seats: 500, usedSeats: 480, costPerSeat: 45,  currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-002', product: 'Atlassian Confluence',   vendorCode: 'VEN-008', seats: 500, usedSeats: 460, costPerSeat: 30,  currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-003', product: 'GitHub Enterprise',      vendorCode: 'VEN-010', seats: 300, usedSeats: 275, costPerSeat: 21,  currency: 'USD', purchasedAt: d(2024,2,1),  renewalAt: d(2025,2,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-004', product: 'Slack Business',         vendorCode: 'VEN-012', seats: 500, usedSeats: 495, costPerSeat: 12,  currency: 'USD', purchasedAt: d(2024,1,15), renewalAt: d(2025,1,15), status: 'ACTIVE' },
  { licenseCode: 'LIC-005', product: 'Figma Organization',     vendorCode: 'VEN-013', seats: 100, usedSeats: 78,  costPerSeat: 45,  currency: 'USD', purchasedAt: d(2024,3,1),  renewalAt: d(2025,3,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-006', product: 'Datadog Pro',            vendorCode: 'VEN-014', seats: 150, usedSeats: 130, costPerSeat: 90,  currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-007', product: 'Snowflake Enterprise',   vendorCode: 'VEN-015', seats: 50,  usedSeats: 42,  costPerSeat: 480, currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-008', product: 'OpenAI API Enterprise',  vendorCode: 'VEN-016', seats: 1,   usedSeats: 1,   costPerSeat: 6000,currency: 'USD', purchasedAt: d(2024,6,1),  renewalAt: d(2025,6,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-009', product: 'Anthropic Claude API',   vendorCode: 'VEN-017', seats: 1,   usedSeats: 1,   costPerSeat: 4800,currency: 'USD', purchasedAt: d(2024,6,1),  renewalAt: d(2025,6,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-010', product: 'IntelliJ IDEA Ultimate', vendorCode: 'VEN-011', seats: 120, usedSeats: 115, costPerSeat: 500, currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-011', product: 'Microsoft 365 E3',       vendorCode: 'VEN-009', seats: 500, usedSeats: 500, costPerSeat: 36,  currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-012', product: 'Microsoft Azure Credits',vendorCode: 'VEN-009', seats: 1,   usedSeats: 1,   costPerSeat: 120000, currency: 'USD', purchasedAt: d(2024,1,1), renewalAt: d(2025,1,1), status: 'ACTIVE' },
  { licenseCode: 'LIC-013', product: 'AWS Enterprise Support', vendorCode: 'VEN-002', seats: 1,   usedSeats: 1,   costPerSeat: 180000, currency: 'USD', purchasedAt: d(2024,1,1), renewalAt: d(2025,1,1), status: 'ACTIVE' },
  { licenseCode: 'LIC-014', product: 'GCP Enterprise',         vendorCode: 'VEN-018', seats: 1,   usedSeats: 1,   costPerSeat: 96000, currency: 'USD', purchasedAt: d(2024,3,1),  renewalAt: d(2025,3,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-015', product: 'Sentry Team',            vendorCode: null,      seats: 50,  usedSeats: 45,  costPerSeat: 26,  currency: 'USD', purchasedAt: d(2024,2,1),  renewalAt: d(2025,2,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-016', product: 'New Relic Pro',          vendorCode: null,      seats: 100, usedSeats: 90,  costPerSeat: 99,  currency: 'USD', purchasedAt: d(2024,2,1),  renewalAt: d(2025,2,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-017', product: 'Postman Enterprise',     vendorCode: null,      seats: 200, usedSeats: 180, costPerSeat: 20,  currency: 'USD', purchasedAt: d(2024,4,1),  renewalAt: d(2025,4,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-018', product: 'Snyk Team',              vendorCode: null,      seats: 100, usedSeats: 85,  costPerSeat: 25,  currency: 'USD', purchasedAt: d(2024,5,1),  renewalAt: d(2025,5,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-019', product: 'Auth0 Enterprise',       vendorCode: null,      seats: 1,   usedSeats: 1,   costPerSeat: 24000, currency: 'USD', purchasedAt: d(2024,3,1), renewalAt: d(2025,3,1), status: 'ACTIVE' },
  { licenseCode: 'LIC-020', product: 'Okta Workforce',         vendorCode: null,      seats: 500, usedSeats: 490, costPerSeat: 6,   currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-021', product: 'Zoom Business',          vendorCode: null,      seats: 200, usedSeats: 180, costPerSeat: 20,  currency: 'USD', purchasedAt: d(2024,2,15), renewalAt: d(2025,2,15), status: 'ACTIVE' },
  { licenseCode: 'LIC-022', product: 'Notion Team',            vendorCode: null,      seats: 300, usedSeats: 260, costPerSeat: 15,  currency: 'USD', purchasedAt: d(2024,4,1),  renewalAt: d(2025,4,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-023', product: 'Miro Business',          vendorCode: null,      seats: 100, usedSeats: 80,  costPerSeat: 20,  currency: 'USD', purchasedAt: d(2024,4,1),  renewalAt: d(2025,4,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-024', product: 'Grammarly Business',     vendorCode: null,      seats: 50,  usedSeats: 40,  costPerSeat: 15,  currency: 'USD', purchasedAt: d(2024,5,1),  renewalAt: d(2025,5,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-025', product: '1Password Teams',        vendorCode: null,      seats: 500, usedSeats: 480, costPerSeat: 8,   currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-026', product: 'SentinelOne',            vendorCode: null,      seats: 500, usedSeats: 500, costPerSeat: 35,  currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-027', product: 'Duo Security',           vendorCode: null,      seats: 500, usedSeats: 500, costPerSeat: 3,   currency: 'USD', purchasedAt: d(2024,1,1),  renewalAt: d(2025,1,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-028', product: 'PagerDuty',              vendorCode: null,      seats: 50,  usedSeats: 45,  costPerSeat: 39,  currency: 'USD', purchasedAt: d(2024,2,1),  renewalAt: d(2025,2,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-029', product: 'Vercel Pro',             vendorCode: null,      seats: 50,  usedSeats: 48,  costPerSeat: 20,  currency: 'USD', purchasedAt: d(2024,3,1),  renewalAt: d(2025,3,1),  status: 'ACTIVE' },
  { licenseCode: 'LIC-030', product: 'MongoDB Atlas',          vendorCode: null,      seats: 1,   usedSeats: 1,   costPerSeat: 6000,currency: 'USD', purchasedAt: d(2024,4,1),  renewalAt: d(2025,4,1),  status: 'ACTIVE' },
];

if (licensesData.length !== 30) throw new Error('Expected 30 licenses');