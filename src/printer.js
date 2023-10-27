import * as doc from "prettier/doc";
import embed from "./embed.js";

const { fill, group, hardline, indent, join, line, literalline, softline } =
  doc.builders;

const ignoreStartComment = "<!-- prettier-ignore-start -->";
const ignoreEndComment = "<!-- prettier-ignore-end -->";

function hasIgnoreRanges(comments) {
  if (!comments || comments.length === 0) {
    return false;
  }

  comments.sort((left, right) => left.startOffset - right.startOffset);

  let startFound = false;
  for (let idx = 0; idx < comments.length; idx += 1) {
    if (comments[idx].image === ignoreStartComment) {
      startFound = true;
    } else if (startFound && comments[idx].image === ignoreEndComment) {
      return true;
    }
  }

  return false;
}

function isWhitespaceIgnorable(opts, attributes, content) {
  // If the whitespace sensitivity setting is "strict", then we can't ignore the
  // whitespace.
  if (opts.xmlWhitespaceSensitivity === "strict") {
    return false;
  }

  // If there is an xml:space attribute set to "preserve", then we can't ignore
  // the whitespace.
  if (
    attributes &&
    attributes.some(
      (attribute) =>
        attribute &&
        attribute.children.Name[0].image === "xml:space" &&
        attribute.children.STRING[0].image.slice(1, -1) === "preserve"
    )
  ) {
    return false;
  }

  // If there are character data or reference nodes in the content, then we
  // can't ignore the whitespace.
  if (content.children.CData || content.children.reference) {
    return false;
  }

  // If there are comments in the content and the comments are ignore ranges,
  // then we can't ignore the whitespace.
  if (hasIgnoreRanges(content.children.Comment)) {
    return false;
  }

  // Otherwise we can.
  return true;
}

function printIToken(path) {
  const node = path.getValue();

  return {
    offset: node.startOffset,
    startLine: node.startLine,
    endLine: node.endLine,
    printed: node.image
  };
}

function printAttribute(path, opts, print) {
  const { Name, EQUALS, STRING } = path.getValue().children;

  let attributeValue;
  if (opts.xmlQuoteAttributes === "double") {
    const content = STRING[0].image.slice(1, -1).replaceAll('"', "&quot;");
    attributeValue = `"${content}"`;
  } else if (opts.xmlQuoteAttributes === "single") {
    const content = STRING[0].image.slice(1, -1).replaceAll("'", "&apos;");
    attributeValue = `'${content}'`;
  } else {
    // preserve
    attributeValue = STRING[0].image;
  }

  return [Name[0].image, EQUALS[0].image, attributeValue];
}

function printCharData(path, opts, print) {
  const { SEA_WS, TEXT } = path.getValue().children;
  const [{ image }] = SEA_WS || TEXT;

  return image
    .split(/(\n)/g)
    .map((value, index) => (index % 2 === 0 ? value : literalline));
}

function printContentFragments(path, print) {
  let response = [];
  const children = path.getValue();

  if (children.CData) {
    response = response.concat(path.map(printIToken, "CData"));
  }

  if (children.Comment) {
    response = response.concat(path.map(printIToken, "Comment"));
  }

  if (children.chardata) {
    response = response.concat(
      path.map(
        (charDataPath) => ({
          offset: charDataPath.getValue().location.startOffset,
          printed: print(charDataPath)
        }),
        "chardata"
      )
    );
  }

  if (children.element) {
    response = response.concat(
      path.map(
        (elementPath) => ({
          offset: elementPath.getValue().location.startOffset,
          printed: print(elementPath)
        }),
        "element"
      )
    );
  }

  if (children.PROCESSING_INSTRUCTION) {
    response = response.concat(path.map(printIToken, "PROCESSING_INSTRUCTION"));
  }

  if (children.reference) {
    response = response.concat(
      path.map((referencePath) => {
        const referenceNode = referencePath.getValue();

        return {
          offset: referenceNode.location.startOffset,
          printed: (referenceNode.children.CharRef ||
            referenceNode.children.EntityRef)[0].image
        };
      }, "reference")
    );
  }

  return response;
}

function printContent(path, opts, print) {
  let fragments = path.call(
    (childrenPath) => printContentFragments(childrenPath, print),
    "children"
  );
  const { Comment } = path.getValue().children;

  if (hasIgnoreRanges(Comment)) {
    Comment.sort((left, right) => left.startOffset - right.startOffset);

    const ignoreRanges = [];
    let ignoreStart = null;

    // Build up a list of ignored ranges from the original text based on
    // the special prettier-ignore-* comments
    Comment.forEach((comment) => {
      if (comment.image === ignoreStartComment) {
        ignoreStart = comment;
      } else if (ignoreStart && comment.image === ignoreEndComment) {
        ignoreRanges.push({
          start: ignoreStart.startOffset,
          end: comment.endOffset
        });

        ignoreStart = null;
      }
    });

    // Filter the printed children to only include the ones that are
    // outside of each of the ignored ranges
    fragments = fragments.filter((fragment) =>
      ignoreRanges.every(
        ({ start, end }) => fragment.offset < start || fragment.offset > end
      )
    );

    // Push each of the ignored ranges into the child list as its own
    // element so that the original content is still included
    ignoreRanges.forEach(({ start, end }) => {
      const content = opts.originalText.slice(start, end + 1);

      fragments.push({
        offset: start,
        printed: doc.utils.replaceEndOfLine(content)
      });
    });
  }

  fragments.sort((left, right) => left.offset - right.offset);
  return group(fragments.map(({ printed }) => printed));
}

