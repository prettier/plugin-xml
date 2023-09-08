import parser from "../src/parser.js";

test("parseError", () => {
  const expected = new SyntaxError(
    "Expecting: one of these possible Token sequences:\n" +
      "  1. [CLOSE]\n" +
      "  2. [SLASH_CLOSE]\n" +
      "but found: '/' (1:6)"
  );

  expect(() => parser.parse("<foo /")).toThrow(expected);
});
