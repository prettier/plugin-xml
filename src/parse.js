const attrsPattern = '([^\\s=]+)\\s*(=\\s*([\'"])(.*?)\\3)?';
const tagPattern = '<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|(([\\w:\\-._]*:)?([\\w:\\-._]+))([^>]*)>|((\\/)(([\\w:\\-._]*:)?([\\w:\\-._]+))\\s*>))([^<]*)';

class XMLNode {
  constructor(tagname, parent, val, attrs) {
    this.tagname = tagname;
    this.parent = parent;
    this.child = {};
    this.attrs = {};
    this.val = val;

    if (typeof attrs === "string") {
      const normal = attrs.replace(/\r?\n/g, " ");
      const attrsRegex = new RegExp(attrsPattern, "g");
      let match;

      while (match = attrsRegex.exec(normal)) {
        const name = match[1];
        if (name.length) {
          this.attrs[name] = match[4] === undefined ? true : match[4].trim();
        }
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

const getValue = v => typeof v !== "undefined" ? v : "";
const getTagValue = tag => (tag[14] || "").trim();

const parse = (text, _parsers, _opts) => {
  const xmlData = text.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments

  const xmlNode = new XMLNode("!xml");
  let currentNode = xmlNode;

  const tagsRegx = new RegExp(tagPattern, "g");
  let tag;

  while (tag = tagsRegx.exec(xmlData)) {
    if (tag[4] === "]]>") {
      //add cdata node
      const childNode = new XMLNode("!cdata", currentNode, tag[3], tag[8]);
      currentNode.addChild(childNode);

      //for backtracking
      currentNode.val = getValue(currentNode.val) + '\\c';

      //add rest value to parent node
      if (tag[14]) {
        currentNode.val += getTagValue(tag);
      }
    } else if (tag[10] === "/") {
      if (currentNode.parent && tag[14]) {
        currentNode.parent.val = `${getValue(currentNode.parent.val)}${getTagValue(tag)}`;
      }
      currentNode = currentNode.parent;
    } else if (typeof tag[8] !== "undefined" && tag[8].substr(tag[8].length - 1) === "/") {
      if (currentNode && tag[14]) {
        currentNode.val = `${getValue(currentNode.val)}${getTagValue(tag)}`;
      }

      if (tag[8] && tag[8].length > 0) {
        tag[8] = tag[8].substr(0, tag[8].length - 1);
      }

      const childNode = new XMLNode(tag[5], currentNode, "", tag[8]);
      currentNode.addChild(childNode);
    } else {
      const childNode = new XMLNode(tag[5], currentNode, getTagValue(tag), tag[8]);

      currentNode.addChild(childNode);
      currentNode = childNode;
    }
  }

  return xmlNode;
};

module.exports = parse;
