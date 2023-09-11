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

const parser = {
  parse(text) {
    const { lexErrors, parseErrors, cst } = xmlToolsParse(text);

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
    return cst;
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
