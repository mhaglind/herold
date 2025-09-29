module.exports = {
  // Test environment
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Root directory
  rootDir: '.',

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
  ],

  // File transformations
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/client/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@server/(.*)$': '<rootDir>/src/server/$1',
    '^@algorithms/(.*)$': '<rootDir>/src/algorithms/$1',
    '^@components/(.*)$': '<rootDir>/src/client/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/client/pages/$1',
    '^@hooks/(.*)$': '<rootDir>/src/client/hooks/$1',
    '^@store/(.*)$': '<rootDir>/src/client/store/$1',
    '^@types/(.*)$': '<rootDir>/src/client/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/client/utils/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.config.{ts,js}',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test timeout
  testTimeout: 10000,

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],

  // Module patterns to ignore
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Automatically restore mock state between tests
  restoreMocks: true,
};