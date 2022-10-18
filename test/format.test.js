const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const plugin = require("../src/plugin");

const fixture = fs.readFileSync(path.join(__dirname, "./fixture.xml"), "utf-8");

function format(content, opts = {}) {
  return prettier.format(content, { ...opts, parser: "xml", plugins: [plugin] });
}

test("defaults", () => {
  const formatted = format(fixture);
  expect(formatted).toMatchSnapshot();
});

test("xmlWhitespaceSensitivity => ignore", () => {
  const formatted = format(fixture, { xmlWhitespaceSensitivity: "ignore" });
  expect(formatted).toMatchSnapshot();
});

test("bracketSameLine => true", () => {
  const formatted = format(fixture, {
    bracketSameLine: true,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});

test("xmlSelfClosingSpace => false", () => {
  const formatted = format(fixture, {
    xmlSelfClosingSpace: false,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});

test("bracketSameLine => true, xmlSelfClosingSpace => false", () => {
  const formatted = format(fixture, {
    bracketSameLine: true,
    xmlSelfClosingSpace: false,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});

test("singleAttributePerLine => true", () => {
  const formatted = format(fixture, {
    singleAttributePerLine: true,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});
