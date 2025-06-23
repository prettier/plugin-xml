#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import * as linguistLanguages from "linguist-languages";
import { format } from "prettier";
import packageJSON from "../package.json" with { type: "json" };

function getSupportLanguages() {
  const supportLanguages = [];

  for (const language of Object.values(linguistLanguages)) {
    if (language.aceMode === "xml") {
      const { type, color, aceMode, languageId, ...config } = language;

      // Before we used linguist to get the languages, we had a
      // manually-maintained list. These two had been added manually. So in the
      // interest of not breaking anything, we'll add them back in here.
      if (language.name === "XML") {
        let extensions = language.extensions;
        if (extensions) {
          extensions.push(".inx", ".runsettings");
          config.extensions = extensions
            // https://github.com/github-linguist/linguist/pull/1842
            .filter((e) => ![".ts", ".tsx"].includes(e))
            .sort();
        }
      }

      supportLanguages.push({
        ...config,
        since: "0.1.0",
        parsers: ["xml"],
        linguistLanguageId: languageId,
        vscodeLanguageIds: ["xml"]
      });
    }
  }

  return supportLanguages;
}

const languages = JSON.stringify(getSupportLanguages());
const { plugins, ...prettierConfig } = packageJSON.prettier;

const formatted = await format(`export default ${languages};`, {
  parser: "babel",
  ...prettierConfig
});
writeFileSync("src/languages.js", formatted);
