const parse = require("./parse");
const print = require("./print");

const locStart = node => node.locStart;
const locEnd = node => node.locEnd;

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
  options: {
    xmlSelfClosingTags: {
      since: "1.19.1",
      category: "XML",
      type: "boolean",
      default: true,
      description: "Whether or not to allow self closing XML tags."
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

module.exports = plugin;
