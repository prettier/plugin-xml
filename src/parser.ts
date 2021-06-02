import type { Parser } from "prettier";
import { parse as xmlToolsParse } from "@xml-tools/parser";

const parser: Parser = {
  parse(text) {
    const { lexErrors, parseErrors, cst } = xmlToolsParse(text);

    if (lexErrors.length > 0 || parseErrors.length > 0) {
      throw Error("Error parsing XML");
    }

    return cst;
  },
  astFormat: "xml",
  locStart(node) {
    if (node.location) {
      return node.location.startOffset;
    }
    return node.startOffset;
  },
  locEnd(node) {
    if (node.location) {
      return node.location.endOffset;
    }
    return node.endOffset;
  }
};

export default parser;
