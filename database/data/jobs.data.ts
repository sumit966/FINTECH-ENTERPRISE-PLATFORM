// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Job Openings (25)
// ============================================================================

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'CONSULTANT';
export type JobStatus = 'DRAFT' | 'OPEN' | 'ON_HOLD' | 'CLOSED' | 'FILLED';

export interface JobOpeningData {
  jobCode: string;
  title: string;
  departmentCode: string;
  locationCode: string;
  employmentType: EmploymentType;
  level: string;
  minExperience: number;
  maxExperience: number;
  description: string;
  requiredSkills: string[];
  openings: number;
  status: JobStatus;
  postedAt: Date;
}

function d(y: number, m: number, day: number): Date {
  return new Date(Date.UTC(y, m - 1, day));
}

export const jobsData: JobOpeningData[] = [
  { jobCode: 'JOB-2024-001', title: 'Senior Backend Engineer',         departmentCode: 'BE',     locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L5', minExperience: 5, maxExperience: 9,  description: 'Design and build microservices for our payments platform.', requiredSkills: ['Node.js','TypeScript','PostgreSQL','Kafka'],   openings: 3, status: 'OPEN',   postedAt: d(2024,3,1) },
  { jobCode: 'JOB-2024-002', title: 'Staff Backend Engineer',          departmentCode: 'BE',     locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L7', minExperience: 9, maxExperience: 14, description: 'Technical leadership for backend platform and architecture.', requiredSkills: ['Java','Spring Boot','Kafka','Kubernetes'],     openings: 1, status: 'OPEN',   postedAt: d(2024,2,15) },
  { jobCode: 'JOB-2024-003', title: 'Senior Frontend Engineer',        departmentCode: 'FE',     locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L5', minExperience: 5, maxExperience: 9,  description: 'Build high-quality React applications for enterprise clients.', requiredSkills: ['React','TypeScript','Tailwind CSS'],           openings: 2, status: 'OPEN',   postedAt: d(2024,3,10) },
  { jobCode: 'JOB-2024-004', title: 'Frontend Engineer',               departmentCode: 'FE',     locationCode: 'NOIDA', employmentType: 'FULL_TIME', level: 'L3', minExperience: 2, maxExperience: 5,  description: 'Develop user-facing features with React and TypeScript.',     requiredSkills: ['React','TypeScript','CSS3'],                    openings: 4, status: 'OPEN',   postedAt: d(2024,4,1) },
  { jobCode: 'JOB-2024-005', title: 'Full Stack Engineer',             departmentCode: 'FS',     locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'End-to-end delivery of customer-facing products.',            requiredSkills: ['React','Node.js','PostgreSQL'],                 openings: 5, status: 'OPEN',   postedAt: d(2024,3,20) },
  { jobCode: 'JOB-2024-006', title: 'Mobile Engineer (React Native)',  departmentCode: 'MOB',    locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Build cross-platform mobile apps with React Native.',         requiredSkills: ['React Native','TypeScript','Redux'],           openings: 2, status: 'OPEN',   postedAt: d(2024,4,5) },
  { jobCode: 'JOB-2024-007', title: 'Senior AI/ML Engineer',           departmentCode: 'AIML',   locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L6', minExperience: 6, maxExperience: 11, description: 'Build LLM and RAG systems for enterprise use cases.',         requiredSkills: ['Python','PyTorch','LangChain','RAG'],           openings: 2, status: 'OPEN',   postedAt: d(2024,3,1) },
  { jobCode: 'JOB-2024-008', title: 'Machine Learning Engineer',       departmentCode: 'AIML',   locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Productionize ML models for fintech and healthcare clients.', requiredSkills: ['Python','scikit-learn','MLflow'],               openings: 3, status: 'OPEN',   postedAt: d(2024,4,10) },
  { jobCode: 'JOB-2024-009', title: 'Data Engineer',                   departmentCode: 'DATA',   locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Build data pipelines and warehouse infrastructure.',          requiredSkills: ['Python','Airflow','PostgreSQL','dbt'],          openings: 3, status: 'OPEN',   postedAt: d(2024,3,15) },
  { jobCode: 'JOB-2024-010', title: 'Senior Data Engineer',            departmentCode: 'DATA',   locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L6', minExperience: 6, maxExperience: 11, description: 'Lead data platform engineering initiatives.',                 requiredSkills: ['Apache Spark','Snowflake','Airflow'],           openings: 1, status: 'OPEN',   postedAt: d(2024,2,20) },
  { jobCode: 'JOB-2024-011', title: 'Cloud Engineer (AWS)',            departmentCode: 'CLOUD',  locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Design and operate AWS infrastructure with Terraform.',       requiredSkills: ['AWS','Terraform','Kubernetes'],                 openings: 2, status: 'OPEN',   postedAt: d(2024,4,1) },
  { jobCode: 'JOB-2024-012', title: 'Cloud Engineer (Azure)',          departmentCode: 'CLOUD',  locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Deliver Azure-based solutions for enterprise clients.',        requiredSkills: ['Azure','Terraform','Kubernetes'],               openings: 2, status: 'OPEN',   postedAt: d(2024,4,10) },
  { jobCode: 'JOB-2024-013', title: 'DevOps Engineer',                 departmentCode: 'DEVOPS', locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Own CI/CD pipelines and release automation.',                 requiredSkills: ['GitHub Actions','Docker','Kubernetes'],         openings: 2, status: 'OPEN',   postedAt: d(2024,3,5) },
  { jobCode: 'JOB-2024-014', title: 'Site Reliability Engineer',       departmentCode: 'SRE',    locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L5', minExperience: 5, maxExperience: 9,  description: 'Improve reliability, observability, and SLOs.',                requiredSkills: ['Prometheus','Grafana','Kubernetes'],            openings: 2, status: 'OPEN',   postedAt: d(2024,3,15) },
  { jobCode: 'JOB-2024-015', title: 'Security Engineer',               departmentCode: 'SEC',    locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L5', minExperience: 5, maxExperience: 9,  description: 'Application security and threat modeling.',                    requiredSkills: ['AppSec','OWASP Top 10','SIEM'],                 openings: 2, status: 'OPEN',   postedAt: d(2024,4,1) },
  { jobCode: 'JOB-2024-016', title: 'Senior Security Engineer',        departmentCode: 'SEC',    locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L6', minExperience: 6, maxExperience: 11, description: 'Lead security engineering and compliance initiatives.',       requiredSkills: ['CISSP','ISO 27001','AppSec'],                   openings: 1, status: 'OPEN',   postedAt: d(2024,2,10) },
  { jobCode: 'JOB-2024-017', title: 'QA Automation Engineer',          departmentCode: 'QA',     locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Build automated test suites for web and mobile apps.',        requiredSkills: ['Playwright','TypeScript','Jest'],                openings: 3, status: 'OPEN',   postedAt: d(2024,3,20) },
  { jobCode: 'JOB-2024-018', title: 'Manual QA Engineer',              departmentCode: 'QA',     locationCode: 'NOIDA', employmentType: 'FULL_TIME', level: 'L3', minExperience: 2, maxExperience: 5,  description: 'Manual testing and regression for enterprise releases.',       requiredSkills: ['Test Planning','Jira','SQL'],                    openings: 3, status: 'OPEN',   postedAt: d(2024,4,5) },
  { jobCode: 'JOB-2024-019', title: 'Product Designer',                departmentCode: 'UX',     locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L5', minExperience: 5, maxExperience: 9,  description: 'Design enterprise SaaS products with our design system.',      requiredSkills: ['Figma','Design Systems','User Research'],       openings: 2, status: 'OPEN',   postedAt: d(2024,3,10) },
  { jobCode: 'JOB-2024-020', title: 'Solution Architect',              departmentCode: 'ARCH',   locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L7', minExperience: 9, maxExperience: 15, description: 'Lead architecture for multi-cloud enterprise platforms.',      requiredSkills: ['AWS','Azure','Kubernetes','TOGAF'],             openings: 1, status: 'OPEN',   postedAt: d(2024,2,1) },
  { jobCode: 'JOB-2024-021', title: 'Product Manager',                 departmentCode: 'PM',     locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L6', minExperience: 6, maxExperience: 11, description: 'Own product roadmap for our payments and lending suite.',      requiredSkills: ['Product Strategy','Roadmapping','SQL'],         openings: 1, status: 'OPEN',   postedAt: d(2024,3,1) },
  { jobCode: 'JOB-2024-022', title: 'Business Analyst',                departmentCode: 'BA',     locationCode: 'NOIDA', employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Bridge business requirements and technical delivery.',         requiredSkills: ['Requirements','SQL','Process Mapping'],         openings: 2, status: 'OPEN',   postedAt: d(2024,4,1) },
  { jobCode: 'JOB-2024-023', title: 'Technical Recruiter',             departmentCode: 'TA',     locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Own end-to-end hiring for technology roles.',                 requiredSkills: ['Sourcing','Interviewing','ATS'],                openings: 2, status: 'OPEN',   postedAt: d(2024,3,15) },
  { jobCode: 'JOB-2024-024', title: 'HR Business Partner',             departmentCode: 'HR',     locationCode: 'BLR',   employmentType: 'FULL_TIME', level: 'L5', minExperience: 5, maxExperience: 9,  description: 'Partner with engineering leaders on people strategy.',         requiredSkills: ['HRBP','Employee Relations','Policy'],           openings: 1, status: 'OPEN',   postedAt: d(2024,3,20) },
  { jobCode: 'JOB-2024-025', title: 'Finance Analyst',                 departmentCode: 'FIN',    locationCode: 'PUNE',  employmentType: 'FULL_TIME', level: 'L4', minExperience: 3, maxExperience: 7,  description: 'Support financial planning, FP&A, and reporting.',            requiredSkills: ['Excel','SQL','FP&A'],                            openings: 1, status: 'OPEN',   postedAt: d(2024,4,10) },
];

if (jobsData.length !== 25) throw new Error('Expected 25 job openings');