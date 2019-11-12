const prettier = require("prettier");

const checkFormat = (before, after, config) => {
  const formatted = prettier.format(
    before,
    Object.assign({}, config, { parser: "xml", plugins: ["."] })
  );

  return {
    pass: formatted.trim() === after.trim(),
    message: () => `Expected:\n${after}\nReceived:\n${formatted}`
  };
};

expect.extend({
  toChangeFormat(before, after, config = {}) {
    return checkFormat(before, after, config);
  },
  toMatchFormat(before, config = {}) {
    return checkFormat(before, before, config);
  }
});
