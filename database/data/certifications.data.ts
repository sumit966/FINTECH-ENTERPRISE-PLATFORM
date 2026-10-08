// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Certification catalogue
// ============================================================================

export interface CertificationData {
  code: string;
  name: string;
  issuer: string;
  validityMons: number | null;
}

export const certificationsData: CertificationData[] = [
  { code: 'AWS-SAA',       name: 'AWS Solutions Architect Associate',    issuer: 'Amazon Web Services', validityMons: 36 },
  { code: 'AWS-SAP',       name: 'AWS Solutions Architect Professional', issuer: 'Amazon Web Services', validityMons: 36 },
  { code: 'AWS-DVA',       name: 'AWS Developer Associate',              issuer: 'Amazon Web Services', validityMons: 36 },
  { code: 'AWS-SEC',       name: 'AWS Security Specialty',               issuer: 'Amazon Web Services', validityMons: 36 },
  { code: 'AZ-104',        name: 'Microsoft Azure Administrator',        issuer: 'Microsoft',           validityMons: 24 },
  { code: 'AZ-305',        name: 'Azure Solutions Architect Expert',     issuer: 'Microsoft',           validityMons: 24 },
  { code: 'AZ-400',        name: 'Azure DevOps Engineer Expert',         issuer: 'Microsoft',           validityMons: 24 },
  { code: 'GCP-ACE',       name: 'Google Cloud Associate Engineer',      issuer: 'Google',              validityMons: 36 },
  { code: 'GCP-PCA',       name: 'Google Cloud Professional Architect',  issuer: 'Google',              validityMons: 24 },
  { code: 'CKA',           name: 'Certified Kubernetes Administrator',   issuer: 'CNCF',                validityMons: 36 },
  { code: 'CKAD',          name: 'Certified Kubernetes App Developer',   issuer: 'CNCF',                validityMons: 36 },
  { code: 'CKS',           name: 'Certified Kubernetes Security Spec',   issuer: 'CNCF',                validityMons: 24 },
  { code: 'TF-ASSOC',      name: 'HashiCorp Terraform Associate',        issuer: 'HashiCorp',           validityMons: 24 },
  { code: 'PMP',           name: 'Project Management Professional',      issuer: 'PMI',                 validityMons: 36 },
  { code: 'CSM',           name: 'Certified Scrum Master',               issuer: 'Scrum Alliance',      validityMons: 24 },
  { code: 'CSPO',          name: 'Certified Scrum Product Owner',        issuer: 'Scrum Alliance',      validityMons: 24 },
  { code: 'ITIL4',         name: 'ITIL 4 Foundation',                    issuer: 'Axelos',              validityMons: null },
  { code: 'CISSP',         name: 'Certified Info Systems Security Pro',  issuer: 'ISC2',                validityMons: 36 },
  { code: 'CEH',           name: 'Certified Ethical Hacker',             issuer: 'EC-Council',          validityMons: 36 },
  { code: 'OSCP',          name: 'Offensive Security Certified Pro',     issuer: 'OffSec',              validityMons: null },
  { code: 'CISA',          name: 'Certified Info Systems Auditor',       issuer: 'ISACA',               validityMons: 36 },
  { code: 'TF-DEV',        name: 'TensorFlow Developer Certificate',     issuer: 'Google',              validityMons: 36 },
  { code: 'AWS-MLA',       name: 'AWS Machine Learning Specialty',       issuer: 'Amazon Web Services', validityMons: 36 },
  { code: 'AZ-AI-102',     name: 'Azure AI Engineer Associate',          issuer: 'Microsoft',           validityMons: 24 },
  { code: 'DATABRICKS-DE', name: 'Databricks Data Engineer Associate',   issuer: 'Databricks',          validityMons: 24 },
  { code: 'SNOWPRO-CORE',  name: 'SnowPro Core',                         issuer: 'Snowflake',           validityMons: 24 },
  { code: 'DBT-ADV',       name: 'dbt Advanced',                         issuer: 'dbt Labs',            validityMons: null },
  { code: 'SIX-SIGMA-GB',  name: 'Six Sigma Green Belt',                 issuer: 'ASQ',                 validityMons: null },
  { code: 'CCNA',          name: 'Cisco Certified Network Associate',    issuer: 'Cisco',               validityMons: 36 },
  { code: 'CCNP',          name: 'Cisco Certified Network Professional', issuer: 'Cisco',               validityMons: 36 },
];