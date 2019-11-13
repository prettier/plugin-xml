const attrsRegx = new RegExp('([^\\s=]+)\\s*(=\\s*([\'"])(.*?)\\3)?', 'g');

class XMLNode {
  constructor(tagname, parent, val) {
    this.tagname = tagname;
    this.parent = parent;
    this.child = {};
    this.attrsMap = {};
    this.val = val;
  }

  addAttrs(attrs) {
    if (typeof attrs !== "string") {
      return;
    }

    const normalized = attrs.replace(/\r?\n/g, " ");
    let match = attrsRegx.exec(normalized);

    while (match) {
      const attrName = match[1];
      if (attrName.length) {
        this.attrsMap[attrName] = match[4] === undefined ? true : match[4].trim();
      }

      match = attrsRegx.exec(normalized);
    }
  }

  addChild(child) {
    if (Array.isArray(this.child[child.tagname])) {
      this.child[child.tagname].push(child);
    } else {
      this.child[child.tagname] = [child];
    }
  }
}

const getValue = v => typeof v !== "undefined" ? v : "";

const TagType = { OPENING: 1, CLOSING: 2, SELF: 3, CDATA: 4 };
let regx = '<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|(([\\w:\\-._]*:)?([\\w:\\-._]+))([^>]*)>|((\\/)(([\\w:\\-._]*:)?([\\w:\\-._]+))\\s*>))([^<]*)';

const getTagType = tag => {
  if (tag[4] === "]]>") {
    return TagType.CDATA;
  }
  if (tag[10] === "/") {
    return TagType.CLOSING;
  }
  if (typeof tag[8] !== "undefined" && tag[8].substr(tag[8].length - 1) === "/") {
    return TagType.SELF;
  }
  return TagType.OPENING;
};

const getTrimmedTagValue = tag => (tag[14] || "").trim();

const parse = (xmlData, _parsers, _opts) => {
  xmlData = xmlData.replace(/<!--[\s\S]*?-->/g, ''); //Remove comments

  const xmlNode = new XMLNode('!xml');
  let currentNode = xmlNode;

  const tagsRegx = new RegExp(regx, 'g');
  let tag = tagsRegx.exec(xmlData);
  let nextTag = tagsRegx.exec(xmlData);

  while (tag) {
    switch (getTagType(tag)) {
      case TagType.CLOSING: {
        if (currentNode.parent && tag[14]) {
          currentNode.parent.val = getValue(currentNode.parent.val) + '' + getTrimmedTagValue(tag);
        }
        currentNode = currentNode.parent;
        break;
      }
      case TagType.CDATA: {
        //add cdata node
        const childNode = new XMLNode("#cdata", currentNode, tag[3]);
        childNode.addAttrs(tag[8]);
        currentNode.addChild(childNode);
        //for backtracking
        currentNode.val = getValue(currentNode.val) + '\\c';
        //add rest value to parent node
        if (tag[14]) {
          currentNode.val += getTrimmedTagValue(tag);
        }
        break;
      } 
      case TagType.SELF: {
        if (currentNode && tag[14]) {
          currentNode.val = getValue(currentNode.val) + '' + getTrimmedTagValue(tag);
        }

        const childNode = new XMLNode(tag[5], currentNode, '');
        if (tag[8] && tag[8].length > 0) {
          tag[8] = tag[8].substr(0, tag[8].length - 1);
        }
        childNode.addAttrs(tag[8]);
        currentNode.addChild(childNode);
        break;
      }
      case TagType.OPENING: {
        const childNode = new XMLNode(
          tag[5],
          currentNode,
          getTrimmedTagValue(tag)
        );
        childNode.addAttrs(tag[8]);
        currentNode.addChild(childNode);
        currentNode = childNode;
        break;
      }
    }

    tag = nextTag;
    nextTag = tagsRegx.exec(xmlData);
  }

  return xmlNode;
};

module.exports = parse;
