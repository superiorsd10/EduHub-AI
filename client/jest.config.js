const nextJest = require('next/jest')
 
const createJestConfig = nextJest({
  dir: './',
})
 
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  preset:'ts-jest',
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/firebase/(.*)$": "<rootDir>/src/firebase/$1",
    "^@/layout/(.*)$": "<rootDir>/src/layout/$1",
    "^@/pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@/styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@/testing-utils/(.*)$": "<rootDir>/testing-utils/$1",
  },
  coverageDirectory: 'coverage',
}

module.exports = createJestConfig(config)