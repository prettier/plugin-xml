import { builders } from "prettier/doc";
import embed from "./embed";
import type { ContentCstNode, Doc, IToken, Path, Printer } from "./types";

const { fill, group, hardline, indent, join, line, literalline, softline } =
  builders;

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

type Fragment = {
  offset: number;
  printed: Doc;
  startLine?: number;
  endLine?: number;
};

function printIToken(path: Path<IToken>): Fragment {
  const node = path.getValue();

  return {
    offset: node.startOffset,
    startLine: node.startLine,
    endLine: node.endLine,
    printed: node.image
  };
}

function replaceNewlinesWithLiteralLines(content: string) {
  return content
    .split(/(\n)/g)
    .map((value, idx) => (idx % 2 === 0 ? value : literalline));
}

const printer: Printer = {
  embed,
  print(path, opts, print) {
    const node = path.getValue();

    switch (node.name) {
      case "attribute": {
        const { Name, EQUALS, STRING } = node.children;

        return [Name[0].image, EQUALS[0].image, STRING[0].image];
      }
      case "chardata": {
        const { SEA_WS, TEXT } = node.children;
        const [{ image }] = SEA_WS || TEXT;

        return image
          .split(/(\n)/g)
          .map((value, index) => (index % 2 === 0 ? value : literalline));
      }
      case "content": {
        const nodePath = path as Path<typeof node>;

        let fragments = nodePath.call((childrenPath) => {
          let response: Fragment[] = [];
          const children = childrenPath.getValue();

          if (children.CData) {
            response = response.concat(childrenPath.map(printIToken, "CData"));
          }

          if (children.Comment) {
            response = response.concat(
              childrenPath.map(printIToken, "Comment")
            );
          }

          if (children.chardata) {
            response = response.concat(
              childrenPath.map(
                (charDataPath) => ({
                  offset: charDataPath.getValue().location!.startOffset,
                  printed: print(charDataPath)
                }),
                "chardata"
              )
            );
          }

          if (children.element) {
            response = response.concat(
              childrenPath.map(
                (elementPath) => ({
                  offset: elementPath.getValue().location!.startOffset,
                  printed: print(elementPath)
                }),
                "element"
              )
            );
          }

          if (children.PROCESSING_INSTRUCTION) {
            response = response.concat(
              childrenPath.map(printIToken, "PROCESSING_INSTRUCTION")
            );
          }

          if (children.reference) {
            response = response.concat(
              childrenPath.map((referencePath) => {
                const referenceNode = referencePath.getValue();

                return {
                  offset: referenceNode.location!.startOffset,
                  printed: (referenceNode.children.CharRef ||
                    referenceNode.children.EntityRef)[0].image
                };
              }, "reference")
            );
          }

          return response;
        }, "children");

        const { Comment } = node.children;

        if (hasIgnoreRanges(Comment)) {
          Comment.sort((left, right) => left.startOffset - right.startOffset);

          const ignoreRanges: { start: number; end: number }[] = [];
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
              ({ start, end }) =>
                fragment.offset < start || fragment.offset > end
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
        return group(fragments.map(({ printed }) => printed));
      }
      case "docTypeDecl": {
        const { DocType, Name, externalID, CLOSE } = node.children;
        const parts: Doc[] = [DocType[0].image, " ", Name[0].image];

        if (externalID) {
          parts.push(" ", path.call(print, "children", "externalID", 0));
        }

        return group([...parts, CLOSE[0].image]);
      }
      case "document": {
        const { docTypeDecl, element, misc, prolog } = node.children;
        const fragments: Fragment[] = [];

        if (docTypeDecl) {
          fragments.push({
            offset: docTypeDecl[0].location!.startOffset,
            printed: path.call(print, "children", "docTypeDecl", 0)
          });
        }

        if (prolog) {
          fragments.push({
            offset: prolog[0].location!.startOffset,
            printed: path.call(print, "children", "prolog", 0)
          });
        }

        if (misc) {
          misc.forEach((node) => {
            if (node.children.PROCESSING_INSTRUCTION) {
              fragments.push({
                offset: node.location!.startOffset,
                printed: node.children.PROCESSING_INSTRUCTION[0].image
              });
            } else if (node.children.Comment) {
              fragments.push({
                offset: node.location!.startOffset,
                printed: node.children.Comment[0].image
              });
            }
          });
        }

        if (element) {
          fragments.push({
            offset: element[0].location!.startOffset,
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
            indent([line, join(line, path.map(print, "children", "attribute"))])
          );
        }

        // Determine the value that will go between the <, name, and attributes
        // of an element and the /> of an element.
        const space: Doc = opts.xmlSelfClosingSpace ? line : softline;

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

        if (
          opts.xmlWhitespaceSensitivity === "ignore" &&
          isWhitespaceIgnorable(content[0])
        ) {
          const nodePath = path as Path<typeof node>;

          const fragments = nodePath.call(
            (childrenPath) => {
              const children = childrenPath.getValue();
              let response: Fragment[] = [];

              if (children.Comment) {
                response = response.concat(
                  childrenPath.map(printIToken, "Comment")
                );
              }

              if (children.chardata) {
                childrenPath.each((charDataPath) => {
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
                          .split(/( )/g)
                          .map((segment, index) =>
                            index % 2 === 0 ? segment : line
                          )
                      );
                    })
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
                response = response.concat(
                  childrenPath.map((elementPath) => {
                    const location = elementPath.getValue().location!;

                    return {
                      offset: location.startOffset,
                      startLine: location.startLine,
                      endLine: location.endLine!,
                      printed: print(elementPath)
                    };
                  }, "element")
                );
              }

              if (children.PROCESSING_INSTRUCTION) {
                response = response.concat(
                  childrenPath.map(printIToken, "PROCESSING_INSTRUCTION")
                );
              }

              return response;
            },
            "children",
            "content",
            0,
            "children"
          );

          fragments.sort((left, right) => left.offset - right.offset);

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

          const docs: Doc[] = [];
          let lastLine: number = fragments[0].startLine!;

          fragments.forEach((node) => {
            if (node.startLine! - lastLine >= 2) {
              docs.push(hardline, hardline);
            } else {
              docs.push(hardline);
            }

            docs.push(node.printed);
            lastLine = node.endLine!;
          });

          return group([openTag, indent(docs), hardline, closeTag]);
        }

        return group([
          openTag,
          indent(path.call(print, "children", "content", 0)),
          closeTag
        ]);
      }
      case "externalID": {
        const { Public, PubIDLiteral, System, SystemLiteral } = node.children;

        if (System) {
          return group([
            System[0].image,
            indent([line, SystemLiteral[0].image])
          ]);
        }

        return group([
          group([Public[0].image, indent([line, PubIDLiteral[0].image])]),
          indent([line, SystemLiteral[0].image])
        ]);
      }
      case "prolog": {
        const { XMLDeclOpen, attribute, SPECIAL_CLOSE } = node.children;
        const parts: Doc[] = [XMLDeclOpen[0].image];

        if (attribute) {
          parts.push(
            indent([
              softline,
              join(line, path.map(print, "children", "attribute"))
            ])
          );
        }

        const space = opts.xmlSelfClosingSpace ? line : softline;
        return group([...parts, space, SPECIAL_CLOSE[0].image]);
      }
    }
  }
};

export default printer;
