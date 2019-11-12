const parser = require("fast-xml-parser");

const translate = (node, name) => {
  if (typeof node !== "object") {
    return { type: "leaf", name, attrs: {}, value: node.toString() };
  }

  const attrs = {};
  const value = [];

  Object.keys(node).forEach(key => {
    if (key.startsWith("@_")) {
      attrs[key.slice(2)] = node[key];
    } else if (key !== "#text") {
      value.push(translate(node[key], key));
    }
  });

  if (Object.prototype.hasOwnProperty.call(node, "#text")) {
    return { type: "leaf", name, attrs, value: node["#text"] };
  }

  return { type: "node", name, attrs, value };
};

const parse = (text, _parsers, _opts) => Object.assign(
  {},
  translate(parser.parse(text, {
    allowBooleanAttributes: true,
    attributeNamePrefix : "@_",
    ignoreAttributes: false,
    parseAttributeValue: true,
    textNodeName: "#text"
  })),
  { type: "root" }
);

module.exports = parse;
