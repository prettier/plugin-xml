const { here } = require("./utils");

describe("doctype", () => {
  test("renders appropriately", () => {
    const content = here(`
      <?xml version="1.0" encoding="UTF-8" ?>
      <?xml-model href="model.rnc" type="application/relax-ng-compact-sync-syntax" ?>
      <!DOCTYPE foo PUBLIC "-//OASIS//DTD DocBook XML V4.5//EN"
                               "http://docbook.org/xml/4.5/docbookx.dtd">
      <!DOCTYPE foo PUBLIC "-//OASIS//DTD DITA Task//EN" "foo.dtd">
      <foo />
    `);

    expect(content).toMatchFormat();
  });
});
