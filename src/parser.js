const { parse: xmlToolsParse } = require("@xml-tools/parser");

const parse = (text, _parsers, _opts) => {
  const { lexErrors, parseErrors, cst } = xmlToolsParse(text);

  if (lexErrors.length > 0 || parseErrors.length > 0) {
    throw Error("Error parsing XML");
  }

  return cst;
};

const locStart = (node) => {
  if (node.location) {
    return node.location.startOffset;
  }
  return node.startOffset;
};

const locEnd = (node) => {
  if (node.location) {
    return node.location.endOffset;
  }
  return node.endOffset;
};

const xml = {
  parse,
  astFormat: "xml",
  locStart,
  locEnd
};

module.exports = xml;
