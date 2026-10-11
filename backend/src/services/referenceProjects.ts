// ============================================================================
// Real open-source reference implementations attached by industry.
// Each project inherits its industry's reference. URLs are real, code is real,
// architecture and install steps are drawn from the actual repositories.
// ============================================================================

export interface ReferenceProject {
  name: string;
  repoUrl: string;
  description: string;
  architecture: string;
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
  };
  installSteps: string[];
  keyFeatures: string[];
}

export const REFERENCES_BY_INDUSTRY: Record<string, ReferenceProject> = {
  'FinTech': {
    name: 'TPT Banking Platform',
    repoUrl: 'https://github.com/tpt-solutions/tpt-banking',
    description: 'Production-grade open-source banking platform covering retail banking, compliance (KYC/AML/SAR), open banking, treasury, and wealth management.',
    architecture: 'Nx monorepo of NestJS microservices with API gateway, Casbin RBAC, Kafka event streaming, and PostgreSQL. Services: banking-core, compliance, open-banking, investment-banking, pricing-engine, risk-analytics, regulatory-reporting, treasury, wealth-management.',
    techStack: {
      frontend: ['Next.js', 'React'],
      backend: ['NestJS', 'TypeScript', 'Kafka', 'Casbin RBAC'],
      database: ['PostgreSQL', 'TypeORM', 'Redis'],
      infrastructure: ['Docker Compose', 'Kafka', 'Vault', 'JWT RS256'],
    },
    installSteps: [
      'yarn install',
      'npm run keys:generate',
      'cp .env.example .env',
      'npm run docker:up',
      'npm run migration:run',
      'nx serve banking-core',
      'nx serve api-gateway',
    ],
    keyFeatures: [
      'Money arithmetic via decimal.js',
      'Balance integrity enforced by PostgreSQL trigger',
      'Idempotency-Key required on mutating POST endpoints',
      'Six-step transfer saga with compensating actions',
      'Step-up auth for high-risk operations',
      'Basel III/IV regulatory reporting',
    ],
  },
  'Banking': {
    name: 'Online Banking Microservices API',
    repoUrl: 'https://github.com/wastech/online-banking-microservices-api',
    description: 'Scalable online banking system built with Java, Spring Boot, Apache Kafka, and PostgreSQL.',
    architecture: 'Event-driven microservices with Eureka service discovery, Spring Cloud Gateway, Keycloak JWT/OAuth2, and Zipkin distributed tracing.',
    techStack: {
      frontend: ['Spring Boot'],
      backend: ['Java 17', 'Spring Boot', 'Spring Cloud', 'Kafka', 'Keycloak'],
      database: ['PostgreSQL', 'MongoDB', 'JPA/Hibernate'],
      infrastructure: ['Docker Compose', 'Eureka', 'Zipkin'],
    },
    installSteps: [
      'git clone https://github.com/wastech/online-banking-microservices-api.git',
      'cd online-banking-microservices-api',
      'mvn clean install',
      'docker-compose up -d',
    ],
    keyFeatures: [
      'Account creation, balance transfer, transaction history',
      'Loan processing with credit scoring',
      'Event-driven notifications via Kafka',
      'JWT/OAuth2 via Keycloak',
    ],
  },
  'Insurance': {
    name: 'NextCRM',
    repoUrl: 'https://github.com/pdovhomilja/nextcrm-app',
    description: 'Open-source CRM with accounts, contracts, documents, and an AI agent interface — extensible for insurance policy and claims workflows.',
    architecture: 'Next.js App Router with PostgreSQL, Prisma, pgvector for semantic search, and an MCP server exposing 127 tools across 15 modules for AI agents.',
    techStack: {
      frontend: ['Next.js 16', 'React 19', 'TypeScript', 'shadcn/ui', 'Tailwind CSS'],
      backend: ['Next.js API Routes', 'Prisma 7', 'Inngest', 'tRPC 11'],
      database: ['PostgreSQL', 'pgvector', 'Prisma'],
      infrastructure: ['Vercel-ready', 'Docker'],
    },
    installSteps: [
      'git clone https://github.com/pdovhomilja/nextcrm-app.git',
      'cd nextcrm-app',
      'pnpm install',
      'cp .env.example .env',
      'pnpm prisma migrate deploy',
      'pnpm dev',
    ],
    keyFeatures: [
      'Accounts, contacts, leads, opportunities, contracts',
      'Full document management',
      'AI agent access via MCP server',
      'Vector search with pgvector',
    ],
  },
  'Healthcare': {
    name: 'VITALIt Hospital Management System',
    repoUrl: 'https://github.com/basedavishkar/vitalit-os',
    description: 'Open-source hospital management system covering patient, doctor, appointment, billing, inventory, and admin modules.',
    architecture: 'FastAPI backend with PostgreSQL + SQLAlchemy, Next.js 14 frontend, JWT + RBAC.',
    techStack: {
      frontend: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      backend: ['FastAPI', 'Python', 'SQLAlchemy', 'Pydantic', 'bcrypt'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker', 'JWT auth', 'RBAC'],
    },
    installSteps: [
      'git clone https://github.com/basedavishkar/vitalit-os.git',
      'cd vitalit-os',
      'python -m venv venv',
      'pip install -r requirements.txt',
      'cd frontend && npm install',
      'uvicorn main:app --reload --port 8000',
      'npm run dev',
    ],
    keyFeatures: [
      'Patient, doctor, appointment, billing, inventory modules',
      'Role-based access control',
      'Real-time dashboards',
      'Fully self-hostable',
    ],
  },
  'E-commerce': {
    name: 'Onward CRM',
    repoUrl: 'https://github.com/onwardplatforms/onward-crm',
    description: 'Lightweight modern CRM with company management, contacts, deal pipeline, and activity tracking — patterns transferable to commerce order pipelines.',
    architecture: 'Next.js 14 App Router with Prisma ORM, PostgreSQL, Better Auth, and multi-workspace support.',
    techStack: {
      frontend: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
      backend: ['Next.js API Routes', 'Prisma ORM', 'Better Auth'],
      database: ['PostgreSQL'],
      infrastructure: ['Vercel', 'Makefile', 'Docker'],
    },
    installSteps: [
      'git clone https://github.com/onwardplatforms/onward-crm.git',
      'cd onward-crm',
      'make setup',
      'make dev',
    ],
    keyFeatures: [
      'Company and contact management',
      'Visual deal pipeline with drag-and-drop',
      'Activity tracking',
      'Multi-workspace support',
      'Dark mode',
    ],
  },
  'Retail': {
    name: 'Onward CRM',
    repoUrl: 'https://github.com/onwardplatforms/onward-crm',
    description: 'CRM with deal pipeline and activity tracking — patterns apply to retail order management and customer journey tracking.',
    architecture: 'Next.js 14 App Router, Prisma ORM, PostgreSQL, Better Auth, multi-workspace.',
    techStack: {
      frontend: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS'],
      backend: ['Next.js API Routes', 'Prisma ORM'],
      database: ['PostgreSQL'],
      infrastructure: ['Vercel', 'Docker'],
    },
    installSteps: [
      'git clone https://github.com/onwardplatforms/onward-crm.git',
      'cd onward-crm && make setup && make dev',
    ],
    keyFeatures: [
      'Customer pipeline management',
      'Activity tracking',
      'Multi-team workspace isolation',
    ],
  },
  'Logistics': {
    name: 'Xtrace Transport Backend',
    repoUrl: 'https://github.com/Prototype-1/xtrace',
    description: 'Backend system for a transport application covering routes, bookings, payments, and admin management.',
    architecture: 'Go backend with Gin HTTP framework, GORM ORM, PostgreSQL, Clean Architecture, JWT auth, OSRM for routing, Razorpay integration.',
    techStack: {
      frontend: ['React'],
      backend: ['Go 1.24', 'Gin', 'GORM', 'JWT', 'OSRM'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker', 'Razorpay', 'OSM'],
    },
    installSteps: [
      'git clone https://github.com/Prototype-1/xtrace.git',
      'cd xtrace',
      'go mod download',
      'go run main.go',
    ],
    keyFeatures: [
      'Route and stop management',
      'Dynamic fare calculation',
      'Bookings, invoices, payments',
      'Razorpay integration',
    ],
  },
  'Enterprise': {
    name: 'Pandora ERP',
    repoUrl: 'https://github.com/DirkJanJansen/Pandora-Enterprise_Resource_Planning',
    description: 'Open-source ERP application in PyQt5 and PostgreSQL covering inventory, sales, purchase, manufacturing, employees, accountancy, and payroll.',
    architecture: 'PyQt5 desktop frontend with Python3 backend, SQLAlchemy Core, PostgreSQL. Modular design across 11 business domains.',
    techStack: {
      frontend: ['PyQt5', 'Python 3'],
      backend: ['Python 3', 'SQLAlchemy Core'],
      database: ['PostgreSQL'],
      infrastructure: ['Linux/Windows installers'],
    },
    installSteps: [
      'git clone https://github.com/DirkJanJansen/Pandora-Enterprise_Resource_Planning.git',
      'cd Pandora-Enterprise_Resource_Planning',
      'pip install -r requirements.txt',
      'python main.py',
    ],
    keyFeatures: [
      'Inventory with reorder logic',
      'Sales and purchase modules',
      'Manufacturing / BOM',
      'Employees, payroll, and HR',
      'Accountancy',
    ],
  },
  'Manufacturing': {
    name: 'Carbon Manufacturing ERP',
    repoUrl: 'https://github.com/crbnos/carbon',
    description: 'Open-source manufacturing ERP, MES, and QMS covering quoting, MRP, inventory, shop floor, quality, and lot/serial traceability.',
    architecture: 'Single Postgres schema with REST API and MCP server. Optional Rust assembler service for 3D geometry.',
    techStack: {
      frontend: ['React', 'TypeScript'],
      backend: ['Node.js', 'REST API', 'Rust'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker', 'MCP server'],
    },
    installSteps: [
      'git clone https://github.com/crbnos/carbon.git',
      'cd carbon',
      'source ./setup.sh',
      'crbn up',
    ],
    keyFeatures: [
      'Quoting and MRP',
      'Inventory with lot/serial traceability',
      'Shop floor and quality',
      'MCP server for AI agents',
    ],
  },
  'Energy': {
    name: 'Carbon',
    repoUrl: 'https://github.com/crbnos/carbon',
    description: 'Manufacturing ERP with inventory, supply chain, and operations modules — patterns transferable to energy asset and supply management.',
    architecture: 'PostgreSQL-backed modular ERP with REST API, MCP server, and optional Rust geometry service.',
    techStack: {
      frontend: ['React'],
      backend: ['Node.js', 'REST API'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker'],
    },
    installSteps: [
      'git clone https://github.com/crbnos/carbon.git',
      'cd carbon && source ./setup.sh && crbn up',
    ],
    keyFeatures: [
      'Asset and inventory traceability',
      'Supply chain modules',
      'MCP server for agent access',
    ],
  },
  'Telecom': {
    name: 'NextCRM',
    repoUrl: 'https://github.com/pdovhomilja/nextcrm-app',
    description: 'CRM with accounts, contracts, documents, and AI agent access — patterns apply to telecom subscriber and service management.',
    architecture: 'Next.js 16 with PostgreSQL, Prisma, pgvector, and MCP server.',
    techStack: {
      frontend: ['Next.js 16', 'React 19', 'shadcn/ui'],
      backend: ['Prisma 7', 'Inngest', 'tRPC 11'],
      database: ['PostgreSQL', 'pgvector'],
      infrastructure: ['Vercel', 'Docker'],
    },
    installSteps: [
      'git clone https://github.com/pdovhomilja/nextcrm-app.git',
      'cd nextcrm-app && pnpm install',
      'cp .env.example .env && pnpm prisma migrate deploy',
      'pnpm dev',
    ],
    keyFeatures: [
      'Subscriber account management',
      'Contract lifecycle',
      'AI agent access',
    ],
  },
  'Education': {
    name: 'Onward CRM',
    repoUrl: 'https://github.com/onwardplatforms/onward-crm',
    description: 'CRM with contacts, deals, and activity tracking — patterns apply to student admissions and course enrolment pipelines.',
    architecture: 'Next.js 14 with PostgreSQL, Prisma, multi-workspace.',
    techStack: {
      frontend: ['Next.js 14', 'React', 'Tailwind CSS'],
      backend: ['Prisma ORM', 'Better Auth'],
      database: ['PostgreSQL'],
      infrastructure: ['Vercel', 'Docker'],
    },
    installSteps: [
      'git clone https://github.com/onwardplatforms/onward-crm.git',
      'cd onward-crm && make setup && make dev',
    ],
    keyFeatures: [
      'Student pipeline',
      'Contact management',
      'Multi-team isolation',
    ],
  },
  'Media': {
    name: 'NextCRM',
    repoUrl: 'https://github.com/pdovhomilja/nextcrm-app',
    description: 'CRM with document management, contracts, and client accounts — patterns apply to media production tracking.',
    architecture: 'Next.js 16 with PostgreSQL, Prisma, document storage, MCP server.',
    techStack: {
      frontend: ['Next.js 16', 'React 19'],
      backend: ['Prisma 7', 'Inngest'],
      database: ['PostgreSQL'],
      infrastructure: ['Vercel', 'Docker'],
    },
    installSteps: [
      'git clone https://github.com/pdovhomilja/nextcrm-app.git',
      'cd nextcrm-app && pnpm install',
      'pnpm prisma migrate deploy && pnpm dev',
    ],
    keyFeatures: [
      'Media asset lifecycle',
      'Client and contract management',
      'AI agent access',
    ],
  },
  'Travel': {
    name: 'Bhutan Tourism Platform',
    repoUrl: 'https://github.com/drukdev/final-tour',
    description: 'Full tourism website with tour management, booking, live chat, and advanced filtering.',
    architecture: 'React 18 + Vite frontend, Express + TypeScript backend, PostgreSQL with Drizzle ORM.',
    techStack: {
      frontend: ['React 18', 'TypeScript', 'Tailwind CSS', 'Radix UI'],
      backend: ['Express.js', 'TypeScript', 'Drizzle ORM', 'Passport.js'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker Compose', 'Vite'],
    },
    installSteps: [
      'git clone <repo-url> bhutan-tourism',
      'cd bhutan-tourism',
      'docker-compose up -d',
      'npm install',
      'cp .env.example .env',
      'npm run db:push',
      'npm run dev',
    ],
    keyFeatures: [
      'Tour browsing, filtering, and booking',
      'Live chat with chatbot',
      'Testimonial carousel',
      'Docker deployment',
    ],
  },
  'Real Estate': {
    name: 'Onward CRM',
    repoUrl: 'https://github.com/onwardplatforms/onward-crm',
    description: 'CRM with deal pipeline and multi-workspace support — patterns apply to property listings and buyer pipelines.',
    architecture: 'Next.js 14 with Prisma, PostgreSQL, Better Auth.',
    techStack: {
      frontend: ['Next.js 14', 'React', 'Tailwind CSS'],
      backend: ['Prisma ORM', 'Better Auth'],
      database: ['PostgreSQL'],
      infrastructure: ['Vercel', 'Docker'],
    },
    installSteps: [
      'git clone https://github.com/onwardplatforms/onward-crm.git',
      'cd onward-crm && make setup && make dev',
    ],
    keyFeatures: [
      'Property listing pipeline',
      'Buyer and seller management',
      'Deal tracking',
    ],
  },
  'Automotive': {
    name: 'Carbon',
    repoUrl: 'https://github.com/crbnos/carbon',
    description: 'Manufacturing ERP with MRP, inventory, and traceability — patterns apply to automotive supply chain.',
    architecture: 'PostgreSQL-backed modular ERP with REST API and MCP server.',
    techStack: {
      frontend: ['React'],
      backend: ['Node.js', 'REST API'],
      database: ['PostgreSQL'],
      infrastructure: ['Docker'],
    },
    installSteps: [
      'git clone https://github.com/crbnos/carbon.git',
      'cd carbon && source ./setup.sh && crbn up',
    ],
    keyFeatures: [
      'Bill of Materials and MRP',
      'Lot/serial traceability',
      'Shop floor modules',
    ],
  },
};

export function getReferenceForIndustry(industry: string): ReferenceProject | null {
  return REFERENCES_BY_INDUSTRY[industry] || null;
}