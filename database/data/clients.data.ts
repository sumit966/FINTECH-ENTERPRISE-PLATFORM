// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Clients (45 fictional)
// All names are fictional. No real company data.
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
  // ---- India (9) ----
  { clientCode: 'CLI-001', companyName: 'Bharat NeoBank Ltd',        country: 'India',     industry: 'Banking',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 12000000, revenue: 4200000, healthScore: 4.6, status: 'ACTIVE' },
  { clientCode: 'CLI-002', companyName: 'Aryavart Payments',         country: 'India',     industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 9500000,  revenue: 3200000, healthScore: 4.4, status: 'ACTIVE' },
  { clientCode: 'CLI-003', companyName: 'Shikhar Insurance Group',   country: 'India',     industry: 'Insurance',     billingTerms: 'NET_45', slaTier: 'GOLD',     contractValue: 7200000,  revenue: 2100000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-004', companyName: 'MediCare India Networks',   country: 'India',     industry: 'Healthcare',    billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 5400000,  revenue: 1800000, healthScore: 4.3, status: 'ACTIVE' },
  { clientCode: 'CLI-005', companyName: 'Vastram E-Commerce',        country: 'India',     industry: 'E-commerce',    billingTerms: 'NET_15', slaTier: 'GOLD',     contractValue: 4800000,  revenue: 1600000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-006', companyName: 'Sanchay Retail Holdings',   country: 'India',     industry: 'Retail',        billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 3600000,  revenue: 1200000, healthScore: 3.8, status: 'ACTIVE' },
  { clientCode: 'CLI-007', companyName: 'Ashoka Logistics',          country: 'India',     industry: 'Logistics',     billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 3000000,  revenue: 900000,  healthScore: 3.6, status: 'ON_HOLD' },
  { clientCode: 'CLI-008', companyName: 'Tarang Telecom',            country: 'India',     industry: 'Telecom',       billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 6600000,  revenue: 1800000, healthScore: 4.2, status: 'ACTIVE' },
  { clientCode: 'CLI-009', companyName: 'Vidyarthi EdTech',          country: 'India',     industry: 'Education',     billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 2400000,  revenue: 720000,  healthScore: 3.9, status: 'ACTIVE' },

  // ---- USA (7) ----
  { clientCode: 'CLI-010', companyName: 'Northwind Capital LLC',     country: 'USA',       industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 24000000, revenue: 9600000, healthScore: 4.7, status: 'ACTIVE' },
  { clientCode: 'CLI-011', companyName: 'Summit Health Systems',     country: 'USA',       industry: 'Healthcare',    billingTerms: 'NET_45', slaTier: 'PLATINUM', contractValue: 18000000, revenue: 6400000, healthScore: 4.5, status: 'ACTIVE' },
  { clientCode: 'CLI-012', companyName: 'Liberty InsureCorp',        country: 'USA',       industry: 'Insurance',     billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 12000000, revenue: 3600000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-013', companyName: 'Coastal Retail Group',      country: 'USA',       industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 9600000,  revenue: 3200000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-014', companyName: 'Continental Freight',       country: 'USA',       industry: 'Logistics',     billingTerms: 'NET_60', slaTier: 'SILVER',   contractValue: 7200000,  revenue: 2100000, healthScore: 3.7, status: 'ACTIVE' },
  { clientCode: 'CLI-015', companyName: 'Everest Cloud Services',    country: 'USA',       industry: 'Enterprise',    billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 15000000, revenue: 5200000, healthScore: 4.6, status: 'ACTIVE' },
  { clientCode: 'CLI-016', companyName: 'Prairie Media Ventures',    country: 'USA',       industry: 'Media',         billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 4800000,  revenue: 1200000, healthScore: 3.9, status: 'ACTIVE' },

  // ---- UK (5) ----
  { clientCode: 'CLI-017', companyName: 'Thames Capital plc',        country: 'UK',        industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 18000000, revenue: 6400000, healthScore: 4.5, status: 'ACTIVE' },
  { clientCode: 'CLI-018', companyName: 'Albion Insurance',          country: 'UK',        industry: 'Insurance',     billingTerms: 'NET_45', slaTier: 'GOLD',     contractValue: 9600000,  revenue: 2800000, healthScore: 4.2, status: 'ACTIVE' },
  { clientCode: 'CLI-019', companyName: 'Kingsway Retail plc',       country: 'UK',        industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 6600000,  revenue: 1900000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-020', companyName: 'Mayfair Health Trust',      country: 'UK',        industry: 'Healthcare',    billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 7200000,  revenue: 2000000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-021', companyName: 'Sterling Telecom UK',       country: 'UK',        industry: 'Telecom',       billingTerms: 'NET_60', slaTier: 'SILVER',   contractValue: 4200000,  revenue: 1100000, healthScore: 3.8, status: 'PROSPECT' },

  // ---- Canada (3) ----
  { clientCode: 'CLI-022', companyName: 'Maple Ridge Financial',     country: 'Canada',    industry: 'Banking',       billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 8400000,  revenue: 2600000, healthScore: 4.3, status: 'ACTIVE' },
  { clientCode: 'CLI-023', companyName: 'Northern Lights Health',    country: 'Canada',    industry: 'Healthcare',    billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 6000000,  revenue: 1800000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-024', companyName: 'Pacific Retail CA',         country: 'Canada',    industry: 'Retail',        billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 3600000,  revenue: 1000000, healthScore: 3.7, status: 'ACTIVE' },

  // ---- Germany (3) ----
  { clientCode: 'CLI-025', companyName: 'Rheinland Versicherung',    country: 'Germany',   industry: 'Insurance',     billingTerms: 'NET_45', slaTier: 'PLATINUM', contractValue: 14400000, revenue: 4800000, healthScore: 4.5, status: 'ACTIVE' },
  { clientCode: 'CLI-026', companyName: 'Bavaria Manufacturing AG',  country: 'Germany',   industry: 'Manufacturing', billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 9600000,  revenue: 2800000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-027', companyName: 'Hanseatic Logistics GmbH',  country: 'Germany',   industry: 'Logistics',     billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 7200000,  revenue: 2000000, healthScore: 4.1, status: 'ACTIVE' },

  // ---- Singapore (3) ----
  { clientCode: 'CLI-028', companyName: 'Marina Bay Fintech Pte',    country: 'Singapore', industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 10800000, revenue: 3800000, healthScore: 4.6, status: 'ACTIVE' },
  { clientCode: 'CLI-029', companyName: 'Orchard Retail Pte',        country: 'Singapore', industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 5400000,  revenue: 1600000, healthScore: 4.2, status: 'ACTIVE' },
  { clientCode: 'CLI-030', companyName: 'Sentosa Health Pte',        country: 'Singapore', industry: 'Healthcare',    billingTerms: 'NET_45', slaTier: 'GOLD',     contractValue: 4800000,  revenue: 1400000, healthScore: 4.0, status: 'ACTIVE' },

  // ---- UAE (3) ----
  { clientCode: 'CLI-031', companyName: 'Emirates Capital PJSC',     country: 'UAE',       industry: 'Banking',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 13200000, revenue: 4400000, healthScore: 4.5, status: 'ACTIVE' },
  { clientCode: 'CLI-032', companyName: 'Dubai Retail Holdings',     country: 'UAE',       industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 6000000,  revenue: 1800000, healthScore: 4.1, status: 'ACTIVE' },

  // ---- Australia (3) ----
  { clientCode: 'CLI-034', companyName: 'Southern Cross Financial',  country: 'Australia', industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 7200000,  revenue: 2200000, healthScore: 4.3, status: 'ACTIVE' },
  { clientCode: 'CLI-035', companyName: 'Outback Energy Ltd',        country: 'Australia', industry: 'Energy',        billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 8400000,  revenue: 2400000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-036', companyName: 'Coral Coast Media',         country: 'Australia', industry: 'Media',         billingTerms: 'NET_45', slaTier: 'SILVER',   contractValue: 3600000,  revenue: 960000,  healthScore: 3.7, status: 'ACTIVE' },

  // ---- Other international (9) ----
  { clientCode: 'CLI-037', companyName: 'Zurich Auto Systems AG',    country: 'Switzerland', industry: 'Automotive',  billingTerms: 'NET_60', slaTier: 'PLATINUM', contractValue: 16800000, revenue: 5600000, healthScore: 4.6, status: 'ACTIVE' },
  { clientCode: 'CLI-038', companyName: 'Nordic Energy AS',          country: 'Norway',    industry: 'Energy',        billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 9600000,  revenue: 2800000, healthScore: 4.2, status: 'ACTIVE' },
  { clientCode: 'CLI-039', companyName: 'Kyoto Precision Ltd',       country: 'Japan',     industry: 'Manufacturing', billingTerms: 'NET_60', slaTier: 'GOLD',     contractValue: 8400000,  revenue: 2200000, healthScore: 4.1, status: 'ACTIVE' },
  { clientCode: 'CLI-040', companyName: 'Seoul Digital Media',       country: 'South Korea', industry: 'Media',       billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 4800000,  revenue: 1200000, healthScore: 3.9, status: 'ACTIVE' },
  { clientCode: 'CLI-041', companyName: 'Cape Town Realty Ltd',      country: 'South Africa', industry: 'Real Estate', billingTerms: 'NET_45', slaTier: 'SILVER', contractValue: 3000000,  revenue: 800000,  healthScore: 3.6, status: 'ACTIVE' },
  { clientCode: 'CLI-042', companyName: 'Sao Paulo Retail SA',       country: 'Brazil',    industry: 'Retail',        billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 4200000,  revenue: 1080000, healthScore: 3.8, status: 'ACTIVE' },
  { clientCode: 'CLI-043', companyName: 'Mexico City Travel Group',  country: 'Mexico',    industry: 'Travel',        billingTerms: 'NET_30', slaTier: 'SILVER',   contractValue: 3600000,  revenue: 880000,  healthScore: 3.5, status: 'ACTIVE' },
  { clientCode: 'CLI-044', companyName: 'Warsaw Enterprise IT',      country: 'Poland',    industry: 'Enterprise',    billingTerms: 'NET_30', slaTier: 'GOLD',     contractValue: 5400000,  revenue: 1400000, healthScore: 4.0, status: 'ACTIVE' },
  { clientCode: 'CLI-045', companyName: 'Dublin Fintech Ltd',        country: 'Ireland',   industry: 'FinTech',       billingTerms: 'NET_30', slaTier: 'PLATINUM', contractValue: 10800000, revenue: 3400000, healthScore: 4.4, status: 'ACTIVE' },
  { clientCode: 'CLI-046', companyName: 'Shannon Health Systems',    country: 'Ireland',   industry: 'Healthcare',    billingTerms: 'NET_45', slaTier: 'GOLD',     contractValue: 7200000,  revenue: 2100000, healthScore: 4.2, status: 'ACTIVE' },
];

if (clientsData.length !== 46) throw new Error('Expected 46 clients');