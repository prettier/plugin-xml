import { readFileSync } from "fs";
import { join } from "path";
import * as prettier from "prettier";
import * as url from "url";

import plugin from "../src/plugin";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const fixture = readFileSync(join(__dirname, "./fixture.xml"), "utf-8");

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
