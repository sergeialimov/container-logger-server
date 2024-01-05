/* eslint-disable */
export default {
  displayName: "shared",
  preset: "../../jest.preset.js",
  globals: {},
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/libs/shared",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  roots: ["tests/unit"],
  collectCoverageFrom: [ "src/**/*.ts", "!src/**/index.ts" ],
};
