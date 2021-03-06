import type {
  AttributeCstNode,
  ChardataCstNode,
  ContentCstNode,
  DocTypeDeclNode,
  DocumentCstNode,
  ElementCstNode,
  ExternalIDNode,
  PrologCstNode
} from "@xml-tools/parser";
import type { IToken } from "chevrotain";
import type { ParserOptions } from "prettier";

export interface ContentCstNodeExt extends Omit<ContentCstNode, "children"> {
  children: ContentCstNode["children"] & { PROCESSING_INSTRUCTION: IToken[] };
}

interface DocTypeDeclNodeExt extends Omit<DocTypeDeclNode, "children"> {
  children: DocTypeDeclNode["children"] & { CLOSE: IToken[] };
}

interface ExternalIDNodeExt extends Omit<ExternalIDNode, "name"> {
  name: "externalID";
}

export type XMLAst =
  | AttributeCstNode
  | ChardataCstNode
  | ContentCstNodeExt
  | DocTypeDeclNodeExt
  | DocumentCstNode
  | ElementCstNode
  | ExternalIDNodeExt
  | PrologCstNode;

export interface XMLOptions extends ParserOptions<XMLAst> {
  bracketSameLine: boolean;
  xmlWhitespaceSensitivity: "ignore" | "strict";
}
