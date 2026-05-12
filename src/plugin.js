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
    xmlSortAttributesByKey: {
      type: "boolean",
      category: "XML",
      default: false,
      description:
        "Orders XML attributes by key alphabetically while prioritizing xmlns attributes."
    },
    xmlQuoteAttributes: {
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
          value: "single",
          description:
            "Quotes in attribute values will be converted to consistent single quotes and other quotes in the string will be escaped."
        },
        {
          value: "double",
          description:
            "Quotes in attribute values will be converted to consistent double quotes and other quotes in the string will be escaped."
        }
      ]
    },
    xmlSelfClosingTags: {
      type: "choice",
      category: "XML",
      default: "always",
      description: "Controls how empty XML tags are formatted.",
      choices: [
        {
          value: "always",
          description: "Convert empty tags to self-closing format."
        },
        {
          value: "preserve",
          description: "Preserve tags as written in source."
        },
        {
          value: "never",
          description: "Convert self-closing tags to empty open/close format."
        }
      ],
      since: "3.5.0"
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

export default plugin;
