// jest.config.cjs - Jest configuration for ESM project with WAX
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 60000, // 60 seconds timeout for tests with API calls
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
        allowJs: true,
        noEmit: true,
        rootDir: '.',
      },
      useESM: true,
    }],
    // Also transform ESM JS files from node_modules
    '^.+\\.m?js$': ['ts-jest', {
      tsconfig: {
        allowJs: true,
        module: 'ESNext',
        esModuleInterop: true,
        skipLibCheck: true,
      },
      useESM: true,
      isolatedModules: true,
    }],
  },
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*-test.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    // Handle ESM imports with .js extension
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Map root imports to their actual paths
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Transform WAX ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(@hiveio/wax)/)'
  ],
  globals: {
    ENV_REQUIREMENTS: {
      required: ['HIVE_USERNAME'],
      recommended: [
        'HIVE_POSTING_KEY',
        'HIVE_ACTIVE_KEY',
        'HIVE_MEMO_KEY',
        'HIVE_OWNER_KEY',
        'TEST_PRIVATE_KEY'
      ]
    }
  },
  reporters: [
    'default',
    ['<rootDir>/tests/env-reporter.cjs', {}]
  ],
};
