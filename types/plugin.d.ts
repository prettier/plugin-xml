import type { Plugin } from "prettier";

declare module "prettier" {
  interface Options {
    xmlWhitespaceSensitivity?: "strict" | "preserve" | "ignore" | undefined;
    xmlSelfClosingSpace?: boolean | undefined;
    xmlSortAttributesByKey?: boolean | undefined;
    xmlQuoteAttributes?: "preserve" | "single" | "double" | undefined;
  }
}

declare const plugin: Plugin;
export default plugin;
