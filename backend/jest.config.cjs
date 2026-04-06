module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/config/database.js"],
  coverageDirectory: "<rootDir>/coverage",
  clearMocks: true,
  restoreMocks: true,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "<rootDir>/reports/junit",
        outputName: "backend-tests.xml",
      },
    ],
  ],
};
