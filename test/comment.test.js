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
        <!-- The spring-boot version should match the one managed by
        https://someurl.com/yada/\${blah-yada.etc} -->
        <baz>
          <!--Single line no inner space-->
          <qux />
        </baz>
        <!--
        Enable the line below to have remote debugging of your application on port 5005
        <commented-tag>-abc:def=something=gh_ih,jk=y,number=5005</commented-tag>
        -->
      </foo>
    `);

    expect(content).toMatchFormat();
  });
});
