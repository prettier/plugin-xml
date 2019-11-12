const { here } = require("./utils");

describe("arrays", () => {
  test("multiple matching nodes", () => {
    const content = here(`
      <parent>
        <child>foo</child>
        <child>bar</child>
        <child>baz</child>
      </parent>
    `);

    expect(content).toMatchFormat();
  });
});
