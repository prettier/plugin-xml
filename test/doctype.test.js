const { here } = require("./utils");

describe("doctype", () => {
  test("renders appropriately", () => {
    const content = here(`
      <?xml version="1.0" encoding="UTF-8" ?>
      <?xml-model href="model.rnc" type="application/relax-ng-compact-sync-syntax" ?>
      <foo />
    `);

    expect(content).toMatchFormat();
  });
});
