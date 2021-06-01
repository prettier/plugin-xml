import fs from "fs";
import path from "path";
import prettier from "prettier";

import { XMLOptions } from "../src/types";
import plugin from "../src/plugin";

const fixture = fs.readFileSync(path.join(__dirname, "./fixture.xml"), "utf-8");

function format(content: string, opts: Partial<XMLOptions> = {}) {
  return prettier.format(content, {
    ...opts,
    parser: "xml",
    plugins: [plugin]
  });
}

test("defaults", () => {
  const formatted = format(fixture);
  expect(formatted).toMatchSnapshot();
});

test("xmlWhitespaceSensitivity => ignore", () => {
  const formatted = format(fixture, { xmlWhitespaceSensitivity: "ignore" });
  expect(formatted).toMatchSnapshot();
});
