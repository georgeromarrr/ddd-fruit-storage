// customMatchers.js
const { expect } = require("@jest/globals");

const toBeEmpty = (received) => {
  const pass =
    received === null ||
    received === undefined ||
    received === "" ||
    (received && typeof received === "object" && Object.keys(received).length === 0) ||
    (received && Array.isArray(received) && received.length === 0);

  if (pass) {
    return {
      message: () => `Expected value to be null, undefined, or an empty, but received: ${received}`,
      pass: true,
    };
  } else {
    return {
      message: () => `Expected value not to be null, undefined, or an empty, but received: ${received}`,
      pass: false,
    };
  }
};

expect.extend({
  toBeEmpty,
});

module.exports = toBeEmpty;
