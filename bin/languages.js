#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import linguistLanguages from "linguist-languages";
import { format } from "prettier";
import packageJSON from "../package.json" assert { type: "json" };

function getSupportLanguages() {
  const supportLanguages = [];

  for (const language of Object.values(linguistLanguages)) {
    if (language.aceMode === "xml") {
      const { type, color, aceMode, languageId, ...config } = language;

      // Before we used linguist to get the languages, we had a
      // manually-maintained list. These two had been added manually. So in the
      // interest of not breaking anything, we'll add them back in here.
      if (language.name === "XML") {
        language.extensions?.push(".inx", ".runsettings");
        language.extensions?.sort();
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
