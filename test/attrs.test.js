const { here, long } = require("./utils");

describe("attrs", () => {
  test("one attr one line", () => {
    expect('<node foo="bar" />').toMatchFormat();
  });

  test("one attr multi line", () => {
    expect(`<node ${long}="bar" />`).toChangeFormat(
      here(`
        <node
          ${long}="bar"
        />
      `)
    );
  });

  test("multi attrs one line", () => {
    expect('<node foo="bar" bar="baz" />').toMatchFormat();
  });

  test("multi attrs multi line", () => {
    expect(`<node ${long}a="foo" ${long}b="bar" />`).toChangeFormat(
      here(`
        <node
          ${long}a="foo"
          ${long}b="bar"
        />
      `)
    );
  });
});
