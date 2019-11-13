const parser = require("fast-xml-parser");

const parse = (text, _parsers, _opts) =>
  parser.getTraversalObj(text, {
    allowBooleanAttributes: true,
    attributeNamePrefix: "",
    cdataTagName: "#cdata",
    ignoreAttributes: false,
    parseAttributeValue: true,
    textNodeName: "#text"
  });

module.exports = parse;
