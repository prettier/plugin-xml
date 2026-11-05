import { parse as xmlToolsParse } from "@xml-tools/parser";

function createError(message, options) {
  // TODO: Use `Error.prototype.cause` when we drop support for Node.js<18.7.0

  // Construct an error similar to the ones thrown by Prettier.
  const error = new SyntaxError(
    message +
      " (" +
      options.loc.start.line +
      ":" +
      options.loc.start.column +
      ")"
  );

  return Object.assign(error, options);
}

// The @xml-tools/parser grammar has no rule for the internal subset of a
// DOCTYPE (`<!DOCTYPE x [ ... ]>`). Find its `[ ... ]` range so it can be
// blanked out before parsing and printed back verbatim.
function findInternalSubset(text) {
  let idx = 0;

  // Skip whitespace, processing instructions and comments before the DOCTYPE.
  for (;;) {
    while (/\s/.test(text[idx] ?? "")) idx += 1;

    const close = text.startsWith("<?", idx)
      ? "?>"
      : text.startsWith("<!--", idx)
        ? "-->"
        : null;
    const end = close ? text.indexOf(close, idx) : -1;

    if (end === -1) break;
    idx = end + close.length;
  }

  if (!text.startsWith("<!DOCTYPE", idx)) {
    return null;
  }

  let start = -1;
  let quote = null;

  for (idx += "<!DOCTYPE".length; idx < text.length; idx += 1) {
    const char = text[idx];

    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (start === -1) {
      if (char === "[") start = idx;
      else if (char === ">") return null;
    } else if (text.startsWith("<!--", idx)) {
      const commentEnd = text.indexOf("-->", idx);
      if (commentEnd === -1) return null;
      idx = commentEnd + 2;
    } else if (char === "]") {
      return { start, end: idx };
    }
  }

  return null;
}

function simplifyCST(node) {
  switch (node.name) {
    case "attribute": {
      const { Name, EQUALS, STRING } = node.children;

      return {
        name: "attribute",
        Name: Name[0].image,
        EQUALS: EQUALS[0].image,
        STRING: STRING[0].image,
        location: node.location
      };
    }
    case "chardata": {
      const { SEA_WS, TEXT } = node.children;

      return {
        name: "chardata",
        SEA_WS: SEA_WS ? SEA_WS[0].image : null,
        TEXT: TEXT ? TEXT[0].image : null,
        location: node.location
      };
    }
    case "content": {
      const {
        CData,
        Comment,
        chardata,
        element,
        PROCESSING_INSTRUCTION,
        reference
      } = node.children;

      return {
        name: "content",
        CData: CData || [],
        Comment: Comment || [],
        chardata: (chardata || []).map(simplifyCST),
        element: (element || []).map(simplifyCST),
        PROCESSING_INSTRUCTION: PROCESSING_INSTRUCTION || [],
        reference: (reference || []).map(simplifyCST),
        location: node.location
      };
    }
    case "docTypeDecl": {
      const { DocType, Name, externalID, CLOSE } = node.children;

      return {
        name: "docTypeDecl",
        DocType: DocType[0].image,
        Name: Name[0].image,
        externalID: externalID ? simplifyCST(externalID[0]) : null,
        internalSubset: null,
        CLOSE: CLOSE[0].image,
        location: node.location
      };
    }
    case "document": {
      const { docTypeDecl, element, misc, prolog } = node.children;

      return {
        name: "document",
        docTypeDecl: docTypeDecl ? simplifyCST(docTypeDecl[0]) : null,
        element: element ? simplifyCST(element[0]) : null,
        misc: (misc || [])
          .filter((child) => !child.children.SEA_WS)
          .map(simplifyCST),
        prolog: prolog ? simplifyCST(prolog[0]) : null,
        location: node.location
      };
    }
    case "element": {
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
      } = node.children;

      return {
        name: "element",
        OPEN: OPEN[0].image,
        Name: Name[0].image,
        attribute: (attribute || []).map(simplifyCST),
        START_CLOSE: START_CLOSE ? START_CLOSE[0].image : null,
        content: content ? simplifyCST(content[0]) : null,
        SLASH_OPEN: SLASH_OPEN ? SLASH_OPEN[0].image : null,
        END_NAME: END_NAME ? END_NAME[0].image : null,
        END: END ? END[0].image : null,
        SLASH_CLOSE: SLASH_CLOSE ? SLASH_CLOSE[0].image : null,
        location: node.location
      };
    }
    case "externalID": {
      const { Public, PubIDLiteral, System, SystemLiteral } = node.children;

      return {
        name: "externalID",
        Public: Public ? Public[0].image : null,
        PubIDLiteral: PubIDLiteral ? PubIDLiteral[0].image : null,
        System: System ? System[0].image : null,
        SystemLiteral: SystemLiteral ? SystemLiteral[0].image : null,
        location: node.location
      };
    }
    case "misc": {
      const { Comment, PROCESSING_INSTRUCTION, SEA_WS } = node.children;

      return {
        name: "misc",
        Comment: Comment ? Comment[0].image : null,
        PROCESSING_INSTRUCTION: PROCESSING_INSTRUCTION
          ? PROCESSING_INSTRUCTION[0].image
          : null,
        SEA_WS: SEA_WS ? SEA_WS[0].image : null,
        location: node.location
      };
    }
    case "prolog": {
      const { XMLDeclOpen, attribute, SPECIAL_CLOSE } = node.children;

      return {
        name: "prolog",
        XMLDeclOpen: XMLDeclOpen[0].image,
        attribute: (attribute || []).map(simplifyCST),
        SPECIAL_CLOSE: SPECIAL_CLOSE[0].image,
        location: node.location
      };
    }
    case "reference": {
      const { CharRef, EntityRef } = node.children;

      return {
        name: "reference",
        CharRef: CharRef ? CharRef[0].image : null,
        EntityRef: EntityRef ? EntityRef[0].image : null,
        location: node.location
      };
    }
    default:
      throw new Error(`Unknown node type: ${node.name}`);
  }
}

const parser = {
  parse(text) {
    const subset = findInternalSubset(text);
    const { lexErrors, parseErrors, cst } = xmlToolsParse(
      subset
        ? text.slice(0, subset.start) +
            text.slice(subset.start, subset.end + 1).replace(/[^\r\n]/g, " ") +
            text.slice(subset.end + 1)
        : text
    );

    // If there are any lexical errors, throw the first of them as an error.
    if (lexErrors.length > 0) {
      const lexError = lexErrors[0];
      throw createError(lexError.message, {
        loc: {
          start: { line: lexError.line, column: lexError.column },
          end: {
            line: lexError.line,
            column: lexError.column + lexError.length
          }
        }
      });
    }

    // If there are any parse errors, throw the first of them as an error.
    if (parseErrors.length > 0) {
      const parseError = parseErrors[0];
      throw createError(parseError.message, {
        loc: {
          start: {
            line: parseError.token.startLine,
            column: parseError.token.startColumn
          },
          end: {
            line: parseError.token.endLine,
            column: parseError.token.endColumn
          }
        }
      });
    }

    // Otherwise return the CST.
    const document = simplifyCST(cst);

    if (subset) {
      document.docTypeDecl.internalSubset = text.slice(
        subset.start + 1,
        subset.end
      );
    }

    return document;
  },
  astFormat: "xml",
  locStart(node) {
    return node.location.startOffset;
  },
  locEnd(node) {
    return node.location.endOffset;
  }
};

export default parser;
