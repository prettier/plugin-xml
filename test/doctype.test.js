const { here } = require("./utils");

describe("doctype", () => {
  test("prints out first line if it's a doctype", () => {
    const content = here(`
      <?xml version="1.0" encoding="UTF-8"?>
      <foo />
    `);

    expect(content).toMatchFormat();
  });
});
