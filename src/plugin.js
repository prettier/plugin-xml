import languages from "./languages.js";
import parser from "./parser.js";
import printer from "./printer.js";

const plugin = {
  languages,
  parsers: {
    xml: parser
  },
  printers: {
    xml: printer
  },
  options: {
    xmlSelfClosingSpace: {
      type: "boolean",
      category: "XML",
      default: true,
      description: "Adds a space before self-closing tags.",
      since: "1.1.0"
    },
    xmlWhitespaceSensitivity: {
      type: "choice",
      category: "XML",
      default: "strict",
      description: "How to handle whitespaces in XML.",
      choices: [
        {
          value: "strict",
          description: "Whitespaces are considered sensitive in all elements."
        },
        {
          value: "preserve",
          description:
            "Whitespaces within text nodes in XML elements and attributes are considered sensitive."
        },
        {
          value: "ignore",
          description: "Whitespaces are considered insensitive in all elements."
        }
      ],
      since: "0.6.0"
    },
    quoteProps: {
      type: "choice",
      category: "XML",
      default: "preserve",
      description: "How to handle whitespaces in XML.",
      choices: [
        {
          value: "preserve",
          description:
            "Quotes in attribute values will be preserved as written."
        },
        {
          value: "consistent",
          description: "Quotes in attribute values will be converted to consistent double quotes or single quotes if singleQuote is set to \"true\"."
        },
      ],
    },
    singleQuote: {
      type: "boolean",
      category: "XML",
      default: false,
      description: "Converts quotes around attribute tags from double quotes to single quotes if quoteProps is set to \"consistent\"",
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

export default plugin;
