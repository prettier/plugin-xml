const { here } = require("./utils");

describe("comment", () => {
  test("renders appropriately", () => {
    const content = here(`
      <!--
      ~ Copyright (C) Some Corporation. All Rights Reserved.
      ~
      ~ Yada yada GNU General Public License
      ~ see <http://www.gnu.org/licenses/>.
      -->
      <foo>
        <!-- This is a single line comment -->
        <bar />
        <!-- This comment contains links, is multiline and comment opening on the same line
        as the text of the comment https://someurl.com/yada/\${blah-yada.etc} -->
        <baz>
          <!--Single line no inner space-->
          <qux />
        </baz>
        <!--
        Comment contains commented tags and is multi line 
        <commented-tag>-abc:def=something=gh_ih,jk=y,number=5005</commented-tag>
        -->
      </foo>
    `);

    expect(content).toMatchFormat();
  });
});
