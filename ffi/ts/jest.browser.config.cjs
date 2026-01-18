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
    // Map blsct imports to browser version for WASM tests
    '^(.*)/blsct$': '$1/blsct.browser',
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
  // Browser tests look for *.browser.test.ts files
  testMatch: ['**/__tests__/**/*.browser.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage/browser',
  verbose: true,
  // Longer timeout for WASM initialization
  testTimeout: 30000,
  // Set the root directory for wasm resolution
  roots: ['<rootDir>/src'],
  // Expose globals for WASM path resolution
  globals: {
    WASM_PATH: path.resolve(__dirname, 'wasm/blsct.js'),
  },
};

