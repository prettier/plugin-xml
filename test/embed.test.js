import * as prettier from "prettier";
import plugin from "../src/plugin.js";

function format(content, opts = {}) {
  const { plugins = [] } = opts;

  return prettier.format(content, {
    ...opts,
    parser: "xml",
    plugins: [...plugins, plugin]
  });
}

test("embeds properly when the name of the tag matches", async () => {
  const formatted = await format("<javascript>1+1;</javascript>");
  const expected = `<javascript>
1 + 1;
</javascript>
`;

  expect(formatted).toEqual(expected);
});

test("embeds properly when the type of the style tag matches", async () => {
  const formatted = await format(
    '<style type="text/css">body{color:red;}</style>'
  );
  const expected = `<style type="text/css">
body {
  color: red;
}
</style>
`;

  expect(formatted).toEqual(expected);
});

test("embeds properly when the type of the script tag matches", async () => {
  const formatted = await format(
    '<script type="text/javascript">1+1;</script>'
  );
  const expected = `<script type="text/javascript">
1 + 1;
</script>
`;

  expect(formatted).toEqual(expected);
});

const customScriptPlugin = {
  parsers: {
    customScript: {
      astFormat: "customScript",
      parse(text) {
        return { type: "root", text };
      },
      locStart() {
        return -1;
      },
      locEnd() {
        return -1;
      }
    }
  },
  printers: {
    customScript: {
      print(path) {
        const { hardline } = prettier.doc.builders;
        return ["customScript!!!", hardline, hardline, path.getValue().text];
      }
    }
  }
};

test("embeds properly when the type of the script tag matches a custom parser", async () => {
  const formatted = await format(
    '<script type="text/customScript">1+1;</script>',
    {
      plugins: [customScriptPlugin]
    }
  );

  const expected = `<script type="text/customScript">
customScript!!!

1+1;
</script>
`;

  expect(formatted).toEqual(expected);
});

test("does not embed when self-closing", async () => {
  const expected = `<script type="text/javascript" />\n`;
  const formatted = await format(expected);

  expect(formatted).toEqual(expected);
});
