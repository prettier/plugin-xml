const { builders, utils } = require("prettier/doc");
const {
  concat,
  dedentToRoot,
  group,
  hardline,
  indent,
  join,
  line,
  literalline,
  softline
} = builders;
const { mapDoc, stripTrailingHardline } = utils;

// Replace the string content newlines within a doc tree with literallines so
// that all of the indentation lines up appropriately
const replaceNewlines = (doc) =>
  mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string" && currentDoc.includes("\n")
      ? concat(
          currentDoc
            .split(/(\n)/g)
            .map((v, i) => (i % 2 === 0 ? v : literalline))
        )
      : currentDoc
  );

// Get the start and end element tags from the current node on the tree
const getElementTags = (path, print) => {
  const node = path.getValue();
  const {
    OPEN,
    Name,
    attribute,
    START_CLOSE,
    SLASH_OPEN,
    END_NAME,
    END
  } = node.children;

  const parts = [OPEN[0].image, Name[0].image];

  if (attribute) {
    parts.push(
      indent(
        concat([line, join(line, path.map(print, "children", "attribute"))])
      )
    );
  }

  return {
    openTag: group(concat(parts.concat(softline, START_CLOSE[0].image))),
    closeTag: group(
      concat([SLASH_OPEN[0].image, END_NAME[0].image, END[0].image])
    )
  };
};

// Get the name of the parser that is represented by the given element node,
// return null if a matching parser cannot be found
const getParser = (node, opts) => {
  const { Name, attribute } = node.children;
  const parser = Name[0].image.toLowerCase();

  // We don't want to deal with some weird recursive parser situation, so we
  // need to explicitly call out the XML parser here and just return null
  if (parser === "xml") {
    return null;
  }

  // If this is a style tag with a text/css type, then we can skip straight to
  // saying that this needs a CSS parser
  if (
    parser === "style" &&
    attribute &&
    attribute.some(
      (attr) =>
        attr.children.Name[0].image === "type" &&
        attr.children.STRING[0].image === '"text/css"'
    )
  ) {
    return "css";
  }

  // If there is a plugin that has a parser that matches the name of this
  // element, then we're going to assume that's correct for embedding and go
  // ahead and switch to that parser
  if (
    opts.plugins.some(
      (plugin) =>
        plugin.parsers &&
        Object.prototype.hasOwnProperty.call(plugin.parsers, parser)
    )
  ) {
    return parser;
  }

  return null;
};

// Get the source string that will be passed into the embedded parser from the
// content of the inside of the element node
const getSource = (content) =>
  content.chardata
    .map((node) => {
      const { SEA_WS, TEXT } = node.children;
      const [{ image }] = SEA_WS || TEXT;

      return {
        offset: node.location.startOffset,
        printed: image
      };
    })
    .sort(({ offset }) => offset)
    .map(({ printed }) => printed)
    .join("");

const embed = (path, print, textToDoc, opts) => {
  const node = path.getValue();

  // If the node isn't an element node, then skip
  if (node.name !== "element") {
    return null;
  }

  // If the name of the node does not correspond to the name of a parser that
  // prettier knows about, then skip
  const parser = getParser(node, opts);
  if (!parser) {
    return null;
  }

  // If the node does not actually contain content, or it contains any content
  // that is not just plain text, then skip
  const content = node.children.content[0].children;
  if (Object.keys(content).length !== 1 || !content.chardata) {
    return null;
  }

  // Get the open and close tags of this element, then return the properly
  // formatted content enclosed within them
  const { openTag, closeTag } = getElementTags(path, print);

  return group(
    concat([
      openTag,
      literalline,
      dedentToRoot(
        replaceNewlines(
          stripTrailingHardline(textToDoc(getSource(content), { parser }))
        )
      ),
      hardline,
      closeTag
    ])
  );
};

module.exports = embed;
