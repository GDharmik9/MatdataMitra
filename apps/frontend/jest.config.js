const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ["**/__tests__/**/*.test.tsx", "**/__tests__/**/*.test.ts"],
};

module.exports = createJestConfig(customJestConfig);
