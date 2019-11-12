const parse = require("./parse");
const print = require("./print");

// These functions are necessary or the print with cursor function breaks.
// Eventually we should fill them in with the correct metadata, but the parser
// doesn't provide it at the moment.
const locStart = _node => 0;
const locEnd = _node => 0;

const plugin = {
  languages: [
    {
      name: "XML",
      parsers: ["xml"],
      extensions: [".xml"]
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
