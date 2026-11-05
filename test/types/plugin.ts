import plugin from "@prettier/plugin-xml";
import { format, type Options, type Plugin } from "prettier";

const xmlPlugin: Plugin = plugin;

const options: Options = {
  plugins: [xmlPlugin],
  printWidth: 80,
  xmlWhitespaceSensitivity: "strict",
  xmlSelfClosingSpace: true,
  xmlSortAttributesByKey: false,
  xmlQuoteAttributes: "preserve"
};

const whitespace: "strict" | "preserve" | "ignore" | undefined =
  options.xmlWhitespaceSensitivity;
const selfClosingSpace: boolean | undefined = options.xmlSelfClosingSpace;
const sortAttributes: boolean | undefined = options.xmlSortAttributesByKey;
const quotes: "preserve" | "single" | "double" | undefined =
  options.xmlQuoteAttributes;

format("<foo/>", options);
format("<foo/>", {} satisfies Options);
format("<foo/>", {
  xmlWhitespaceSensitivity: undefined,
  xmlSelfClosingSpace: undefined,
  xmlSortAttributesByKey: undefined,
  xmlQuoteAttributes: undefined
} satisfies Options);

for (const xmlWhitespaceSensitivity of [
  "strict",
  "preserve",
  "ignore"
] as const) {
  format("<foo/>", { xmlWhitespaceSensitivity } satisfies Options);
}

for (const xmlQuoteAttributes of ["preserve", "single", "double"] as const) {
  format("<foo/>", { xmlQuoteAttributes } satisfies Options);
}

for (const enabled of [true, false]) {
  format("<foo/>", {
    xmlSelfClosingSpace: enabled,
    xmlSortAttributesByKey: enabled
  } satisfies Options);
}

format("<foo/>", {
  // @ts-expect-error Only the plugin's whitespace modes are valid.
  xmlWhitespaceSensitivity: "collapse"
} satisfies Options);

format("<foo/>", {
  // @ts-expect-error Only the plugin's quote modes are valid.
  xmlQuoteAttributes: "auto"
} satisfies Options);

format("<foo/>", {
  // @ts-expect-error This option accepts booleans, not strings.
  xmlSelfClosingSpace: "true"
} satisfies Options);

format("<foo/>", {
  // @ts-expect-error This option accepts booleans, not numbers.
  xmlSortAttributesByKey: 1
} satisfies Options);

format("<foo/>", {
  // @ts-expect-error The augmentation must preserve Prettier's built-in options.
  printWidth: "wide"
} satisfies Options);
