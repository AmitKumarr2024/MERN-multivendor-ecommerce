/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: {}, // no Babel transform needed - Node runs ESM natively via --experimental-vm-modules
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 15000,
  clearMocks: true,
  verbose: true,
};
