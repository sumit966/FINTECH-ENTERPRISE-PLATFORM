// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Employee name generator (run once)
// Interleaves 100 first names with 50 last names via a diagonal walk
// (first[i + k], last[(i + k) % lastCount]) so no two consecutive names
// share a first name. Output: 500 unique names, mixed gender.
// ============================================================================
import * as fs from 'fs';
import * as path from 'path';

const FIRST_NAMES: { name: string; gender: 'MALE' | 'FEMALE' }[] = [
  // North Indian Hindu - male (1-15)
  { name: 'Aarav',      gender: 'MALE' },
  { name: 'Vivaan',     gender: 'MALE' },
  { name: 'Aditya',     gender: 'MALE' },
  { name: 'Arjun',      gender: 'MALE' },
  { name: 'Reyansh',    gender: 'MALE' },
  { name: 'Krishna',    gender: 'MALE' },
  { name: 'Ishaan',     gender: 'MALE' },
  { name: 'Kabir',      gender: 'MALE' },
  { name: 'Ansh',       gender: 'MALE' },
  { name: 'Atharv',     gender: 'MALE' },
  { name: 'Advait',     gender: 'MALE' },
  { name: 'Dhruv',      gender: 'MALE' },
  { name: 'Rudra',      gender: 'MALE' },
  { name: 'Shaurya',    gender: 'MALE' },
  { name: 'Parth',      gender: 'MALE' },
  // North Indian Hindu - female (16-30)
  { name: 'Ananya',     gender: 'FEMALE' },
  { name: 'Diya',       gender: 'FEMALE' },
  { name: 'Aadhya',     gender: 'FEMALE' },
  { name: 'Saanvi',     gender: 'FEMALE' },
  { name: 'Myra',       gender: 'FEMALE' },
  { name: 'Anika',      gender: 'FEMALE' },
  { name: 'Kiara',      gender: 'FEMALE' },
  { name: 'Navya',      gender: 'FEMALE' },
  { name: 'Prisha',     gender: 'FEMALE' },
  { name: 'Isha',       gender: 'FEMALE' },
  { name: 'Aaradhya',   gender: 'FEMALE' },
  { name: 'Ridhi',      gender: 'FEMALE' },
  { name: 'Nitya',      gender: 'FEMALE' },
  { name: 'Tanvi',      gender: 'FEMALE' },
  { name: 'Kavya',      gender: 'FEMALE' },
  // South Indian Hindu - male (31-45)
  { name: 'Karthik',    gender: 'MALE' },
  { name: 'Vignesh',    gender: 'MALE' },
  { name: 'Rohan',      gender: 'MALE' },
  { name: 'Surya',      gender: 'MALE' },
  { name: 'Nikhil',     gender: 'MALE' },
  { name: 'Hari',       gender: 'MALE' },
  { name: 'Ganesh',     gender: 'MALE' },
  { name: 'Vishnu',     gender: 'MALE' },
  { name: 'Deepak',     gender: 'MALE' },
  { name: 'Siddharth',  gender: 'MALE' },
  { name: 'Ajay',       gender: 'MALE' },
  { name: 'Anand',      gender: 'MALE' },
  { name: 'Praveen',    gender: 'MALE' },
  { name: 'Suresh',     gender: 'MALE' },
  { name: 'Ramesh',     gender: 'MALE' },
  // South Indian Hindu - female (46-60)
  { name: 'Aishwarya',  gender: 'FEMALE' },
  { name: 'Divya',      gender: 'FEMALE' },
  { name: 'Meenakshi',  gender: 'FEMALE' },
  { name: 'Lakshmi',    gender: 'FEMALE' },
  { name: 'Kavitha',    gender: 'FEMALE' },
  { name: 'Shruti',     gender: 'FEMALE' },
  { name: 'Sandhya',    gender: 'FEMALE' },
  { name: 'Priyanka',   gender: 'FEMALE' },
  { name: 'Swathi',     gender: 'FEMALE' },
  { name: 'Ramya',      gender: 'FEMALE' },
  { name: 'Nandini',    gender: 'FEMALE' },
  { name: 'Reshma',     gender: 'FEMALE' },
  { name: 'Keerthi',    gender: 'FEMALE' },
  { name: 'Anjali',     gender: 'FEMALE' },
  { name: 'Sowmya',     gender: 'FEMALE' },
  // East Indian - male (61-70)
  { name: 'Abir',       gender: 'MALE' },
  { name: 'Arnab',      gender: 'MALE' },
  { name: 'Sayan',      gender: 'MALE' },
  { name: 'Ritwik',     gender: 'MALE' },
  { name: 'Debashish',  gender: 'MALE' },
  { name: 'Sourav',     gender: 'MALE' },
  { name: 'Ayush',      gender: 'MALE' },
  { name: 'Prithvi',    gender: 'MALE' },
  { name: 'Anirban',    gender: 'MALE' },
  { name: 'Subhankar',  gender: 'MALE' },
  // East Indian - female (71-80)
  { name: 'Rupsa',      gender: 'FEMALE' },
  { name: 'Ishita',     gender: 'FEMALE' },
  { name: 'Sohini',     gender: 'FEMALE' },
  { name: 'Rituparna',  gender: 'FEMALE' },
  { name: 'Debjani',    gender: 'FEMALE' },
  { name: 'Shreya',     gender: 'FEMALE' },
  { name: 'Sayantani',  gender: 'FEMALE' },
  { name: 'Mousumi',    gender: 'FEMALE' },
  { name: 'Anwesha',    gender: 'FEMALE' },
  { name: 'Bidisha',    gender: 'FEMALE' },
  // Muslim - male (81-90)
  { name: 'Mohammed',   gender: 'MALE' },
  { name: 'Abdul',      gender: 'MALE' },
  { name: 'Faizan',     gender: 'MALE' },
  { name: 'Ayan',       gender: 'MALE' },
  { name: 'Rehan',      gender: 'MALE' },
  { name: 'Zaid',       gender: 'MALE' },
  { name: 'Imran',      gender: 'MALE' },
  { name: 'Salman',     gender: 'MALE' },
  { name: 'Aamir',      gender: 'MALE' },
  { name: 'Bilal',      gender: 'MALE' },
  // Muslim - female (91-100)
  { name: 'Ayesha',     gender: 'FEMALE' },
  { name: 'Fatima',     gender: 'FEMALE' },
  { name: 'Zainab',     gender: 'FEMALE' },
  { name: 'Nida',       gender: 'FEMALE' },
  { name: 'Sana',       gender: 'FEMALE' },
  { name: 'Rukhsar',    gender: 'FEMALE' },
  { name: 'Saba',       gender: 'FEMALE' },
  { name: 'Hina',       gender: 'FEMALE' },
  { name: 'Nazia',      gender: 'FEMALE' },
  { name: 'Zoya',       gender: 'FEMALE' },
];

