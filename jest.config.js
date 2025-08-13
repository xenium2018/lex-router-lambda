module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '*.js',
    '!jest.config.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ]
};