import { parse as xmlToolsParse } from "@xml-tools/parser";
import type { Parser } from "./types";

type LocatedError = Error & {
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
};

const parser: Parser = {
  parse(text) {
    const { lexErrors, parseErrors, cst } = xmlToolsParse(text);

    // If there are any lexical errors, throw the first of them as an error.
    if (lexErrors.length > 0) {
      const lexError = lexErrors[0];
      const error = new Error(lexError.message) as LocatedError;

      error.loc = {
        start: { line: lexError.line, column: lexError.column },
        end: { line: lexError.line, column: lexError.column + lexError.length }
      };

      throw error;
    }

    // If there are any parse errors, throw the first of them as an error.
    if (parseErrors.length > 0) {
      const parseError = parseErrors[0];
      const error = new Error(parseError.message) as LocatedError;

      const { token } = parseError;
      error.loc = {
        start: { line: token.startLine!, column: token.startColumn! },
        end: { line: token.endLine!, column: token.endColumn! }
      };

      throw error;
    }

    // Otherwise return the CST.
    return cst;
  },
  astFormat: "xml",
  locStart(node) {
    return node.location!.startOffset;
  },
  locEnd(node) {
    return node.location!.endOffset!;
  }
};

export default parser;
