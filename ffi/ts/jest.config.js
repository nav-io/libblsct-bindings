const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.d\\.ts$',
    '\\.browser\\.test\\.ts$',  // Exclude browser tests from native test run
  ],
  transform: {
    ...tsJestTransformCfg,
  },
};
