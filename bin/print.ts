#!./node_modules/.bin/ts-node

import fs from "fs";
import prettier from "prettier";

import plugin from "../src/plugin";
import { XMLOptions } from "../src/types";

const code = fs.existsSync(process.argv[2])
  ? fs.readFileSync(process.argv[2], "utf-8")
  : process.argv.slice(2).join(" ").replace(/\\n/g, "\n");

const options: Partial<XMLOptions> = {
  parser: "xml",
  plugins: [plugin],
  xmlWhitespaceSensitivity: "ignore"
};

console.log(prettier.format(code, options));
