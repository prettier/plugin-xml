const embed = require("./embed");
const languages = require("./languages");
const parser = require("./parser");
const printer = require("./printer");

const plugin = {
  languages,
  parsers: {
    xml: parser
  },
  printers: {
    xml: {
      embed,
      print: printer
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
