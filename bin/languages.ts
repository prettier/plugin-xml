import fs from "node:fs";
import path from "node:path";

import LinguistLanguages from "linguist-languages";
import prettier, { SupportLanguage } from "prettier";

function getSupportLanguages() {
  const supportLanguages: SupportLanguage[] = [];

  for (const language of Object.values(LinguistLanguages)) {
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
const source = `import { SupportLanguage } from "prettier";
const languages: SupportLanguage[] = ${languages};
export default languages;`;

const packagePath = path.join(path.dirname(__dirname), "package.json");
const packageConfig = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const { plugins, ...prettierConfig } = packageConfig.prettier;

fs.writeFileSync(
  "src/languages.ts",
  prettier.format(source, { parser: "typescript", ...prettierConfig })
);
