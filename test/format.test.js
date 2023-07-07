import { readFileSync } from "fs";
import * as prettier from "prettier";
import plugin from "../src/plugin.js";

const fixture = readFileSync(
  new URL("./fixture.xml", import.meta.url),
  "utf-8"
);

function format(content, opts = {}) {
  return prettier.format(content, {
    ...opts,
    parser: "xml",
    plugins: [plugin]
  });
}

test("defaults", async () => {
  const formatted = await format(fixture);
  expect(formatted).toMatchSnapshot();
});

test("xmlWhitespaceSensitivity => ignore", async () => {
  const formatted = await format(fixture, {
    xmlWhitespaceSensitivity: "ignore"
  });
  expect(formatted).toMatchSnapshot();
});

test("bracketSameLine => true", async () => {
  const formatted = await format(fixture, {
    bracketSameLine: true,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});

test("xmlSelfClosingSpace => false", async () => {
  const formatted = await format(fixture, {
    xmlSelfClosingSpace: false,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});

test("bracketSameLine => true, xmlSelfClosingSpace => false", async () => {
  const formatted = await format(fixture, {
    bracketSameLine: true,
    xmlSelfClosingSpace: false,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});

test("singleAttributePerLine => true", async () => {
  const formatted = await format(fixture, {
    singleAttributePerLine: true,
    xmlWhitespaceSensitivity: "ignore"
  });

  expect(formatted).toMatchSnapshot();
});

test("xmlWhitespaceSensitivity => preserve", async () => {
  const formatted = await format(fixture, {
    xmlWhitespaceSensitivity: "preserve"
  });

  expect(formatted).toMatchSnapshot();
});

test("xmlSortAttributesByKey => true", async () => {
  const formatted = await format(fixture, {
    xmlSortAttributesByKey: true
  });
});

test("xmlQuoteAttributes => preserve", async () => {
  const formatted = await format(fixture, {
    xmlQuoteAttributes: "preserve"
  });

  expect(formatted).toMatchSnapshot();
});

test("xmlQuoteAttributes => single", async () => {
  const formatted = await format(fixture, {
    xmlQuoteAttributes: "single"
  });

  expect(formatted).toMatchSnapshot();
});

test("xmlQuoteAttributes => double", async () => {
  const formatted = await format(fixture, {
    xmlQuoteAttributes: "double"
  });

  expect(formatted).toMatchSnapshot();
});
