/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.browser.json',
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
};

