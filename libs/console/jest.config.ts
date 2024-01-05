/* eslint-disable */
export default {
  displayName: "console",
  preset: "../../jest.preset.js",
  globals: {},
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" } ]
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/libs/console",
};
