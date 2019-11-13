const { here } = require("./utils");

describe("cdata", () => {
  test("renders appropriately", () => {
    const content = here(`
      <data>
        <![CDATA[
           characters with markup
        ]]>
      </data>
    `);

    expect(content).toMatchFormat();
  });
});
