// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Vendors (25 fictional)
// ============================================================================

export interface VendorData {
  vendorCode: string;
  name: string;
  category: 'SOFTWARE' | 'HARDWARE' | 'SERVICES' | 'CLOUD' | 'CONSULTING';
  contactName: string;
  email: string;
  phone: string;
  country: string;
  gstNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  rating: number;
}

export const vendorsData: VendorData[] = [
  { vendorCode: 'VEN-001', name: 'CloudNine Hosting Services',  category: 'CLOUD',     contactName: 'Vendor Contact',  email: 'sales@cloudnine.example',       phone: '+91-20-4100-1001', country: 'India',     gstNumber: '27AABCU9603R1Z5', status: 'ACTIVE',   rating: 4.7 },
  { vendorCode: 'VEN-002', name: 'HyperScale Cloud India',      category: 'CLOUD',     contactName: 'Vendor Contact',  email: 'enterprise@hyperscale.example', phone: '+91-80-4100-1002', country: 'India',     gstNumber: '29AABCU9603R1Z6', status: 'ACTIVE',   rating: 4.6 },
  { vendorCode: 'VEN-003', name: 'GlobalData Centres',          category: 'CLOUD',     contactName: 'Vendor Contact',  email: 'sales@globaldc.example',        phone: '+1-415-555-1003',  country: 'USA',       gstNumber: 'US-GST-1003',     status: 'ACTIVE',   rating: 4.5 },
  { vendorCode: 'VEN-004', name: 'Dell Enterprise Solutions',   category: 'HARDWARE',  contactName: 'Vendor Contact',  email: 'enterprise@dellpartner.example',phone: '+91-20-4100-1004', country: 'India',     gstNumber: '27AABCD1234R2Z7', status: 'ACTIVE',   rating: 4.4 },
  { vendorCode: 'VEN-005', name: 'HP Corporate Systems',        category: 'HARDWARE',  contactName: 'Vendor Contact',  email: 'corp@hpsystems.example',        phone: '+91-20-4100-1005', country: 'India',     gstNumber: '27AABCH1234R2Z8', status: 'ACTIVE',   rating: 4.3 },
  { vendorCode: 'VEN-006', name: 'Lenovo Business Partner',     category: 'HARDWARE',  contactName: 'Vendor Contact',  email: 'biz@lenovopartner.example',     phone: '+91-20-4100-1006', country: 'India',     gstNumber: '27AABCL1234R2Z9', status: 'ACTIVE',   rating: 4.3 },
  { vendorCode: 'VEN-007', name: 'Apple Enterprise India',      category: 'HARDWARE',  contactName: 'Vendor Contact',  email: 'enterprise@applepart.example',  phone: '+91-80-4100-1007', country: 'India',     gstNumber: '29AABCA1234R2ZA', status: 'ACTIVE',   rating: 4.6 },
  { vendorCode: 'VEN-008', name: 'Atlassian Reseller India',    category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'sales@atlassianres.example',    phone: '+91-20-4100-1008', country: 'India',     gstNumber: '27AABCA1234R3ZB', status: 'ACTIVE',   rating: 4.5 },
  { vendorCode: 'VEN-009', name: 'Microsoft Licensing India',   category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'licensing@msind.example',       phone: '+91-20-4100-1009', country: 'India',     gstNumber: '27AABCM1234R3ZC', status: 'ACTIVE',   rating: 4.7 },
  { vendorCode: 'VEN-010', name: 'GitHub Enterprise Sales',     category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'sales@gh-enterprise.example',   phone: '+1-415-555-1010',  country: 'USA',       gstNumber: 'US-GST-1010',     status: 'ACTIVE',   rating: 4.8 },
  { vendorCode: 'VEN-011', name: 'JetBrains Reseller',          category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'sales@jb-reseller.example',     phone: '+49-30-4100-1011', country: 'Germany',   gstNumber: 'DE-GST-1011',     status: 'ACTIVE',   rating: 4.6 },
  { vendorCode: 'VEN-012', name: 'Slack Business Partner',      category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'biz@slack-partner.example',     phone: '+1-415-555-1012',  country: 'USA',       gstNumber: 'US-GST-1012',     status: 'ACTIVE',   rating: 4.4 },
  { vendorCode: 'VEN-013', name: 'Figma Enterprise India',      category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'enterprise@figmapart.example',  phone: '+91-80-4100-1013', country: 'India',     gstNumber: '29AABCF1234R3ZD', status: 'ACTIVE',   rating: 4.5 },
  { vendorCode: 'VEN-014', name: 'Datadog India Partner',       category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'sales@dd-partner.example',      phone: '+91-80-4100-1014', country: 'India',     gstNumber: '29AABCF1234R3ZE', status: 'ACTIVE',   rating: 4.5 },
  { vendorCode: 'VEN-015', name: 'Snowflake India Sales',       category: 'CLOUD',     contactName: 'Vendor Contact',  email: 'enterprise@snowflake.example',  phone: '+91-20-4100-1015', country: 'India',     gstNumber: '27AABCS1234R3ZF', status: 'ACTIVE',   rating: 4.6 },
  { vendorCode: 'VEN-016', name: 'OpenAI Enterprise',           category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'sales@openai-enterprise.example', phone: '+1-415-555-1016', country: 'USA',       gstNumber: 'US-GST-1016',     status: 'ACTIVE',   rating: 4.7 },
  { vendorCode: 'VEN-017', name: 'Anthropic Business',          category: 'SOFTWARE',  contactName: 'Vendor Contact',  email: 'sales@anthropic-biz.example',   phone: '+1-415-555-1017',  country: 'USA',       gstNumber: 'US-GST-1017',     status: 'ACTIVE',   rating: 4.6 },
  { vendorCode: 'VEN-018', name: 'Vertex AI Services',          category: 'CLOUD',     contactName: 'Vendor Contact',  email: 'sales@vertexai.example',        phone: '+91-80-4100-1018', country: 'India',     gstNumber: '29AABCV1234R3ZG', status: 'ACTIVE',   rating: 4.4 },
  { vendorCode: 'VEN-019', name: 'Deloitte Consulting India',   category: 'CONSULTING',contactName: 'Vendor Contact',  email: 'sales@deloittepartner.example', phone: '+91-20-4100-1019', country: 'India',     gstNumber: '27AABCV1234R3ZH', status: 'ACTIVE',   rating: 4.5 },
  { vendorCode: 'VEN-020', name: 'PwC Advisory Services',       category: 'CONSULTING',contactName: 'Vendor Contact',  email: 'sales@pwcadvisory.example',     phone: '+91-20-4100-1020', country: 'India',     gstNumber: '27AABCP1234R3ZI', status: 'ACTIVE',   rating: 4.5 },
  { vendorCode: 'VEN-021', name: 'Pune Facility Services',      category: 'SERVICES',  contactName: 'Vendor Contact',  email: 'ops@punefacility.example',      phone: '+91-20-4100-1021', country: 'India',     gstNumber: '27AABCP1234R3ZJ', status: 'ACTIVE',   rating: 4.2 },
  { vendorCode: 'VEN-022', name: 'Travel Desk India',           category: 'SERVICES',  contactName: 'Vendor Contact',  email: 'corp@traveldesk.example',       phone: '+91-20-4100-1022', country: 'India',     gstNumber: '27AABCT1234R3ZK', status: 'ACTIVE',   rating: 4.1 },
  { vendorCode: 'VEN-023', name: 'Sterling Background Checks',  category: 'SERVICES',  contactName: 'Vendor Contact',  email: 'sales@sterlingbg.example',      phone: '+91-20-4100-1023', country: 'India',     gstNumber: '27AABCS1234R3ZL', status: 'ACTIVE',   rating: 4.3 },
  { vendorCode: 'VEN-024', name: 'Nova Learning Platform',      category: 'SERVICES',  contactName: 'Vendor Contact',  email: 'sales@novalearn.example',       phone: '+1-415-555-1024',  country: 'USA',       gstNumber: 'US-GST-1024',     status: 'ACTIVE',   rating: 4.4 },
  { vendorCode: 'VEN-025', name: 'Cybersecurity Audit Partners',category: 'SERVICES',  contactName: 'Vendor Contact',  email: 'audit@csaudit.example',         phone: '+91-20-4100-1025', country: 'India',     gstNumber: '27AABCC1234R3ZM', status: 'ACTIVE',   rating: 4.6 },
];

if (vendorsData.length !== 25) throw new Error('Expected 25 vendors');