module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/*.test.js', '**/tests/*.test.js'],
  verbose: false,
  setupFilesAfterEnv: ['<rootDir>src/setupTests.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    // 'controllers/**/*.js',
    // 'routes/**/*.js',
    // 'services/**/*.js',
    // 'middlewares/**/*.js',
    'src/**/*.js',
    'src/*.js',
  ],
};
