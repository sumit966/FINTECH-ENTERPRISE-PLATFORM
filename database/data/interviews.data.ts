// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Interviews (deterministic)
// One interview per candidate at stages TECHNICAL_INTERVIEW or later.
// ============================================================================

import { candidatesData } from './candidates.data';
import { employeesData } from './employees.data';

export type InterviewMode = 'IN_PERSON' | 'VIDEO' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type Recommendation = 'HIRE' | 'NO_HIRE' | 'HOLD';

export interface InterviewData {
  candidateCode: string;
  round: 'TECHNICAL' | 'MANAGER' | 'HR';
  scheduledAt: Date;
  durationMins: number;
  mode: InterviewMode;
  interviewerCode: string;
  status: InterviewStatus;
  feedback: string;
  score: number;
  recommendation: Recommendation;
}

const MODES: InterviewMode[] = ['VIDEO', 'IN_PERSON', 'PHONE'];

export const interviewsData: InterviewData[] = [];

// Only interview candidates who are at TECHNICAL_INTERVIEW or later.
const INTERVIEW_STAGES = new Set([
  'TECHNICAL_INTERVIEW','MANAGER_INTERVIEW','HR_INTERVIEW','SELECTED','OFFER','JOINED','REJECTED',
]);

for (let i = 0; i < candidatesData.length; i++) {
  const cand = candidatesData[i];
  if (!INTERVIEW_STAGES.has(cand.stage)) continue;

  // Interviewer: pick a senior engineer/manager from the pool deterministically.
  const interviewerIdx = 12 + ((i * 7) % 100); // senior band of employeesData
  const interviewer = employeesData[interviewerIdx];

  // Round: TECHNICAL first, then MANAGER / HR depending on how far along.
  let round: InterviewData['round'] = 'TECHNICAL';
  if (cand.stage === 'MANAGER_INTERVIEW' || cand.stage === 'HR_INTERVIEW' || cand.stage === 'SELECTED' || cand.stage === 'OFFER' || cand.stage === 'JOINED') {
    round = 'MANAGER';
  }
  if (cand.stage === 'HR_INTERVIEW' || cand.stage === 'SELECTED' || cand.stage === 'OFFER' || cand.stage === 'JOINED') {
    round = 'HR';
  }

  const isDone = cand.stage !== 'TECHNICAL_INTERVIEW' && cand.stage !== 'MANAGER_INTERVIEW' && cand.stage !== 'HR_INTERVIEW';
  const status: InterviewStatus = isDone ? 'COMPLETED' : 'SCHEDULED';
  const feedback = isDone ? 'Strong technical skills; recommended for next round.' : '';
  const score = isDone ? 3.5 + ((i * 7) % 15) / 10 : 0;
  const recommendation: Recommendation = isDone ? (score >= 4.0 ? 'HIRE' : (score >= 3.5 ? 'HOLD' : 'NO_HIRE')) : 'HOLD';

  interviewsData.push({
    candidateCode: cand.candidateCode,
    round,
    scheduledAt: new Date(Date.UTC(2024, (i % 6), 5 + (i % 20), 10 + (i % 6), 0, 0)),
    durationMins: round === 'TECHNICAL' ? 90 : 45,
    mode: MODES[i % MODES.length],
    interviewerCode: interviewer.employeeCode,
    status,
    feedback,
    score,
    recommendation,
  });
}

console.log('Generated ' + interviewsData.length + ' interviews');