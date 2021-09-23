import { parse as xmlToolsParse } from "@xml-tools/parser";
import type { Parser } from "./types";

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
    return node.location!.startOffset;
  },
  locEnd(node) {
    return node.location!.endOffset!;
  }
};

export default parser;
