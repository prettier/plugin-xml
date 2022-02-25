import fs from "fs";
import path from "path";
import prettier from "prettier";

import { Options } from "../src/types";
import plugin from "../src/plugin";

const fixture = fs.readFileSync(path.join(__dirname, "./fixture.xml"), "utf-8");

function format(content: string, opts: Partial<Options> = {}) {
  return prettier.format(content, {
    ...opts,
    parser: "xml",
    plugins: [plugin as any as string] // hacky but it works
  });
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

test("xmlExpandSelfClosingTags => true", () => {
  const formatted = format(fixture, {
    xmlExpandSelfClosingTags: true
  });

  expect(formatted).toMatchSnapshot();
});
