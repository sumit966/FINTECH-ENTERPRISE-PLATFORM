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
  { email: 'founder@fintechitsolutions.example',      fullName: 'Sumit Raj',       roleCode: 'FOUNDER_CEO',         passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'director@fintechitsolutions.example',     fullName: 'Aarav Mehta',     roleCode: 'DIRECTOR',            employeeCode: 'FITS-0002', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'hr.head@fintechitsolutions.example',      fullName: 'Ananya Iyer',     roleCode: 'DEPT_HEAD',           employeeCode: 'FITS-0003', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'finance.head@fintechitsolutions.example', fullName: 'Rohan Deshpande', roleCode: 'FINANCE_MANAGER',     employeeCode: 'FITS-0004', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'eng.head@fintechitsolutions.example',     fullName: 'Vikram Nair',     roleCode: 'ENGINEERING_MANAGER', employeeCode: 'FITS-0005', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'manager@fintechitsolutions.example',      fullName: 'Priya Sharma',    roleCode: 'MANAGER',             employeeCode: 'FITS-0006', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'lead@fintechitsolutions.example',         fullName: 'Karthik Reddy',   roleCode: 'TEAM_LEAD',           employeeCode: 'FITS-0007', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'recruiter@fintechitsolutions.example',    fullName: 'Neha Kulkarni',   roleCode: 'RECRUITER',           employeeCode: 'FITS-0008', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'engineer@fintechitsolutions.example',     fullName: 'Arjun Verma',     roleCode: 'ENGINEER',            employeeCode: 'FITS-0009', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'qa@fintechitsolutions.example',           fullName: 'Sneha Pillai',    roleCode: 'QA',                  employeeCode: 'FITS-0010', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'employee@fintechitsolutions.example',     fullName: 'Ravi Kumar',      roleCode: 'EMPLOYEE',            employeeCode: 'FITS-0011', passwordHash: DEMO_PASSWORD_HASHES.default },
  { email: 'auditor@fintechitsolutions.example',      fullName: 'Meera Joshi',     roleCode: 'AUDITOR',             employeeCode: 'FITS-0012', passwordHash: DEMO_PASSWORD_HASHES.default },
];