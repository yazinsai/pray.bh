export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  modulePathIgnorePatterns: ['<rootDir>/.next'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.ts',
  ],
};