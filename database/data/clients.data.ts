// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Clients (46, geographic distribution balanced)
// India: 38  |  USA: 2  |  UK: 1  |  UAE: 2  |  Ireland: 2  |  Singapore: 1
// ============================================================================

export type ClientStatus = 'PROSPECT' | 'ACTIVE' | 'ON_HOLD' | 'CHURNED';

export interface ClientData {
  clientCode: string;
  companyName: string;
  country: string;
  industry: string;
  billingTerms: string;
  slaTier: string;
  contractValue: number;
  revenue: number;
  healthScore: number;
  status: ClientStatus;
}

export const clientsData: ClientData[] = [
  // ---- India (38) ----
  { clientCode: 'CLI-001', companyName: 'Bharat NeoBank Ltd',        country: 'India',     industry: 'Banking',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 180000000, revenue: 62000000, healthScore: 4.6, status: 'ACTIVE' },
  { clientCode: 'CLI-002', companyName: 'Aryavart Payments',         country: 'India',     industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 145000000, revenue: 51000000, healthScore: 4.4, status: 'ACTIVE' },
  { clientCode: 'CLI-003', companyName: 'Shikhar Insurance Group',   country: 'India',     industry: 'Insurance',     billingTerms: 'NET_45', slaTier: 'GOLD',     contractValue: 98000000,  revenue: 31000000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-004', companyName: 'MediCare India Networks',   country: 'India',     industry: 'Healthcare',    billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 74000000,  revenue: 24000000, healthScore: 4.3, status: 'ACTIVE' },
  { clientCode: 'CLI-005', companyName: 'Vastram E-Commerce',        country: 'India',     industry: 'E-commerce',    billingTerms: 'NET_15', slaTier: 'GOLD',     contractValue: 62000000,  revenue: 21000000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-006', companyName: 'Sanchay Retail Holdings',   country: 'India',     industry: 'Retail',        billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 48000000,  revenue: 16000000, healthScore: 3.8, status: 'ACTIVE' },
  { clientCode: 'CLI-007', companyName: 'Ashoka Logistics',          country: 'India',     industry: 'Logistics',     billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 42000000,  revenue: 13000000, healthScore: 3.6, status: 'ON_HOLD' },
  { clientCode: 'CLI-008', companyName: 'Tarang Telecom',            country: 'India',     industry: 'Telecom',       billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 86000000,  revenue: 26000000, healthScore: 4.2, status: 'ACTIVE' },
  { clientCode: 'CLI-009', companyName: 'Vidyarthi EdTech',          country: 'India',     industry: 'Education',     billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 34000000,  revenue: 11000000, healthScore: 3.9, status: 'ACTIVE' },
  { clientCode: 'CLI-010', companyName: 'Sahyadri Manufacturing',    country: 'India',     industry: 'Manufacturing', billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 92000000,  revenue: 28000000, healthScore: 4.3, status: 'ACTIVE' },
  { clientCode: 'CLI-011', companyName: 'Ujjwal Energy Ltd',         country: 'India',     industry: 'Energy',        billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 78000000,  revenue: 23000000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-012', companyName: 'Nirvana Insurance',         country: 'India',     industry: 'Insurance',     billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 36000000,  revenue: 12000000, healthScore: 3.7, status: 'ACTIVE' },
  { clientCode: 'CLI-013', companyName: 'Pramanik Realty',           country: 'India',     industry: 'Real Estate',   billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 44000000,  revenue: 14000000, healthScore: 3.9, status: 'ACTIVE' },
  { clientCode: 'CLI-014', companyName: 'Sarthi Retail',             country: 'India',     industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 32000000,  revenue: 10000000, healthScore: 3.8, status: 'ACTIVE' },
  { clientCode: 'CLI-015', companyName: 'Amrit Foods',               country: 'India',     industry: 'Manufacturing', billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 38000000,  revenue: 12000000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-016', companyName: 'Nirman Projects',           country: 'India',     industry: 'Real Estate',   billingTerms: 'NET_60', slaTier: 'SILVER',   contractValue: 34000000,  revenue: 11000000, healthScore: 3.7, status: 'ACTIVE' },
  { clientCode: 'CLI-017', companyName: 'Prayas Healthcare',         country: 'India',     industry: 'Healthcare',    billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 56000000,  revenue: 18000000, healthScore: 4.2, status: 'ACTIVE' },
  { clientCode: 'CLI-018', companyName: 'Chaitanya Payments',        country: 'India',     industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 68000000,  revenue: 22000000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-019', companyName: 'Anand Retail',              country: 'India',     industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 28000000,  revenue: 9000000,  healthScore: 3.6, status: 'ACTIVE' },
  { clientCode: 'CLI-020', companyName: 'Veer Insurance',            country: 'India',     industry: 'Insurance',     billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 30000000,  revenue: 10000000, healthScore: 3.8, status: 'ACTIVE' },
  { clientCode: 'CLI-021', companyName: 'Surya Solar',               country: 'India',     industry: 'Energy',        billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 72000000,  revenue: 22000000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-022', companyName: 'Samvad Media',              country: 'India',     industry: 'Media',         billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 26000000,  revenue: 8000000,  healthScore: 3.5, status: 'ACTIVE' },
  { clientCode: 'CLI-023', companyName: 'Vishwa Travels',            country: 'India',     industry: 'Travel',        billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 24000000,  revenue: 7000000,  healthScore: 3.4, status: 'ACTIVE' },
  { clientCode: 'CLI-024', companyName: 'Kanan Logistics',           country: 'India',     industry: 'Logistics',     billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 32000000,  revenue: 10000000, healthScore: 3.7, status: 'ACTIVE' },
  { clientCode: 'CLI-025', companyName: 'Shakti Telecom',            country: 'India',     industry: 'Telecom',       billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 66000000,  revenue: 20000000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-026', companyName: 'Ajay Motors',               country: 'India',     industry: 'Automotive',    billingTerms: 'NET_45', slaTier: 'GOLD',     contractValue: 58000000,  revenue: 18000000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-027', companyName: 'Sarita Bank',               country: 'India',     industry: 'Banking',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 132000000, revenue: 42000000, healthScore: 4.5, status: 'ACTIVE' },
  { clientCode: 'CLI-028', companyName: 'Nalanda Education',         country: 'India',     industry: 'Education',     billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 22000000,  revenue: 7000000,  healthScore: 3.6, status: 'ACTIVE' },
  { clientCode: 'CLI-029', companyName: 'Veda Pharma',               country: 'India',     industry: 'Healthcare',    billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 52000000,  revenue: 16000000, healthScore: 4.2, status: 'ACTIVE' },
  { clientCode: 'CLI-030', companyName: 'Bharat Bazaar',             country: 'India',     industry: 'E-commerce',    billingTerms: 'NET_15', slaTier: 'GOLD',     contractValue: 64000000,  revenue: 20000000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-031', companyName: 'Kaveri Textiles',           country: 'India',     industry: 'Manufacturing', billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 34000000,  revenue: 11000000, healthScore: 3.8, status: 'ACTIVE' },
  { clientCode: 'CLI-032', companyName: 'Prakash Insurance',         country: 'India',     industry: 'Insurance',     billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 28000000,  revenue: 9000000,  healthScore: 3.7, status: 'ACTIVE' },
  { clientCode: 'CLI-033', companyName: 'Deccan Realty',             country: 'India',     industry: 'Real Estate',   billingTerms: 'NET_60', slaTier: 'SILVER',   contractValue: 36000000,  revenue: 11000000, healthScore: 3.8, status: 'ACTIVE' },
  { clientCode: 'CLI-034', companyName: 'Ganga Retail',              country: 'India',     industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 26000000,  revenue: 8000000,  healthScore: 3.6, status: 'ACTIVE' },
  { clientCode: 'CLI-035', companyName: 'Himalaya Bank',             country: 'India',     industry: 'Banking',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 148000000, revenue: 48000000, healthScore: 4.6, status: 'ACTIVE' },
  { clientCode: 'CLI-036', companyName: 'Isha Travel',               country: 'India',     industry: 'Travel',        billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 22000000,  revenue: 7000000,  healthScore: 3.5, status: 'ACTIVE' },
  { clientCode: 'CLI-037', companyName: 'Jyoti Logistics',           country: 'India',     industry: 'Logistics',     billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 30000000,  revenue: 9000000,  healthScore: 3.7, status: 'ACTIVE' },
  { clientCode: 'CLI-038', companyName: 'Kiran Payments',            country: 'India',     industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 72000000,  revenue: 22000000, healthScore: 4.2, status: 'ACTIVE' },

  // ---- USA (2) ----
  { clientCode: 'CLI-039', companyName: 'Northwind Capital LLC',     country: 'USA',       industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 280000000, revenue: 98000000, healthScore: 4.7, status: 'ACTIVE' },
  { clientCode: 'CLI-040', companyName: 'Summit Health Systems',     country: 'USA',       industry: 'Healthcare',    billingTerms: 'NET_45', slaTier: 'PLATINUM', contractValue: 220000000, revenue: 76000000, healthScore: 4.5, status: 'ACTIVE' },

  // ---- UK (1) ----
  { clientCode: 'CLI-041', companyName: 'Thames Capital plc',        country: 'UK',        industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 210000000, revenue: 72000000, healthScore: 4.5, status: 'ACTIVE' },

  // ---- UAE (2) ----
  { clientCode: 'CLI-042', companyName: 'Emirates Capital PJSC',     country: 'UAE',       industry: 'Banking',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 165000000, revenue: 56000000, healthScore: 4.5, status: 'ACTIVE' },
  { clientCode: 'CLI-043', companyName: 'Dubai Retail Holdings',     country: 'UAE',       industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 78000000,  revenue: 24000000, healthScore: 4.1, status: 'ACTIVE' },

  // ---- Ireland (2) ----
  { clientCode: 'CLI-044', companyName: 'Dublin Fintech Ltd',        country: 'Ireland',   industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 135000000, revenue: 44000000, healthScore: 4.4, status: 'ACTIVE' },
  { clientCode: 'CLI-045', companyName: 'Shannon Health Systems',    country: 'Ireland',   industry: 'Healthcare',    billingTerms: 'NET_45', slaTier: 'GOLD',     contractValue: 88000000,  revenue: 26000000, healthScore: 4.2, status: 'ACTIVE' },

  // ---- Singapore (1) ----
  { clientCode: 'CLI-046', companyName: 'Marina Bay Fintech Pte',    country: 'Singapore', industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 128000000, revenue: 42000000, healthScore: 4.6, status: 'ACTIVE' },
];

if (clientsData.length !== 46) throw new Error('Expected 46 clients, got ' + clientsData.length);