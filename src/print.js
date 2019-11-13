const {
  concat,
  group,
  hardline,
  indent,
  join,
  line,
  softline
} = require("prettier").doc.builders;

const getFirstNonBlankLine = originalText =>
  originalText.split("\n").find(text => text.trim().length !== 0);

const printAttrs = attrs => {
  if (!attrs) {
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
  if (name === "#cdata") {
    return "<![CDATA[";
  }
  return group(concat(["<", name, printAttrs(attrs), softline, ">"]));
};

const printChildren = (path, print, child) => {
  let children = [];

  Object.keys(child).forEach(key => {
    children = children.concat(path.map(print, "child", key));
  });

  return children;
};

const genericPrint = (path, opts, print) => {
  const { tagname, child, attrsMap, val } = path.getValue();

  if (tagname === "!xml") {
    const children = printChildren(path, print, child);
    const parts = [join(hardline, children), hardline];

    const firstNonBlankLine = getFirstNonBlankLine(opts.originalText);
    if (firstNonBlankLine && firstNonBlankLine.startsWith("<?xml")) {
      parts.unshift(firstNonBlankLine, hardline);
    }

    return concat(parts);
  }

  if (
    (!child || Object.keys(child).length === 0) &&
    !val &&
    opts.xmlSelfClosingTags
  ) {
    return group(concat(["<", tagname, printAttrs(attrsMap), line, "/>"]));
  }

  const openingTag = printOpeningTag(tagname, attrsMap);
  const closingTag = tagname === "#cdata" ? "]]>" : `</${tagname}>`;

  if (Object.keys(child).length === 0) {
    return group(
      concat([
        openingTag,
        indent(concat([softline, val.toString()])),
        softline,
        closingTag
      ])
    );
  }

  let inner;
  const children = printChildren(path, print, child);

  if (children.length === 0) {
    inner = softline;
  } else {
    inner = concat([
      indent(concat([hardline, join(hardline, children)])),
      hardline
    ]);
  }

  return group(concat([openingTag, inner, closingTag]));
};

module.exports = genericPrint;
