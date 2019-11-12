const { here, long } = require("./utils");

describe("leaf", () => {
  test("basic", () => {
    expect("<node><leaf /></node>").toChangeFormat(
      here(`
        <node>
          <leaf />
        </node>
      `)
    );
  });

  test("empty, self-closing allowed", () => {
    expect('<node foo="bar" />').toMatchFormat();
  });

  test("empty, self-closing not allowed", () => {
    expect('<node foo="bar" />').toChangeFormat('<node foo="bar"></node>', {
      xmlSelfClosingTags: false
    });
  });

  test("attrs", () => {
    expect('<node foo="bar"><leaf /></node>').toChangeFormat(
      here(`
        <node foo="bar">
          <leaf />
        </node> 
      `)
    );
  });

  test("long attrs", () => {
    expect(`<node ${long}="bar"><leaf /></node>`).toChangeFormat(
      here(`
        <node
          ${long}="bar"
        >
          <leaf />
        </node>
      `)
    );
  });
});
