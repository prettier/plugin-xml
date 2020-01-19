const {
  concat,
  group,
  hardline,
  indent,
  join,
  line,
  literalline,
  softline
} = require("prettier").doc.builders;

const nodes = {
  attribute: (path, _opts, _print) => {
    const { Name, EQUALS, STRING } = path.getValue().children;

    return concat([Name[0].image, EQUALS[0].image, STRING[0].image]);
  },
  chardata: (path, _opts, _print) => {
    const { SEA_WS, TEXT } = path.getValue().children;
    const [{ image }] = SEA_WS || TEXT;

    return concat(
      image
        .split(/(\n)/g)
        .map((value, index) => (index % 2 === 0 ? value : literalline))
    );
  },
  content: (path, opts, print) => {
    const {
      CData,
      Comment,
      chardata,
      element,
      reference
    } = path.getValue().children;

    let parts = [];

    if (CData) {
      CData.forEach(node => {
        parts.push({ offset: node.startOffset, printed: node.image });
      });
    }

    if (Comment) {
      Comment.forEach(node => {
        parts.push({ offset: node.startOffset, printed: node.image });
      });
    }

    if (chardata) {
      chardata.forEach((node, index) => {
        parts.push({
          offset: node.location.startOffset,
          printed: path.call(print, "children", "chardata", index)
        });
      });
    }

    if (element) {
      element.forEach((node, index) => {
        parts.push({
          offset: node.location.startOffset,
          printed: path.call(print, "children", "element", index)
        });
      });
    }

    if (reference) {
      reference.forEach(node => {
        parts.push({
          offset: node.location.startOffset,
          printed: (node.children.CharRef || node.children.EntityRef)[0].image
        });
      });
    }

    parts.sort((left, right) => left.offset - right.offset);
    parts = parts.map(({ printed }) => printed);

    return group(concat(parts));
  },
  document: (path, opts, print) => {
    const { element, misc, prolog } = path.getValue().children;
    let parts = [];

    if (prolog) {
      parts.push({
        offset: prolog[0].location.startOffset,
        printed: path.call(print, "children", "prolog", 0)
      });
    }

    if (misc) {
      misc.forEach(node => {
        if (node.children.PROCESSING_INSTRUCTION) {
          parts.push({
            offset: node.location.startOffset,
            printed: node.children.PROCESSING_INSTRUCTION[0].image
          });
        }

        if (node.children.Comment) {
          parts.push({
            offset: node.location.startOffset,
            printed: node.children.Comment[0].image
          });
        }
      });
    }

    if (element) {
      parts.push({
        offset: element[0].location.startOffset,
        printed: path.call(print, "children", "element", 0)
      });
    }

    parts.sort((left, right) => left.offset - right.offset);
    parts = parts.map(({ printed }) => printed);

    return concat([join(hardline, parts), hardline]);
  },
  element: (path, opts, print) => {
    const {
      OPEN,
      Name,
      attribute,
      START_CLOSE,
      content,
      SLASH_OPEN,
      END_NAME,
      END,
      SLASH_CLOSE
    } = path.getValue().children;

    const parts = [OPEN[0].image, Name[0].image];

    if (attribute) {
      parts.push(
        indent(
          concat([line, join(line, path.map(print, "children", "attribute"))])
        )
      );
    }

    if (SLASH_CLOSE) {
      const space = opts.xmlSelfClosingSpace ? line : softline;
      return group(concat(parts.concat(space, SLASH_CLOSE[0].image)));
    }

    if (Object.keys(content[0].children).length === 0) {
      const space = opts.xmlSelfClosingSpace ? line : softline;
      return group(concat(parts.concat(space, "/>")));
    }

    return group(
      concat([
        group(concat(parts.concat(softline, START_CLOSE[0].image))),
        indent(path.call(print, "children", "content", 0)),
        group(concat([SLASH_OPEN[0].image, END_NAME[0].image, END[0].image]))
      ])
    );
  },
  prolog: (path, opts, print) => {
    const { XMLDeclOpen, attribute, SPECIAL_CLOSE } = path.getValue().children;
    const parts = [XMLDeclOpen[0].image];

    if (attribute) {
      parts.push(
        indent(
          concat([
            softline,
            join(line, path.map(print, "children", "attribute"))
          ])
        )
      );
    }

    const space = opts.xmlSelfClosingSpace ? line : softline;
    parts.push(space, SPECIAL_CLOSE[0].image);

    return group(concat(parts));
  }
};

const genericPrint = (path, opts, print) => {
  const { name } = path.getValue();
  const printer = nodes[name];

  if (!printer) {
    throw new Error(`Unimplemented: ${name}`);
  }

  return printer(path, opts, print);
};

module.exports = genericPrint;
