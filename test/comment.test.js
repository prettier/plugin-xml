const { here } = require("./utils");

describe("comment", () => {
  test("renders appropriately", () => {
    const content = here(`
      <foo>
        <!-- this is a comment -->
        <bar />
        <!-- this is another comment -->
        <baz>
          <!-- this is a multiline 
          comment -->
          <qux />
          <!-- <tag> -->
          <!--
            multiline comment with commented xml node
            <node>Node text</node>
          -->
        </baz>
      </foo>
    `);

    expect(content).toMatchFormat();
  });
});
