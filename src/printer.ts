import type { ChardataCstNode, ContentCstNode, ReferenceCstNode } from "@xml-tools/parser";
import type { IToken } from "chevrotain";
import type { Doc, FastPath, Printer } from "prettier";
import { builders } from "prettier/doc";

import embed from "./embed";

import { ContentCstNodeExt, XMLAST, XMLOptions } from "./types";

const {
  concat,
  fill,
  group,
  hardline,
  indent,
  join,
  line,
  literalline,
  softline
} = builders;

const ignoreStartComment = "<!-- prettier-ignore-start -->";
const ignoreEndComment = "<!-- prettier-ignore-end -->";

function hasIgnoreRanges(comments: IToken[]) {
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

function isWhitespaceIgnorable(node: ContentCstNode) {
  const { CData, Comment, reference } = node.children;

  return !CData && !reference && !hasIgnoreRanges(Comment);
}

function printIToken(path: FastPath<XMLAST>) {
  const node = path.getValue() as any as IToken;

  return {
    offset: node.startOffset,
    startLine: node.startLine!,
    endLine: node.endLine!,
    printed: node.image
  };
}

function replaceNewlinesWithLiteralLines(content: string) {
  return concat(
    content
      .split(/(\n)/g)
      .map((value, idx) => (idx % 2 === 0 ? value : literalline))
  );
}

const printer: Printer<XMLAST> = {
  embed,
  print(path, opts: XMLOptions, print) {
    const node = path.getValue();

    switch (node.name) {
      case "attribute": {
        const { Name, EQUALS, STRING } = node.children;
    
        return concat([Name[0].image, EQUALS[0].image, STRING[0].image]);
      }
      case "chardata": {
        const { SEA_WS, TEXT } = node.children;
        const [{ image }] = SEA_WS || TEXT;
    
        return concat(
          image
            .split(/(\n)/g)
            .map((value, index) => (index % 2 === 0 ? value : literalline))
        );
      }
      case "content": {
        let fragments = path.call((childrenPath) => {
          const children = childrenPath.getValue() as any as ContentCstNodeExt["children"];
          let response: { offset: number; printed: Doc }[] = [];

          if (children.CData) {
            response = response.concat(path.map(printIToken, "CData"))
          }
  
          if (children.Comment) {
            response = response.concat(path.map(printIToken, "Comment"));
          }
  
          if (children.chardata) {
            response = response.concat(path.map((charDataPath) => ({
              offset: charDataPath.getValue().location!.startOffset,
              printed: print(charDataPath)
            }), "chardata"));
          }
  
          if (children.element) {
            response = response.concat(path.map((elementPath) => ({
              offset: elementPath.getValue().location!.startOffset,
              printed: print(elementPath)
            }), "element"));
          }
  
          if (children.Comment) {
            response = response.concat(path.map(printIToken, "Comment"));
          }
  
          if (children.PROCESSING_INSTRUCTION) {
            response = response.concat(path.map(printIToken, "PROCESSING_INSTRUCTION"));
          }
  
          if (children.reference) {
            response = response.concat(path.map((referencePath) => {
              const referenceNode = referencePath.getValue() as any as ReferenceCstNode;
  
              return {
                offset: referenceNode.location!.startOffset,
                printed: (referenceNode.children.CharRef || referenceNode.children.EntityRef)[0].image
              };
            }, "reference"));
          }
        
          return response;
        }, "children");

        const { Comment } = node.children;

        if (hasIgnoreRanges(Comment)) {
          Comment.sort((left, right) => left.startOffset - right.startOffset);

          const ignoreRanges: { start: number, end: number }[] = [];
          let ignoreStart: IToken | null = null;
    
          // Build up a list of ignored ranges from the original text based on the
          // special prettier-ignore-* comments
          Comment.forEach((comment) => {
            if (comment.image === ignoreStartComment) {
              ignoreStart = comment;
            } else if (ignoreStart && comment.image === ignoreEndComment) {
              ignoreRanges.push({
                start: ignoreStart.startOffset,
                end: comment.endOffset!
              });
    
              ignoreStart = null;
            }
          });
    
          // Filter the printed children to only include the ones that are outside
          // of each of the ignored ranges
          fragments = fragments.filter((fragment) =>
            ignoreRanges.every(
              ({ start, end }) => fragment.offset < start || fragment.offset > end
            )
          );
    
          // Push each of the ignored ranges into the child list as its own element
          // so that the original content is still included
          ignoreRanges.forEach(({ start, end }) => {
            const content = opts.originalText.slice(start, end + 1);
    
            fragments.push({
              offset: start,
              printed: replaceNewlinesWithLiteralLines(content)
            });
          });
        }
    
        fragments.sort((left, right) => left.offset - right.offset);
        return group(concat(fragments.map(({ printed }) => printed)));
      }
      case "docTypeDecl": {
        const { DocType, Name, externalID, CLOSE } = node.children;
        const parts: Doc[] = [DocType[0].image, " ", Name[0].image];
    
        if (externalID) {
          parts.push(" ", path.call(print, "children", "externalID", 0));
        }
    
        return group(concat(parts.concat(CLOSE[0].image)));
      }
      case "document": {
        const { docTypeDecl, element, misc, prolog } = node.children;
        let parts: { offset: number, printed: Doc }[] = [];
    
        if (docTypeDecl) {
          parts.push({
            offset: docTypeDecl[0].location!.startOffset,
            printed: path.call(print, "children", "docTypeDecl", 0)
          });
        }
    
        if (prolog) {
          parts.push({
            offset: prolog[0].location!.startOffset,
            printed: path.call(print, "children", "prolog", 0)
          });
        }
    
        if (misc) {
          misc.forEach((node) => {
            if (node.children.PROCESSING_INSTRUCTION) {
              parts.push({
                offset: node.location!.startOffset,
                printed: node.children.PROCESSING_INSTRUCTION[0].image
              });
            } else if (node.children.Comment) {
              parts.push({
                offset: node.location!.startOffset,
                printed: node.children.Comment[0].image
              });
            }
          });
        }
    
        if (element) {
          parts.push({
            offset: element[0].location!.startOffset,
            printed: path.call(print, "children", "element", 0)
          });
        }
    
        parts.sort((left, right) => left.offset - right.offset);

        return concat([join(hardline, parts.map(({ printed }) => printed)), hardline]);
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
    
        const parts: Doc[] = [OPEN[0].image, Name[0].image];
    
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
    
        if (
          opts.xmlWhitespaceSensitivity === "ignore" &&
          isWhitespaceIgnorable(content[0])
        ) {
          const fragments = path.call((childrenPath) => {
            const children = childrenPath.getValue() as any as ContentCstNodeExt["children"];
            let response: { offset: number, startLine: number, endLine: number, printed: Doc }[] = [];

            if (children.Comment) {
              response = response.concat(path.map(printIToken, "Comment"));
            }
    
            if (children.chardata) {
              path.each((charDataPath) => {
                const chardata = charDataPath.getValue() as ChardataCstNode;
                if (!chardata.children.TEXT) {
                  return;
                }

                const content = chardata.children.TEXT[0].image.trim();
                const printed = group(
                  concat(
                    content.split(/(\n)/g).map((value) => {
                      if (value === "\n") {
                        return literalline;
                      }
      
                      return fill(
                        value
                          .split(/( )/g)
                          .map((segment, index) => (index % 2 === 0 ? segment : line))
                      );
                    })
                  )
                );
      
                const location = chardata.location!;
                response.push({
                  offset: location.startOffset,
                  startLine: location.startLine,
                  endLine: location.endLine!,
                  printed
                });
              }, "chardata");
            }
    
            if (children.element) {
              response = response.concat(path.map((elementPath) => {
                const location = elementPath.getValue().location!;
  
                return {
                  offset: location.startOffset,
                  startLine: location.startLine,
                  endLine: location.endLine!,
                  printed: print(elementPath)
                };
              }, "element"));
            }
  
            if (children.PROCESSING_INSTRUCTION) {
              response = response.concat(path.map(printIToken, "PROCESSING_INSTRUCTION"));
            }

            return response;
          }, "children", "content", 0, "children");

          fragments.sort((left, right) => left.offset - right.offset);

          // If the only content of this tag is chardata, then use a softline so
          // that we won't necessarily break (to allow <foo>bar</foo>).
          if (fragments.length === 1 && (content[0].children.chardata || []).filter((chardata) => chardata.children.TEXT).length === 1) {
            return group(
              concat([
                openTag,
                indent(concat([softline, fragments[0].printed])),
                softline,
                closeTag
              ])
            );
          }
    
          if (fragments.length === 0) {
            const space = opts.xmlSelfClosingSpace ? line : softline;
            return group(concat(parts.concat(space, "/>")));
          }
    
          const docs: Doc[] = [];
          let lastLine: number = fragments[0].startLine;
    
          fragments.forEach((node) => {
            if (node.startLine - lastLine >= 2) {
              docs.push(hardline, hardline);
            } else {
              docs.push(hardline);
            }
    
            docs.push(node.printed);
            lastLine = node.endLine;
          });
    
          return group(concat([openTag, indent(concat(docs)), hardline, closeTag]));
        }
    
        return group(
          concat([
            openTag,
            indent(path.call(print, "children", "content", 0)),
            closeTag
          ])
        );
      }
      case "externalID": {
        const { Public, PubIDLiteral, System, SystemLiteral } = node.children;
    
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
      }
      case "prolog": {
        const { XMLDeclOpen, attribute, SPECIAL_CLOSE } = node.children;
        const parts: Doc[] = [XMLDeclOpen[0].image];
    
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
    }
  }
};

export default printer;