const LAST_NAMES: string[] = [
  'Sharma','Verma','Gupta','Singh','Yadav','Mishra','Agarwal','Chaudhary','Tiwari','Pandey',
  'Saxena','Bhatnagar','Srivastava','Khanna','Malhotra','Chopra','Kapoor','Iyer','Krishnan',
  'Subramanian','Pillai','Narayanan','Raghavan','Chandran','Prasad','Venkatesh','Balaji','Rajan',
  'Menon','Nair','Kulkarni','Reddy','Naidu','Varma','Shetty','Rao','Bhat','Kamath','Hegde',
  'Banerjee','Chatterjee','Mukherjee','Ghosh','Bose','Dutta','Sengupta','Chakraborty','Das','Roy',
];

export const FIRST_NAME_GENDER: Record<string, 'MALE' | 'FEMALE'> = {};
for (const f of FIRST_NAMES) FIRST_NAME_GENDER[f.name] = f.gender;

// Interleave: walk firsts and lasts on a diagonal so consecutive names differ
// in the first-name component. Guarantees no two adjacent names share a first.
const fullNames: string[] = [];
const seen = new Set<string>();
const N = 500;
for (let i = 0; i < N; i++) {
  const fi = i % FIRST_NAMES.length;
  const li = (i * 7 + Math.floor(i / FIRST_NAMES.length)) % LAST_NAMES.length;
  let attempt = 0;
  let full = FIRST_NAMES[fi].name + ' ' + LAST_NAMES[li];
  while (seen.has(full) && attempt < LAST_NAMES.length) {
    attempt++;
    full = FIRST_NAMES[fi].name + ' ' + LAST_NAMES[(li + attempt) % LAST_NAMES.length];
  }
  seen.add(full);
  fullNames.push(full);
}

if (fullNames.length !== 500) throw new Error('Expected 500 names, got ' + fullNames.length);

const outPath = path.resolve(__dirname, '..', 'database', 'data', 'employee-names.data.ts');
const fileContent =
  '// ============================================================================\n' +
  '// NEXUS ENTERPRISE PLATFORM - 500 unique Indian employee names\n' +
  '// Generated once by scripts/generate-employee-names.ts (deterministic).\n' +
  '// ============================================================================\n' +
  '\n' +
  'export const employeeNames: string[] = [\n' +
  fullNames.map((n) => "  '" + n + "',").join('\n') +
  '\n];\n' +
  '\n' +
  'export const firstNameGender: Record<string, "MALE" | "FEMALE"> = {\n' +
  Object.entries(FIRST_NAME_GENDER).map(([k, v]) => "  '" + k + "': '" + v + "',").join('\n') +
  '\n};\n';

fs.writeFileSync(outPath, fileContent, { encoding: 'utf8' });

const maleCount = fullNames.filter((n) => FIRST_NAME_GENDER[n.split(' ')[0]] === 'MALE').length;
const femaleCount = fullNames.length - maleCount;
console.log('Wrote ' + fullNames.length + ' names to ' + outPath);
console.log('Gender: MALE=' + maleCount + ' FEMALE=' + femaleCount);
console.log('First 10 names:');
for (let i = 0; i < 10; i++) console.log('  ' + fullNames[i]);