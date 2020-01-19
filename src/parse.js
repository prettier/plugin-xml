const { parse: xmlToolsParse } = require("@xml-tools/parser");

const parse = (text, _parsers, _opts) => {
  const { lexErrors, parseErrors, cst } = xmlToolsParse(text);

  if (lexErrors.length > 0 || parseErrors.length > 0) {
    throw Error("Error parsing XML");
  }

  return cst;
};

module.exports = parse;
