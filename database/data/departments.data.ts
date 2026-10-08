export interface DepartmentData {
  code: string; name: string;
  category: 'TECHNOLOGY' | 'BUSINESS' | 'CORPORATE';
  description: string; costCenter: string;
}
export const departmentsData: DepartmentData[] = [
  { code: 'ENG',   name: 'Software Engineering',         category: 'TECHNOLOGY', description: 'Core software engineering', costCenter: 'CC-ENG-100' },
  { code: 'FE',    name: 'Frontend Engineering',         category: 'TECHNOLOGY', description: 'Web and mobile UI',          costCenter: 'CC-ENG-101' },
  { code: 'BE',    name: 'Backend Engineering',          category: 'TECHNOLOGY', description: 'APIs and services',          costCenter: 'CC-ENG-102' },
  { code: 'FS',    name: 'Full Stack Engineering',       category: 'TECHNOLOGY', description: 'End-to-end delivery',        costCenter: 'CC-ENG-103' },
  { code: 'MOB',   name: 'Mobile Engineering',           category: 'TECHNOLOGY', description: 'iOS and Android',            costCenter: 'CC-ENG-104' },
  { code: 'AIML',  name: 'AI / Machine Learning',        category: 'TECHNOLOGY', description: 'Applied AI and ML',          costCenter: 'CC-AI-200'  },
  { code: 'DATA',  name: 'Data Engineering',             category: 'TECHNOLOGY', description: 'Data pipelines and DW',      costCenter: 'CC-DATA-201'},
  { code: 'CLOUD', name: 'Cloud Engineering',            category: 'TECHNOLOGY', description: 'AWS, Azure, GCP',            costCenter: 'CC-CLD-300' },
  { code: 'DEVOPS',name: 'DevOps',                       category: 'TECHNOLOGY', description: 'CI/CD and automation',       costCenter: 'CC-OPS-301' },
  { code: 'SRE',   name: 'Site Reliability Engineering', category: 'TECHNOLOGY', description: 'Reliability engineering',    costCenter: 'CC-OPS-302' },
  { code: 'SEC',   name: 'Cybersecurity',                category: 'TECHNOLOGY', description: 'AppSec, SecOps, GRC',        costCenter: 'CC-SEC-400' },
  { code: 'QA',    name: 'Quality Engineering',          category: 'TECHNOLOGY', description: 'Manual and automated QA',    costCenter: 'CC-QA-500'  },
  { code: 'UX',    name: 'UI / UX Design',               category: 'TECHNOLOGY', description: 'Product design',             costCenter: 'CC-UX-501'  },
  { code: 'ARCH',  name: 'Solution Architecture',        category: 'TECHNOLOGY', description: 'Enterprise architecture',    costCenter: 'CC-ARC-502' },
  { code: 'SUP',   name: 'Technical Support',            category: 'TECHNOLOGY', description: 'L1 / L2 / L3 support',       costCenter: 'CC-SUP-503' },
  { code: 'PM',    name: 'Product Management',           category: 'BUSINESS',   description: 'Product strategy',           costCenter: 'CC-BIZ-600' },
  { code: 'BA',    name: 'Business Analysis',            category: 'BUSINESS',   description: 'Requirements and process',   costCenter: 'CC-BIZ-601' },
  { code: 'CONS',  name: 'Consulting',                   category: 'BUSINESS',   description: 'Technology consulting',      costCenter: 'CC-BIZ-602' },
  { code: 'SALES', name: 'Sales',                        category: 'BUSINESS',   description: 'Enterprise sales',           costCenter: 'CC-REV-700' },
  { code: 'BD',    name: 'Business Development',         category: 'BUSINESS',   description: 'Partnerships',               costCenter: 'CC-REV-701' },
  { code: 'AM',    name: 'Account Management',           category: 'BUSINESS',   description: 'Client ownership',           costCenter: 'CC-REV-702' },
  { code: 'CS',    name: 'Customer Success',             category: 'BUSINESS',   description: 'Retention and advocacy',     costCenter: 'CC-REV-703' },
  { code: 'PRE',   name: 'Pre-Sales',                    category: 'BUSINESS',   description: 'Solutioning and POCs',       costCenter: 'CC-REV-704' },
  { code: 'HR',    name: 'Human Resources',              category: 'CORPORATE',  description: 'HRBP and policy',            costCenter: 'CC-CORP-800' },
  { code: 'TA',    name: 'Talent Acquisition',           category: 'CORPORATE',  description: 'Recruitment',                costCenter: 'CC-CORP-801' },
  { code: 'HROPS', name: 'HR Operations',                category: 'CORPORATE',  description: 'Lifecycle operations',       costCenter: 'CC-CORP-802' },
  { code: 'FIN',   name: 'Finance',                      category: 'CORPORATE',  description: 'Accounting and FP&A',        costCenter: 'CC-FIN-900'  },
  { code: 'ADMIN', name: 'Administration',               category: 'CORPORATE',  description: 'Facilities and travel',      costCenter: 'CC-CORP-803' },
  { code: 'LEGAL', name: 'Legal & Compliance',           category: 'CORPORATE',  description: 'Contracts and regulatory',   costCenter: 'CC-CORP-804' },
  { code: 'PROC',  name: 'Procurement',                  category: 'CORPORATE',  description: 'Vendors and sourcing',       costCenter: 'CC-CORP-805' },
  { code: 'OPS',   name: 'Operations',                   category: 'CORPORATE',  description: 'Delivery PMO',               costCenter: 'CC-CORP-806' },
  { code: 'IT',    name: 'Internal IT',                  category: 'CORPORATE',  description: 'Internal systems',           costCenter: 'CC-CORP-807' },
];