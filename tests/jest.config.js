require('dotenv').config({ path: 'D:/NexusScaffold/FINTECH-ENTERPRISE-PLATFORM/backend/.env' });

module.exports = {
  rootDir: 'D:/NexusScaffold/FINTECH-ENTERPRISE-PLATFORM',
  testEnvironment: 'node',
  roots: ['D:/NexusScaffold/FINTECH-ENTERPRISE-PLATFORM/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'CommonJS',
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        types: ['node', 'jest'],
      },
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testTimeout: 30000,
  verbose: true,
};
