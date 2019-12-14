const attrsPattern = "([^\\s=]+)\\s*(=\\s*(['\"])(.*?)\\3)?";

const cDataPattern = "(!\\[CDATA\\[([\\s\\S]*?)(]]>))";

const tagNamePattern = "(([\\w:\\-._]*:)?([\\w:\\-._]+))";
const startTagPattern = `${tagNamePattern}([^>]*)>`;
const endTagPattern = `((\\/)${tagNamePattern}\\s*>)`;

const commentPattern = "(!--)([\\s\\S\\n]*?)-->";
const declPattern = "((\\?xml)(-model)?)(.+)\\?>";

const tagPattern = `<(${cDataPattern}|${startTagPattern}|${endTagPattern}|${commentPattern}|${declPattern})([^<]*)`;

class XMLNode {
  constructor(tagname, opts) {
    this.tagname = tagname;
    this.children = [];

    this.parent = opts.parent;
    this.value = opts.value || "";

    this.locStart = opts.locStart || 0;
    this.locEnd = opts.locEnd || 0;

    this.attrs = {};
    this.parseAttrs(opts.attrs);
  }

  parseAttrs(attrs) {
    if (typeof attrs !== "string" || !attrs) {
      return;
    }

    const normal = attrs.replace(/\r?\n/g, " ");
    const attrsRegex = new RegExp(attrsPattern, "g");
    let match;

    while ((match = attrsRegex.exec(normal))) {
      const name = match[1];
      if (name.length) {
        this.attrs[name] = match[4] === undefined ? true : match[4].trim();
      }
    }
  }
}

const parse = (text, _parsers, _opts) => {
  const rootNode = new XMLNode("!root", { locStart: 0, locEnd: text.length });
  let node = rootNode;

  const tagRegex = new RegExp(tagPattern, "g");
  let tag;

  while ((tag = tagRegex.exec(text))) {
    const value = (tag[20] || "").trim();

    if (tag[17] === "?xml") {
      node.children.push(
        new XMLNode(`!${tag[16]}`, {
          parent: node,
          attrs: tag[19],
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );
    } else if (tag[14] === "!--") {
      node.children.push(
        new XMLNode("!comment", {
          parent: node,
          value: tag[0].trim(),
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );
    } else if (tag[4] === "]]>") {
      node.children.push(
        new XMLNode("!cdata", {
          parent: node,
          value: tag[3],
          attrs: tag[8],
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );

      node.value += `\\c${value}`;
    } else if (tag[10] === "/") {
      node.locEnd = tag.index + tag[0].trim().length;
      node.parent.value += value;
      node = node.parent;
    } else if (
      typeof tag[8] !== "undefined" &&
      tag[8].charAt(tag[8].length - 1) === "/"
    ) {
      node.value += value;
      node.children.push(
        new XMLNode(tag[5], {
          parent: node,
          attrs: tag[8].slice(0, -1),
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );
    } else {
      node = new XMLNode(tag[5], {
        parent: node,
        value,
        attrs: tag[8],
        locStart: tag.index
      });

      node.parent.children.push(node);
    }
  }

  return rootNode;
};

module.exports = parse;
