const attrsPattern = '([^\\s=]+)\\s*(=\\s*([\'"])(.*?)\\3)?';
const tagPattern = '<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|(([\\w:\\-._]*:)?([\\w:\\-._]+))([^>]*)>|((\\/)(([\\w:\\-._]*:)?([\\w:\\-._]+))\\s*>))([^<]*)';

class XMLNode {
  constructor(tagname, parent, val, attrs) {
    this.tagname = tagname;
    this.parent = parent;
    this.child = {};
    this.attrs = {};
    this.val = val || "";

    if (typeof attrs === "string" && attrs) {
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

const parse = (text, _parsers, _opts) => {
  const xmlData = text.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments

  const rootNode = new XMLNode("!xml");
  let currentNode = rootNode;

  const tagsRegx = new RegExp(tagPattern, "g");
  let tag;

  while (tag = tagsRegx.exec(xmlData)) {
    const tagValue = (tag[14] || "").trim();

    if (tag[4] === "]]>") {
      currentNode.addChild(new XMLNode("!cdata", currentNode, tag[3], tag[8]));
      currentNode.val += `\\c${tagValue}`;
    } else if (tag[10] === "/") {
      if (currentNode.parent) {
        currentNode.parent.val += tagValue;
      }
      currentNode = currentNode.parent;
    } else if (typeof tag[8] !== "undefined" && tag[8].substr(tag[8].length - 1) === "/") {
      if (currentNode) {
        currentNode.val += tagValue;
      }
      currentNode.addChild(new XMLNode(tag[5], currentNode, "", (tag[8] || "").slice(0, -1)));
    } else {
      currentNode = new XMLNode(tag[5], currentNode, tagValue, tag[8]);
      currentNode.parent.addChild(currentNode);
    }
  }

  return rootNode;
};

module.exports = parse;
