import type { Plugin } from "prettier";

import type { XMLAst } from "./types";
import parser from "./parser";
import printer from "./printer";

const plugin: Plugin<XMLAst> = {
  languages: [
    {
      name: "XML",
      parsers: ["xml"],
      aliases: ["rss", "xsd", "wsdl"],
      extensions: [
        ".xml",
        ".adml",
        ".admx",
        ".ant",
        ".axml",
        ".builds",
        ".ccproj",
        ".ccxml",
        ".clixml",
        ".cproject",
        ".cscfg",
        ".csdef",
        ".csl",
        ".csproj",
        ".ct",
        ".depproj",
        ".dita",
        ".ditamap",
        ".ditaval",
        ".dll.config",
        ".dotsettings",
        ".filters",
        ".fsproj",
        ".fxml",
        ".glade",
        ".gml",
        ".gmx",
        ".grxml",
        ".iml",
        ".inx",
        ".ivy",
        ".jelly",
        ".jsproj",
        ".kml",
        ".launch",
        ".mdpolicy",
        ".mjml",
        ".mm",
        ".mod",
        ".mxml",
        ".natvis",
        ".ncl",
        ".ndproj",
        ".nproj",
        ".nuspec",
        ".odd",
        ".osm",
        ".pkgproj",
        ".pluginspec",
        ".proj",
        ".props",
        ".ps1xml",
        ".psc1",
        ".pt",
        ".rdf",
        ".resx",
        ".rss",
        ".sch",
        ".scxml",
        ".sfproj",
        ".shproj",
        ".srdf",
        ".storyboard",
        ".sublime-snippet",
        ".targets",
        ".tml",
        ".ts",
        ".tsx",
        ".ui",
        ".urdf",
        ".ux",
        ".vbproj",
        ".vcxproj",
        ".vsixmanifest",
        ".vssettings",
        ".vstemplate",
        ".vxml",
        ".wixproj",
        ".workflow",
        ".wsdl",
        ".wsf",
        ".wxi",
        ".wxl",
        ".wxs",
        ".x3d",
        ".xacro",
        ".xaml",
        ".xib",
        ".xlf",
        ".xliff",
        ".xmi",
        ".xml.dist",
        ".xproj",
        ".xsd",
        ".xspec",
        ".xul",
        ".zcml"
      ],
      filenames: [
        ".classpath",
        ".cproject",
        ".project",
        "App.config",
        "NuGet.config",
        "Settings.StyleCop",
        "Web.Debug.config",
        "Web.Release.config",
        "Web.config",
        "packages.config"
      ],
      vscodeLanguageIds: ["xml", "forcesourcemanifest"],
      linguistLanguageId: 399
    },
    {
      name: "SVG",
      parsers: ["xml"],
      extensions: [".svg"],
      vscodeLanguageIds: ["svg"],
      linguistLanguageId: 337
    }
  ],
  parsers: {
    xml: parser
  },
  printers: {
    xml: printer
  },
  options: {
    xmlSelfClosingSpace: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "Adds a space before self-closing tags.",
      since: "0.4.0"
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
      ],
      since: "0.6.0"
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

export default plugin;