function printDocTypeDecl(path, opts, print) {
  const { DocType, Name, externalID, CLOSE } = path.getValue().children;
  const parts = [DocType[0].image, " ", Name[0].image];

  if (externalID) {
    parts.push(" ", path.call(print, "children", "externalID", 0));
  }

  return group([...parts, CLOSE[0].image]);
}

function printDocument(path, opts, print) {
  const { docTypeDecl, element, misc, prolog } = path.getValue().children;
  const fragments = [];

  if (docTypeDecl) {
    fragments.push({
      offset: docTypeDecl[0].location.startOffset,
      printed: path.call(print, "children", "docTypeDecl", 0)
    });
  }

  if (prolog) {
    fragments.push({
      offset: prolog[0].location.startOffset,
      printed: path.call(print, "children", "prolog", 0)
    });
  }

  if (misc) {
    misc.forEach((node) => {
      if (node.children.PROCESSING_INSTRUCTION) {
        fragments.push({
          offset: node.location.startOffset,
          printed: node.children.PROCESSING_INSTRUCTION[0].image
        });
      } else if (node.children.Comment) {
        fragments.push({
          offset: node.location.startOffset,
          printed: node.children.Comment[0].image
        });
      }
    });
  }

  if (element) {
    fragments.push({
      offset: element[0].location.startOffset,
      printed: path.call(print, "children", "element", 0)
    });
  }

  fragments.sort((left, right) => left.offset - right.offset);
  return [
    join(
      hardline,
      fragments.map(({ printed }) => printed)
    ),
    hardline
  ];
}

function printCharDataPreserve(path, print) {
  let prevLocation;
  const response = [];

  path.each((charDataPath) => {
    const chardata = charDataPath.getValue();
    const location = chardata.location;
    const content = print(charDataPath);

    if (
      prevLocation &&
      location.startColumn &&
      prevLocation.endColumn &&
      location.startLine === prevLocation.endLine &&
      location.startColumn === prevLocation.endColumn + 1
    ) {
      // continuation of previous fragment
      const prevFragment = response[response.length - 1];
      prevFragment.endLine = location.endLine;
      prevFragment.printed = group([prevFragment.printed, content]);
    } else {
      response.push({
        offset: location.startOffset,
        startLine: location.startLine,
        endLine: location.endLine,
        printed: content,
        whitespace: true
      });
    }
    prevLocation = location;
  }, "chardata");

  return response;
}

function printCharDataIgnore(path) {
  const response = [];

  path.each((charDataPath) => {
    const chardata = charDataPath.getValue();
    if (!chardata.children.TEXT) {
      return;
    }

    const content = chardata.children.TEXT[0].image.trim();
    const printed = group(
      content.split(/(\n)/g).map((value) => {
        if (value === "\n") {
          return literalline;
        }

        return fill(
          value
            .split(/\b( +)\b/g)
            .map((segment, index) => (index % 2 === 0 ? segment : line))
        );
      })
    );

    const location = chardata.location;
    response.push({
      offset: location.startOffset,
      startLine: location.startLine,
      endLine: location.endLine,
      printed
    });
  }, "chardata");

  return response;
}

function printElementFragments(path, opts, print) {
  const children = path.getValue();
  let response = [];

  if (children.Comment) {
    response = response.concat(path.map(printIToken, "Comment"));
  }

  if (children.chardata) {
    if (
      children.chardata.some(({ children }) => !!children.TEXT) &&
      opts.xmlWhitespaceSensitivity === "preserve"
    ) {
      response = response.concat(printCharDataPreserve(path, print));
    } else {
      response = response.concat(printCharDataIgnore(path, print));
    }
  }

  if (children.element) {
    response = response.concat(
      path.map((elementPath) => {
        const location = elementPath.getValue().location;

        return {
          offset: location.startOffset,
          startLine: location.startLine,
          endLine: location.endLine,
          printed: print(elementPath)
        };
      }, "element")
    );
  }

  if (children.PROCESSING_INSTRUCTION) {
    response = response.concat(path.map(printIToken, "PROCESSING_INSTRUCTION"));
  }

  return response;
}

