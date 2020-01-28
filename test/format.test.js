const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const fixture = fs.readFileSync(path.join(__dirname, "./fixture.xml"), "utf-8");
const format = (content, opts = {}) =>
  prettier.format(content, {
    ...opts,
    parser: "xml",
    plugins: ["."]
  });

test("defaults", () => {
  const formatted = format(fixture);
  expect(formatted).toMatchSnapshot();
});

test("xmlWhitespaceSensitivity => ignore", () => {
  const formatted = format(fixture, { xmlWhitespaceSensitivity: "ignore" });
  expect(formatted).toMatchSnapshot();
});
