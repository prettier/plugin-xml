const {
  concat,
  group,
  hardline,
  indent,
  join,
  line,
  literalline,
  softline
} = require("prettier/doc").builders;

const elementOnly = node => {
  const { CData, chardata, element, reference } = node.children;

  return (
    !CData &&
    (!chardata || chardata.every(datum => !datum.children.TEXT)) &&
    element &&
    !reference
  );
};

const printCData = node => ({
  offset: node.startOffset,
  printed: node.image
});

const printComment = node => ({
  offset: node.startOffset,
  printed: node.image
});

const printCharData = (path, print) => (node, index) => ({
  offset: node.location.startOffset,
  printed: path.call(print, "children", "chardata", index)
});

const printElement = (path, print) => (node, index) => ({
  offset: node.location.startOffset,
  printed: path.call(print, "children", "element", index)
});

const printProcessingInstruction = node => ({
  offset: node.startOffset,
  printed: node.image
});

const printReference = node => ({
  offset: node.location.startOffset,
  printed: (node.children.CharRef || node.children.EntityRef)[0].image
});

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
      CData = [],
      Comment = [],
      chardata = [],
      element = [],
      PROCESSING_INSTRUCTION = [],
      reference = []
    } = path.getValue().children;

    return group(
      concat(
        []
          .concat(CData.map(printCData))
          .concat(Comment.map(printComment))
          .concat(chardata.map(printCharData(path, print)))
          .concat(element.map(printElement(path, print)))
          .concat(PROCESSING_INSTRUCTION.map(printProcessingInstruction))
          .concat(reference.map(printReference))
          .sort((left, right) => left.offset - right.offset)
          .map(({ printed }) => printed)
      )
    );
  },
  docTypeDecl: (path, opts, print) => {
    const { DocType, Name, externalID, CLOSE } = path.getValue().children;
    const parts = [DocType[0].image, " ", Name[0].image];

    if (externalID) {
      parts.push(" ", path.call(print, "children", "externalID", 0));
    }

    return group(concat(parts.concat(CLOSE[0].image)));
  },
  document: (path, opts, print) => {
    const { docTypeDecl, element, misc, prolog } = path.getValue().children;
    let parts = [];

    if (docTypeDecl) {
      parts.push({
        offset: docTypeDecl[0].location.startOffset,
        printed: path.call(print, "children", "docTypeDecl", 0)
      });
    }

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
        } else if (node.children.Comment) {
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

    const openTag = group(concat(parts.concat(softline, START_CLOSE[0].image)));
    const closeTag = group(
      concat([SLASH_OPEN[0].image, END_NAME[0].image, END[0].image])
    );

    // If we're ignoring whitespace and we're printing a node that only contains
    // other elements, then we can just print out the child elements directly.
    if (opts.xmlWhitespaceSensitivity === "ignore" && elementOnly(content[0])) {
      const {
        Comment = [],
        element,
        PROCESSING_INSTRUCTION = []
      } = content[0].children;

      const children = []
        .concat(Comment.map(printComment))
        .concat(
          element.map((node, index) => ({
            offset: node.location.startOffset,
            printed: path.call(
              print,
              "children",
              "content",
              0,
              "children",
              "element",
              index
            )
          }))
        )
        .concat(PROCESSING_INSTRUCTION.map(printProcessingInstruction))
        .sort((left, right) => left.offset - right.offset)
        .map(({ printed }) => printed);

      return group(
        concat([
          openTag,
          indent(concat([hardline, join(hardline, children)])),
          hardline,
          closeTag
        ])
      );
    }

    return group(
      concat([
        openTag,
        indent(path.call(print, "children", "content", 0)),
        closeTag
      ])
    );
  },
  externalID: (path, _opts, _print) => {
    const {
      Public,
      PubIDLiteral,
      System,
      SystemLiteral
    } = path.getValue().children;

    if (System) {
      return group(
        concat([
          System[0].image,
          indent(concat([line, SystemLiteral[0].image]))
        ])
      );
    }

    return group(
      concat([
        group(
          concat([
            Public[0].image,
            indent(concat([line, PubIDLiteral[0].image]))
          ])
        ),
        indent(concat([line, SystemLiteral[0].image]))
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

const genericPrint = (path, opts, print) =>
  nodes[path.getValue().name](path, opts, print);

module.exports = genericPrint;
