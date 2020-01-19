const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

test("fixture", () => {
  const filepath = path.join(__dirname, "./fixture.xml");
  const content = fs.readFileSync(filepath, "utf-8");

  const formatted = prettier.format(content, { parser: "xml", plugins: ["."] });
  expect(formatted).toMatchSnapshot();
});
