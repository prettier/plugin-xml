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

const genericPrint = (path, opts, print) => {
  const { tagname, children, attrs, value } = path.getValue();

  // Handle the root node
  if (tagname === "!xml") {
    const parts = [join(hardline, path.map(print, "children")), hardline];

    const firstNonBlankLine = getFirstNonBlankLine(opts.originalText);
    if (firstNonBlankLine && firstNonBlankLine.startsWith("<?xml")) {
      parts.unshift(firstNonBlankLine, hardline);
    }

    return concat(parts);
  }

  // Handle comment nodes
  if (tagname === "!comment") {
    return group(concat([
      "<!--",
      indent(concat([line, value])),
      concat([line, "-->"])
    ]));
  }

  if ((Object.keys(children).length === 0) && !value && opts.xmlSelfClosingTags) {
    return group(concat(["<", tagname, printAttrs(attrs), line, "/>"]));
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
      indent(concat([
        hardline,
        join(hardline, path.map(print, "children"))
      ])),
      hardline
    ]);
  }

  return group(concat([openingTag, inner, closingTag]));
};

module.exports = genericPrint;
