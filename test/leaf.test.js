const { here, long } = require("./utils");

describe("leaf", () => {
  test("basic", () => {
    expect("<leaf>Value</leaf>").toMatchFormat();
  });

  test("breaking", () => {
    expect(`<leaf>${long}</leaf>`).toChangeFormat(
      here(`
        <leaf>
          ${long}
        </leaf>
      `)
    );
  });

  test("empty, self-closing allowed", () => {
    expect("<leaf />").toMatchFormat();
  });

  test("empty, self-closing not allowed", () => {
    expect("<leaf />").toChangeFormat("<leaf></leaf>", {
      xmlSelfClosingTags: false
    });
  });

  test("attrs", () => {
    expect('<leaf foo="bar">Value</leaf>').toMatchFormat();
  });

  test("long attrs", () => {
    expect(`<leaf ${long}="bar">Value</leaf>`).toChangeFormat(
      here(`
        <leaf
          ${long}="bar"
        >
          Value
        </leaf>
      `)
    );
  });
});
