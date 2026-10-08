// ============================================================================
// NEXUS ENTERPRISE PLATFORM — One-time bcrypt hash generator
// Run once. Copy the printed hash into database/data/users.data.ts
// (DEMO_PASSWORD_HASHES.default).
//
//   cd backend
//   npx ts-node ..\scripts\generate-hashes.ts
// ============================================================================
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'Nexus@2024!';
const ROUNDS = 12;

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, ROUNDS);
  console.log('');
  console.log('=============================================================');
  console.log(' Demo password:', DEMO_PASSWORD);
  console.log(' Bcrypt hash  :', hash);
  console.log('=============================================================');
  console.log('');
  console.log('Paste the hash into database/data/users.data.ts:');
  console.log('');
  console.log("  export const DEMO_PASSWORD_HASHES: Record<string, string> = {");
  console.log(`    default: '${hash}',`);
  console.log('  };');
  console.log('');
}
main().catch((e) => { console.error(e); process.exit(1); });