/* eslint-disable */
const attrsPattern = "([^\\s=]+)\\s*(=\\s*(['\"])(.*?)\\3)?";

const cDataPattern = "(!\\[CDATA\\[([\\s\\S]*?)(]]>))";

const tagNamePattern = "(([\\w:\\-._]*:)?([\\w:\\-._]+))";
const startTagPattern = `${tagNamePattern}([^>]*)>`;
const endTagPattern = `((\\/)${tagNamePattern}\\s*>)`;

const commentPattern = "(!--)(.+?)-->";
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

const parseFastXmlFork = (text, _parsers, _opts) => {
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
          value: tag[15].trim(),
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

const { parse, BaseXmlCstVisitor } = require("@xml-tools/parser");
class CstToAstVisitor extends BaseXmlCstVisitor {
  visit(cstNode) {
    return super.visit(cstNode, cstNode.location);
  }

  mapVisit(cstNodeArr) {
    if (Array.isArray(cstNodeArr) === false) {
      return []
    }
    const mapResult = cstNodeArr.map((_) => this.visit(_, _.location))
    return mapResult
  }


  /**
   * @param ctx {DocumentCtx}
   * @param location {SourcePosition}
   */
  document(ctx, location) {
    const rootElement = this.visit(ctx.element[0]);

    const docNode = {
      tagname: "!root",
      children: [rootElement],
      parent: undefined,
      value: "",
      locStart: location.startOffset,
      locEnd: location.endOffset + 1
    };

    setChildrenParent(docNode);
    return docNode;
  }

  /**
   * @param ctx {PrologCtx}
   * @param location {SourcePosition}
   */
  prolog(ctx, location) {}

  /**
   * @param ctx {ContentCtx}
   * @param location {SourcePosition}
   */
  content(ctx, location) {
    const subElements = this.mapVisit(ctx.element);
    let value = "";
    // This is super naive, as the chardata could be mixed with other types of XML contents and even
    // semantically meaningful whitespace.
    if (ctx.chardata && ctx.chardata[0].children.TEXT) {
      value = ctx.chardata[0].children.TEXT[0].image;
    }
    return {value: value,  subElements: subElements}
  }

  /**
   * @param ctx {ElementCstNode}
   * @param location {SourcePosition}
   */
  element(ctx, location) {
    const { value, subElements } = this.visit(ctx.content[0]);
    const elementNode = new XMLNode(ctx.Name[0].image, {
      value: value,
      locStart: location.startOffset,
      locEnd: location.endOffset + 1
    });

    elementNode.children = subElements;
    elementNode.attrs = {};
    setChildrenParent(elementNode);

    return elementNode;
  }

  /**
   * @param ctx {ReferenceCtx}
   * @param location {SourcePosition}
   */
  reference(ctx, location) {
    // Irrelevant for the AST at this time
  }

  /**
   * @param ctx {AttributeCtx}
   * @param location {SourcePosition}
   */
  attribute(ctx, location) {}

  /**
   * @param ctx {ChardataCtx}
   * @param location {SourcePosition}
   */
  chardata(ctx, location) {}

  /**
   * @param ctx {MiscCtx}
   * @param location {SourcePosition}
   */
  misc(ctx, location) {
    // Irrelevant for the AST at this time
  }
}

function setChildrenParent(node) {
  node.children.forEach(_ => (_.parent = node));
}
const astBuilderVisitor = new CstToAstVisitor();

const parseXMLTools = (text, _parsers, _opts) => {
  const { lexErrors, parseErrors, cst } = parse(text);
  if (lexErrors.length > 0 || parseErrors.length > 0) {
    throw Error("sad sad panda");
  }

  return astBuilderVisitor.visit(cst);
};

const { deepStrictEqual } = require("assert");
module.exports = (text, _parsers, _opts) => {
  const fastXMLAst = parseFastXmlFork(text, _parsers, _opts);
  const xmlToolsAst = parseXMLTools(text, _parsers, _opts);

  deepStrictEqual(fastXMLAst, xmlToolsAst);

  return xmlToolsAst;
};
