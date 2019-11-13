const parse = require("../src/parse");

describe("location", () => {
  test("gets correct location metadata for inner nodes", () => {
    const content = "<foo><bar><baz /></bar></foo>";
    const { locStart, locEnd } = parse(content).children[0].children[0];

    expect(locStart).toEqual(content.indexOf("<bar>"));
    expect(locEnd).toEqual(content.indexOf("</foo>"));
  });

  test("gets correct location metadata for self-closing nodes", () => {
    const content = "<foo><bar><baz /></bar></foo>";
    const index = content.indexOf("<baz />");

    const { locStart, locEnd } = parse(
      content
    ).children[0].children[0].children[0];

    expect(locStart).toEqual(index);
    expect(locEnd).toEqual(index + "<bar />".length);
  });
});
