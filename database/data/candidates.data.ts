// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Candidates (deterministic)
// 200 candidates spread across 8 pipeline stages. No randomness.
// ============================================================================

import { jobsData } from './jobs.data';
import { employeeNames } from './employee-names.data';

export type CandidateStage = 'APPLIED' | 'SCREENING' | 'ASSESSMENT' | 'TECHNICAL_INTERVIEW'
  | 'MANAGER_INTERVIEW' | 'HR_INTERVIEW' | 'SELECTED' | 'OFFER' | 'JOINED' | 'REJECTED';

export interface CandidateData {
  candidateCode: string;
  jobCode: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  currentCompany: string;
  currentCtc: number;
  expectedCtc: number;
  noticePeriod: number;
  source: 'LINKEDIN' | 'REFERRAL' | 'WEBSITE' | 'AGENCY';
  stage: CandidateStage;
  score: number;
  appliedAt: Date;
}

const SOURCES: CandidateData['source'][] = ['LINKEDIN','REFERRAL','WEBSITE','AGENCY'];
const STAGES: CandidateStage[] = ['APPLIED','SCREENING','ASSESSMENT','TECHNICAL_INTERVIEW','MANAGER_INTERVIEW','HR_INTERVIEW','SELECTED','OFFER','JOINED','REJECTED'];
const COMPANIES = [
  'Infosys','TCS','Wipro','HCLTech','Tech Mahindra','LTIMindtree','Mphasis','Persistent Systems',
  'Accenture','Capgemini','Cognizant','Deloitte','EY','PwC','KPMG','Zoho','Freshworks',
  'Razorpay','Paytm','PhonePe','CRED','Zerodha','Groww','Slice','Jupiter','Navi',
];

function pad4(n: number): string { return String(n).padStart(4, '0'); }

// Deterministic first-name pool from the 500 names, then local suffixes for uniqueness.
function candidateNameFor(i: number): string {
  const base = employeeNames[(i * 7 + 13) % employeeNames.length];
  // Append a community-neutral last name to guarantee uniqueness across 200 rows.
  const SUFFIXES = ['Kumar','Reddy','Nair','Iyer','Pillai','Mehta','Shah','Patel','Singh','Chopra'];
  const parts = base.split(' ');
  return parts[0] + ' ' + SUFFIXES[i % SUFFIXES.length];
}

export const candidatesData: CandidateData[] = [];

const CANDIDATES_PER_JOB = 8; // 25 jobs * 8 = 200

for (let j = 0; j < jobsData.length; j++) {
  const job = jobsData[j];
  for (let k = 0; k < CANDIDATES_PER_JOB; k++) {
    const idx = j * CANDIDATES_PER_JOB + k;
    const name = candidateNameFor(idx);
    const parts = name.toLowerCase().split(' ');
    const email = parts[0] + '.' + parts[1] + '.cand' + pad4(idx + 1) + '@example.in';

    // Stage distribution: walk the STAGES array in a fixed pattern.
    // Early indices are more progressed (SELECTED / OFFER / JOINED), later ones
    // are still in early stages. Deterministic.
    let stage: CandidateStage;
    if (k === 0) stage = 'JOINED';
    else if (k === 1) stage = 'OFFER';
    else if (k === 2) stage = 'SELECTED';
    else if (k === 3) stage = 'HR_INTERVIEW';
    else if (k === 4) stage = 'TECHNICAL_INTERVIEW';
    else if (k === 5) stage = 'ASSESSMENT';
    else if (k === 6) stage = 'SCREENING';
    else stage = (idx % 5 === 4) ? 'REJECTED' : 'APPLIED';

    const currentCtc = 400000 + ((idx * 83) % 1200000);
    const expectedCtc = Math.round(currentCtc * (1.2 + (idx % 4) * 0.05));
    const noticePeriod = [30, 45, 60, 90][idx % 4];
    const score = stage === 'APPLIED' ? 0 : 3.0 + ((idx * 13) % 200) / 100;

    candidatesData.push({
      candidateCode: 'CAN-' + pad4(idx + 1),
      jobCode: job.jobCode,
      fullName: name,
      email,
      phone: '+91-9' + String(800000000 + idx * 173).padStart(9, '0'),
      resumeUrl: 'https://storage.example/resumes/CAN-' + pad4(idx + 1) + '.pdf',
      currentCompany: COMPANIES[idx % COMPANIES.length],
      currentCtc,
      expectedCtc,
      noticePeriod,
      source: SOURCES[idx % SOURCES.length],
      stage,
      score,
      appliedAt: new Date(Date.UTC(2024, (idx % 6), 1 + (idx % 28))),
    });
  }
}

if (candidatesData.length !== 200) throw new Error('Expected 200 candidates, got ' + candidatesData.length);