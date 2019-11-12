const { concat, group, hardline, indent, join, line, softline } = require("prettier").doc.builders;

const getFirstNonBlankLine = originalText => originalText.split("\n").find(
  text => text.trim().length !== 0
);

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

  return group(concat([indent(concat(parts)), softline]));
};

const genericPrint = (path, opts, print) => {
  const { type, name, attrs, value } = path.getValue();

  switch (type) {
    case "leaf": {
      const parts = [
        "<",
        name,
        printAttrs(attrs)
      ];

      if (!value && opts.xmlSelfClosingTags) {
        return group(concat(parts.concat(" />")));
      }

      return group(concat(parts.concat(
        ">",
        indent(concat([
          softline,
          value
        ])),
        softline,
        "</",
        name,
        ">"
      )));
    }
    case "node":
      return group(concat([
        "<",
        name,
        printAttrs(attrs),
        ">",
        indent(concat([
          hardline,
          join(hardline, path.map(print, "value"))
        ])),
        hardline,
        "</",
        name,
        ">"
      ]));
    case "root": {
      const parts = [
        join(hardline, path.map(print, "value")),
        hardline
      ];

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
