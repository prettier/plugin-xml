const { here } = require("./utils");

describe("comment", () => {
  test("renders appropriately", () => {
    const content = here(`
      <foo>
        <!-- this is a comment -->
        <bar />
        <!-- this is another comment -->
        <baz>
          <qux />
        </baz>
      </foo>
    `);

    expect(content).toMatchFormat();
  });
});
