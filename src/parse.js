const attrsRegx = new RegExp('([^\\s=]+)\\s*(=\\s*([\'"])(.*?)\\3)?', 'g');

const getAllMatches = function(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
};

class XMLNode {
  constructor(tagname, parent, val) {
    this.tagname = tagname;
    this.parent = parent;
    this.child = {};
    this.attrsMap = {};
    this.val = val;
  }

  addAttrs(attrStr) {
    if (typeof attrStr !== "string") {
      return;
    }

    const matches = getAllMatches(attrStr.replace(/\r?\n/g, ' '), attrsRegx);
    const len = matches.length; //don't make it inline

    for (let i = 0; i < len; i++) {
      const attrName = matches[i][1];
      if (attrName.length) {
        this.attrsMap[attrName] = matches[i][4] === undefined ? true : matches[i][4].trim();
      }
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

const isExist = v => typeof v !== 'undefined';

const isEmptyObject = obj => Object.keys(obj).length === 0;

const getValue = v => {
  if (isExist(v)) {
    return v;
  } else {
    return '';
  }
};

const TagType = {OPENING: 1, CLOSING: 2, SELF: 3, CDATA: 4};
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

  const xmlObj = new XMLNode('!xml');
  let currentNode = xmlObj;

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

  return xmlObj;
};

module.exports = parse;
