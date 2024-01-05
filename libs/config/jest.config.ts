/* eslint-disable */
export default {
  displayName: {
    name: "config",
    color: "redBright",
  },
  preset: "../../jest.preset.js",
  globals: {},
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" } ]
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/libs/config",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  roots: ["tests/unit"],
};
