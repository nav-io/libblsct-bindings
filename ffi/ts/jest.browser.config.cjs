const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // Don't transform wasm paths - they need the .js extension
    '^(.*)/wasm/blsct\\.js$': '<rootDir>/wasm/blsct.js',
    // Transform other .js imports to remove extension for TypeScript
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Map imports to browser versions for WASM tests
    '^(.*)/blsct$': '$1/blsct.browser',
    '^(.*)/managedObj$': '$1/managedObj.browser',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          target: 'ES2021',
          module: 'ES2020',
          moduleResolution: 'node',
          isolatedModules: true,
          lib: ['ES2021', 'DOM'],
          strict: true,
          noImplicitAny: true,
          noImplicitReturns: true,
          noImplicitThis: true,
          esModuleInterop: true,
          skipLibCheck: true,
          baseUrl: '.',
          paths: {
            '*/blsct': ['*/blsct.browser']
          }
        },
      },
    ],
  },
  // Run all test files (same as native tests) with WASM backend
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Exclude browser-specific test file (it's now redundant) and helper files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.d\\.ts$',
    'basic\\.browser\\.test\\.ts$',  // Skip the old browser-specific test
    '__tests__/rangeProof\\.ts$',     // Skip duplicate (use rangeProof.test.ts)
    '__tests__/amountRecoveryRes\\.ts$', // Skip helper file
  ],
  // Initialize WASM before all tests
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.browser.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage/browser',
  verbose: true,
  // Longer timeout for WASM operations (range proofs can be slow)
  testTimeout: 60000,
  // Set the root directory for wasm resolution
  roots: ['<rootDir>/src'],
  // Expose globals for WASM path resolution
  globals: {
    WASM_PATH: path.resolve(__dirname, 'wasm/blsct.js'),
  },
};

