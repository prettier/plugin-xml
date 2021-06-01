import type { AttributeCstNode, ChardataCstNode, ContentCstNode, DocTypeDeclNode, DocumentCstNode, ElementCstNode, ExternalIDNode, PrologCstNode, ReferenceCstNode } from "@xml-tools/parser";
import type { IToken } from "chevrotain";
import type { ParserOptions } from "prettier";

export interface ContentCstNodeExt extends Omit<ContentCstNode, "children"> {
  children: ContentCstNode["children"] & { PROCESSING_INSTRUCTION: IToken[] };
}

interface DocTypeDeclNodeExt extends Omit<DocTypeDeclNode, "children"> {
  children: DocTypeDeclNode["children"] & { CLOSE: IToken[] }
}

interface ExternalIDNodeExt extends Omit<ExternalIDNode, "name"> {
  name: "externalID";
}

export type XMLAST =
  | AttributeCstNode
  | ChardataCstNode
  | ContentCstNodeExt
  | DocTypeDeclNodeExt
  | DocumentCstNode
  | ElementCstNode
  | ExternalIDNodeExt
  | PrologCstNode;

export interface XMLOptions extends ParserOptions<XMLAST> {
  xmlSelfClosingSpace: boolean;
  xmlWhitespaceSensitivity: "ignore" | "strict";
}
