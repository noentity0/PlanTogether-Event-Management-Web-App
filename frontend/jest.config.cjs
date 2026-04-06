module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js", "**/*.test.jsx"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/main.jsx"],
  coverageDirectory: "<rootDir>/coverage",
  clearMocks: true,
  restoreMocks: true,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "<rootDir>/reports/junit",
        outputName: "frontend-tests.xml",
      },
    ],
  ],
};
