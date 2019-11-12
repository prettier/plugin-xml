const parser = require("fast-xml-parser");

const translate = (node, name) => {
  if (typeof node !== "object") {
    return { type: "leaf", name, attrs: {}, value: node.toString() };
  }

  const attrs = {};
  let value = [];

  Object.keys(node).forEach(key => {
    const children = node[key];

    if (key.startsWith("@_")) {
      attrs[key.slice(2)] = children;
    } else if (Array.isArray(children)) {
      value = value.concat(children.map(child => translate(child, key)));
    } else if (key !== "#text") {
      value.push(translate(children, key));
    }
  });

  if (Object.prototype.hasOwnProperty.call(node, "#text")) {
    return { type: "leaf", name, attrs, value: node["#text"] };
  }

  return { type: "node", name, attrs, value };
};

const parse = (text, _parsers, _opts) =>
  Object.assign(
    {},
    translate(
      parser.parse(text, {
        allowBooleanAttributes: true,
        attributeNamePrefix: "@_",
        ignoreAttributes: false,
        parseAttributeValue: true,
        textNodeName: "#text"
      })
    ),
    { type: "root" }
  );

module.exports = parse;
