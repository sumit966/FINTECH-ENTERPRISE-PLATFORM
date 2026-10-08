// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Assessments (6 named, link to questions)
// ============================================================================

export interface AssessmentData {
  assessmentCode: string;
  title: string;
  description: string;
  durationMins: number;
  category: 'TECHNICAL' | 'APTITUDE' | 'CODING';
  isActive: boolean;
  questionCodes: string[];
}

export const assessmentsData: AssessmentData[] = [
  {
    assessmentCode: 'ASM-BE-SCREENER',
    title: 'Backend Engineer Screener',
    description: 'Java, Python, SQL, and problem solving for backend engineering roles.',
    durationMins: 60,
    category: 'TECHNICAL',
    isActive: true,
    questionCodes: [
      'Q-JV-01','Q-JV-02','Q-JV-03','Q-JV-04','Q-JV-05',
      'Q-SQ-01','Q-SQ-02','Q-PY-05',
    ],
  },
  {
    assessmentCode: 'ASM-FE-SCREENER',
    title: 'Frontend Engineer Screener',
    description: 'React, TypeScript, and frontend engineering fundamentals.',
    durationMins: 45,
    category: 'TECHNICAL',
    isActive: true,
    questionCodes: [
      'Q-RN-01','Q-RN-02','Q-RN-03','Q-RN-04','Q-RN-05','Q-RN-06',
    ],
  },
  {
    assessmentCode: 'ASM-ML-SCREENER',
    title: 'AI/ML Engineer Screener',
    description: 'Machine learning, transformers, RAG, and Python problem solving.',
    durationMins: 60,
    category: 'TECHNICAL',
    isActive: true,
    questionCodes: [
      'Q-ML-01','Q-ML-02','Q-ML-03','Q-ML-04',
      'Q-ML-05','Q-ML-06','Q-ML-07','Q-ML-08',
    ],
  },
  {
    assessmentCode: 'ASM-CLOUD-SCREENER',
    title: 'Cloud & DevOps Screener',
    description: 'Cloud fundamentals, Kubernetes, Terraform, and CI/CD.',
    durationMins: 60,
    category: 'TECHNICAL',
    isActive: true,
    questionCodes: [
      'Q-CL-01','Q-CL-02','Q-CL-03','Q-CL-04','Q-CL-05','Q-CL-06',
      'Q-DO-01','Q-DO-02',
    ],
  },
  {
    assessmentCode: 'ASM-SEC-SCREENER',
    title: 'Security Engineer Screener',
    description: 'Application security, OWASP, and secure engineering fundamentals.',
    durationMins: 45,
    category: 'TECHNICAL',
    isActive: true,
    questionCodes: [
      'Q-SE-01','Q-SE-02','Q-SE-03','Q-SE-04','Q-SE-05','Q-SE-06',
    ],
  },
  {
    assessmentCode: 'ASM-APT-GENERAL',
    title: 'General Aptitude Test',
    description: 'Quantitative and logical reasoning for all candidates.',
    durationMins: 45,
    category: 'APTITUDE',
    isActive: true,
    questionCodes: [
      'Q-AP-01','Q-AP-02','Q-AP-03','Q-AP-04',
      'Q-LG-01','Q-LG-02','Q-LG-03','Q-LG-04',
    ],
  },
];

if (assessmentsData.length !== 6) throw new Error('Expected 6 assessments');