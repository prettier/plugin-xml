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
      extensions: [".dita", ".ditamap", ".ditaval", ".svg", ".xml", ".xsd"],
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
    xmlSelfClosingSpace: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "Adds a space before self-closing tags."
    },
    xmlWhitespaceSensitivity: {
      type: "choice",
      category: "Global",
      default: "strict",
      description: "How to handle whitespaces in XML.",
      choices: [
        {
          value: "strict",
          description: "Whitespaces are considered sensitive in all elements."
        },
        {
          value: "ignore",
          description: "Whitespaces are considered insensitive in all elements."
        }
      ]
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

module.exports = plugin;
