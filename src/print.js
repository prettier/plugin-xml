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

const printAttrs = (attrs, after) => {
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

const printSelfClosingTag = (path, opts, print) => {
  const { name, attrs } = path.getValue();

  return group(concat([
    "<",
    name,
    printAttrs(attrs),
    line,
    "/>"
  ]));
};

const genericPrint = (path, opts, print) => {
  const { type, name, attrs, value } = path.getValue();

  switch (type) {
    case "leaf": {
      if (!value && opts.xmlSelfClosingTags) {
        return printSelfClosingTag(path, opts, print);
      }

      return group(concat([
        group(concat([
          "<",
          name,
          printAttrs(attrs),
          softline,
          ">"
        ])),
        indent(concat([
          softline,
          value
        ])),
        softline,
        "</",
        name,
        ">"
      ]));
    }
    case "node": {
      if (value.length === 0 && opts.xmlSelfClosingTags) {
        return printSelfClosingTag(path, opts, print);
      }

      let inner;

      if (value.length === 0) {
        inner = softline;
      } else {
        inner = concat([
          indent(concat([
            hardline,
            join(hardline, path.map(print, "value"))
          ])),
          hardline
        ]);
      }

      return group(concat([
        group(concat([
          "<",
          name,
          printAttrs(attrs),
          softline,
          ">"
        ])),
        inner,
        "</",
        name,
        ">"
      ]));
    }
    case "root": {
      const parts = [join(hardline, path.map(print, "value")), hardline];

      const firstNonBlankLine = getFirstNonBlankLine(opts.originalText);
      if (firstNonBlankLine && firstNonBlankLine.startsWith("<?xml")) {
        parts.unshift(firstNonBlankLine, hardline);
      }

      return concat(parts);
    }
    default:
      throw new Error(`Unsupported node encountered: ${type}`);
  }
};

module.exports = genericPrint;
