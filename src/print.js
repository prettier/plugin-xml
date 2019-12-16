const {
  concat,
  group,
  hardline,
  indent,
  join,
  line,
  softline
} = require("prettier/standalone").doc.builders;

const printAttrs = attrs => {
  if (Object.keys(attrs).length === 0) {
    return "";
  }

  const parts = [line];

  Object.keys(attrs).forEach((key, index) => {
    if (index !== 0) {
      parts.push(line);
    }
    parts.push(key, "=", '"', attrs[key], '"');
  });

  return group(indent(concat(parts)));
};

const printOpeningTag = (name, attrs) => {
  if (name === "!cdata") {
    return "<![CDATA[";
  }
  return group(concat(["<", name, printAttrs(attrs), softline, ">"]));
};

const printSelfClosingTag = (name, attrs) => {
  if (name === "!?xml" || name === "!?xml-model") {
    return group(concat(["<", name.slice(1), printAttrs(attrs), line, "?>"]));
  }

  return group(concat(["<", name, printAttrs(attrs), line, "/>"]));
};

const genericPrint = (path, opts, print) => {
  const { tagname, children, attrs, value } = path.getValue();

  if (tagname === "!root") {
    return concat([join(hardline, path.map(print, "children")), hardline]);
  }

  if (tagname === "!comment" || tagname === '!doctype') {
    return group(concat([value]));
  }

  if (Object.keys(children).length === 0 && !value && opts.xmlSelfClosingTags) {
    return printSelfClosingTag(tagname, attrs);
  }

  const openingTag = printOpeningTag(tagname, attrs);
  const closingTag = tagname === "!cdata" ? "]]>" : `</${tagname}>`;

  if (Object.keys(children).length === 0) {
    return group(
      concat([
        openingTag,
        indent(concat([softline, value])),
        softline,
        closingTag
      ])
    );
  }

  let inner;

  if (children.length === 0) {
    inner = softline;
  } else {
    inner = concat([
      indent(concat([hardline, join(hardline, path.map(print, "children"))])),
      hardline
    ]);
  }

  return group(concat([openingTag, inner, closingTag]));
};

module.exports = genericPrint;
