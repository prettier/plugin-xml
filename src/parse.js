const parser = require("fast-xml-parser");

const attributeNamePrefix = "@_";
const textNodeName = "#text";

const translate = (node, name) => {
  if (typeof node !== "object") {
    return { type: "leaf", name, attrs: {}, value: node.toString() };
  }

  const attrs = {};
  let value = [];

  Object.keys(node).forEach(key => {
    const children = node[key];

    if (key.startsWith(attributeNamePrefix)) {
      attrs[key.slice(2)] = children;
    } else if (Array.isArray(children)) {
      value = value.concat(children.map(child => translate(child, key)));
    } else if (key !== textNodeName) {
      value.push(translate(children, key));
    }
  });

  if (Object.prototype.hasOwnProperty.call(node, textNodeName)) {
    return { type: "leaf", name, attrs, value: node[textNodeName] };
  }

  return { type: "node", name, attrs, value };
};

const parse = (text, _parsers, _opts) =>
  Object.assign(
    {},
    translate(
      parser.parse(text, {
        allowBooleanAttributes: true,
        attributeNamePrefix,
        ignoreAttributes: false,
        parseAttributeValue: true,
        textNodeName
      })
    ),
    { type: "root" }
  );

module.exports = parse;
