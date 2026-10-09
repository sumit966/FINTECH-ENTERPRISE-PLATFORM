// Demo login accounts. Passwords are pre-hashed by scripts/generate-hashes.ts.
export interface UserData {
  email: string;
  fullName: string;
  roleCode: string;
  employeeCode?: string;
  passwordHash: string;
}
export const DEMO_PASSWORD_HASHES: Record<string, string> = {
  default: '$2a$12$9Aclr34grvucoo9USRnRXek30GqM82Fpy.iFOlTIUp99Iw6dmePPq',
};
export const usersData: UserData[] = [
  { email: 'founder@fintechitsolutions.in',      fullName: 'Sumit Kumar',       roleCode: 'FOUNDER_CEO',         passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'director@fintechitsolutions.in',     fullName: 'Aarav Mehta',     roleCode: 'DIRECTOR',            employeeCode: 'FITS-0002', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'hr.head@fintechitsolutions.in',      fullName: 'Ananya Iyer',     roleCode: 'DEPT_HEAD',           employeeCode: 'FITS-0003', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'finance.head@fintechitsolutions.in', fullName: 'Rohan Deshpande', roleCode: 'FINANCE_MANAGER',     employeeCode: 'FITS-0004', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'eng.head@fintechitsolutions.in',     fullName: 'Vikram Nair',     roleCode: 'ENGINEERING_MANAGER', employeeCode: 'FITS-0005', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'manager@fintechitsolutions.in',      fullName: 'Priya Sharma',    roleCode: 'MANAGER',             employeeCode: 'FITS-0006', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'lead@fintechitsolutions.in',         fullName: 'Karthik Reddy',   roleCode: 'TEAM_LEAD',           employeeCode: 'FITS-0007', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'recruiter@fintechitsolutions.in',    fullName: 'Neha Kulkarni',   roleCode: 'RECRUITER',           employeeCode: 'FITS-0008', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'engineer@fintechitsolutions.in',     fullName: 'Arjun Verma',     roleCode: 'ENGINEER',            employeeCode: 'FITS-0009', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'qa@fintechitsolutions.in',           fullName: 'Sneha Pillai',    roleCode: 'QA',                  employeeCode: 'FITS-0010', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'employee@fintechitsolutions.in',     fullName: 'Ravi Kumar',      roleCode: 'EMPLOYEE',            employeeCode: 'FITS-0011', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'auditor@fintechitsolutions.in',      fullName: 'Meera Joshi',     roleCode: 'AUDITOR',             employeeCode: 'FITS-0012', passwordHash: DEMO_PASSWORD_HASHES.default },
];