function printElement(path, opts, print) {
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
    const attributes = path.map(
      (attributePath) => ({
        node: attributePath.getValue(),
        printed: print(attributePath)
      }),
      "children",
      "attribute"
    );

    if (opts.xmlSortAttributesByKey) {
      attributes.sort((left, right) => {
        const leftAttr = left.node.children.Name[0].image;
        const rightAttr = right.node.children.Name[0].image;

        // Check if the attributes are xmlns.
        if (leftAttr === "xmlns") return -1;
        if (rightAttr === "xmlns") return 1;

        // Check if they are both in namespaces.
        if (leftAttr.includes(":") && rightAttr.includes(":")) {
          const [leftNS, leftKey] = leftAttr.split(":");
          const [rightNS, rightKey] = rightAttr.split(":");

          // If namespaces are equal, compare keys
          if (leftNS === rightNS) return leftKey.localeCompare(rightKey);

          // Handle the 1 but not both being an xmlns
          if (leftNS === "xmlns") return -1;
          if (rightNS === "xmlns") return 1;

          return leftNS.localeCompare(rightNS);
        }

        // Check if the attributes have namespaces.
        if (leftAttr.includes(":")) return -1;
        if (rightAttr.includes(":")) return 1;

        return leftAttr.localeCompare(rightAttr);
      });
    }

    const separator = opts.singleAttributePerLine ? hardline : line;
    parts.push(
      indent([
        line,
        join(
          separator,
          attributes.map(({ printed }) => printed)
        )
      ])
    );
  }

  // Determine the value that will go between the <, name, and attributes
  // of an element and the /> of an element.
  let space;
  if (opts.bracketSameLine) {
    space = opts.xmlSelfClosingSpace ? " " : "";
  } else {
    space = opts.xmlSelfClosingSpace ? line : softline;
  }

  if (SLASH_CLOSE) {
    return group([...parts, space, SLASH_CLOSE[0].image]);
  }

  if (Object.keys(content[0].children).length === 0) {
    return group([...parts, space, "/>"]);
  }

  const openTag = group([
    ...parts,
    opts.bracketSameLine ? "" : softline,
    START_CLOSE[0].image
  ]);

  const closeTag = group([
    SLASH_OPEN[0].image,
    END_NAME[0].image,
    END[0].image
  ]);

  if (isWhitespaceIgnorable(opts, attribute, content[0])) {
    const fragments = path.call(
      (childrenPath) => printElementFragments(childrenPath, opts, print),
      "children",
      "content",
      0,
      "children"
    );
    fragments.sort((left, right) => left.offset - right.offset);

    if (
      opts.xmlWhitespaceSensitivity === "preserve" &&
      fragments.some(({ whitespace }) => whitespace)
    ) {
      return group([
        openTag,
        fragments.map(({ printed }) => printed),
        closeTag
      ]);
    }

    // If the only content of this tag is chardata, then use a softline so
    // that we won't necessarily break (to allow <foo>bar</foo>).
    if (
      fragments.length === 1 &&
      (content[0].children.chardata || []).filter(
        (chardata) => chardata.children.TEXT
      ).length === 1
    ) {
      return group([
        openTag,
        indent([softline, fragments[0].printed]),
        softline,
        closeTag
      ]);
    }

    if (fragments.length === 0) {
      return group([...parts, space, "/>"]);
    }

    const docs = [];
    let lastLine = fragments[0].startLine;

    fragments.forEach((node) => {
      if (node.startLine - lastLine >= 2) {
        docs.push(hardline, hardline);
      } else {
        docs.push(hardline);
      }

      docs.push(node.printed);
      lastLine = node.endLine;
    });

    return group([openTag, indent(docs), hardline, closeTag]);
  }

  return group([
    openTag,
    indent(path.call(print, "children", "content", 0)),
    closeTag
  ]);
}

function printExternalID(path, opts, print) {
  const { Public, PubIDLiteral, System, SystemLiteral } =
    path.getValue().children;

  if (System) {
    return group([System[0].image, indent([line, SystemLiteral[0].image])]);
  }

  return group([
    group([Public[0].image, indent([line, PubIDLiteral[0].image])]),
    indent([line, SystemLiteral[0].image])
  ]);
}

function printProlog(path, opts, print) {
  const { XMLDeclOpen, attribute, SPECIAL_CLOSE } = path.getValue().children;
  const parts = [XMLDeclOpen[0].image];

  if (attribute) {
    parts.push(
      indent([softline, join(line, path.map(print, "children", "attribute"))])
    );
  }

  return group([
    ...parts,
    opts.xmlSelfClosingSpace ? line : softline,
    SPECIAL_CLOSE[0].image
  ]);
}

const printer = {
  embed,
  print(path, opts, print) {
    const node = path.getValue();

    switch (node.name) {
      case "attribute":
        return printAttribute(path, opts, print);
      case "chardata":
        return printCharData(path, opts, print);
      case "content":
        return printContent(path, opts, print);
      case "docTypeDecl":
        return printDocTypeDecl(path, opts, print);
      case "document":
        return printDocument(path, opts, print);
      case "element":
        return printElement(path, opts, print);
      case "externalID":
        return printExternalID(path, opts, print);
      case "prolog":
        return printProlog(path, opts, print);
    }
  }
};

export default printer;
