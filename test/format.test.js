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

test.each([2, 4])(
  "preserve indents nested elements after text with tabWidth %i",
  async (tabWidth) => {
    const space = " ".repeat(tabWidth);
    const input = [
      "<root>",
      `${space}<a>`,
      `${space.repeat(2)}Text`,
      `${space.repeat(2)}<b>`,
      `${space.repeat(3)}<c />`,
      `${space.repeat(2)}</b>`,
      `${space}</a>`,
      "</root>",
      ""
    ].join("\n");
    const options = { xmlWhitespaceSensitivity: "preserve", tabWidth };

    const formatted = await format(input, options);
    expect(formatted).toBe(input);
    expect(await format(formatted, options)).toBe(formatted);
  }
);

test("preserve indents nested elements after text with tabs", async () => {
  const input = "<a>\n\tText\n\t<b>\n\t\t<c />\n\t</b>\n</a>\n";
  expect(
    await format(input, { xmlWhitespaceSensitivity: "preserve", useTabs: true })
  ).toBe(input);
});

test("preserve keeps inline mixed text whitespace", async () => {
  const input = "<a> before  <b> middle  </b> after </a>\n";
  expect(await format(input, { xmlWhitespaceSensitivity: "preserve" })).toBe(
    input
  );
});

test.each(["strict", "preserve", "ignore"])(
  "xml:space preserves mixed content in %s mode",
  async (xmlWhitespaceSensitivity) => {
    const input =
      '<a xml:space="preserve">\n  Text\n  <b>\n    <c />\n  </b>\n</a>\n';
    expect(await format(input, { xmlWhitespaceSensitivity })).toBe(input);
  }
);

test("xmlSortAttributesByKey => true", async () => {
  const formatted = await format(fixture, {
    xmlSortAttributesByKey: true
  });

  expect(formatted).toMatchSnapshot();
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
