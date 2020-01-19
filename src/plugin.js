const parse = require("./parse");
const print = require("./print");

const locStart = node => {
  if (node.location) {
    return node.location.startOffset;
  }
  return node.startOffset;
};

const locEnd = node => {
  if (node.location) {
    return node.location.endOffset;
  }
  return node.endOffset;
};

const plugin = {
  languages: [
    {
      name: "XML",
      parsers: ["xml"],
      extensions: [".dita", ".ditamap", ".ditaval", ".svg", ".xml"],
      vscodeLanguageIds: ["xml"]
    }
  ],
  parsers: {
    xml: {
      parse,
      astFormat: "xml",
      locStart,
      locEnd
    }
  },
  printers: {
    xml: {
      print
    }
  },
  options: {},
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

module.exports = plugin;
