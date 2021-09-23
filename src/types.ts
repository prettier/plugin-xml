import type { IToken } from "chevrotain";
import type * as Prettier from "prettier";
import type {
  AttributeCstNode,
  ChardataCstNode,
  ContentCstNode,
  DocTypeDeclNode,
  DocumentCstNode,
  ElementCstNode,
  ExternalIDNode,
  PrologCstNode
} from "@xml-tools/parser";

// Override the children property of the content CST node because it is missing
// the PROCESSING_INSTRUCTION property.
interface ContentCstNodeExt extends Omit<ContentCstNode, "children"> {
  children: ContentCstNode["children"] & { PROCESSING_INSTRUCTION: IToken[] };
}

// Override the children property of the doctype CST node because it is missing
// the CLOSE property.
interface DocTypeDeclNodeExt extends Omit<DocTypeDeclNode, "children"> {
  children: DocTypeDeclNode["children"] & { CLOSE: IToken[] };
}

// Override the children property of the element CST node because its children
// object points to the content CST node that is missing the
// PROCESSING_INSTRUCTION property.
interface ElementCstNodeExt extends Omit<ElementCstNode, "children"> {
  children: Omit<ElementCstNode["children"], "content"> & {
    content: ContentCstNodeExt[]
  }
}

// Override the name property on the external ID CST node because it has the
// incorrect name value.
interface ExternalIDNodeExt extends Omit<ExternalIDNode, "name"> {
  name: "externalID";
}

// The type of elements that make up the given array T.
type ArrayElement<T> = T extends (infer E)[] ? E : never;

// A union of the properties of the given object that are arrays.
type ArrayProperties<T> = { [K in keyof T]: T[K] extends any[] ? K : never }[keyof T];

// A union of the properties of the given array T that can be used to index it.
// If the array is a tuple, then that's going to be the explicit indices of the
// array, otherwise it's going to just be number.
type IndexProperties<T extends { length: number }> = IsTuple<T> extends true ? Exclude<Partial<T>["length"], T["length"]> : number;

// Effectively performing T[P], except that it's telling TypeScript that it's
// safe to do this for tuples, arrays, or objects.
type IndexValue<T, P> = T extends any[] ? P extends number ? T[P] : never : P extends keyof T ? T[P] : never;

// Determines if an object T is an array like string[] (in which case this
// evaluates to false) or a tuple like [string] (in which case this evaluates to
// true).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type IsTuple<T> = T extends [] ? true : T extends [infer First, ...infer Remain] ? IsTuple<Remain> : false;

type CallProperties<T> = T extends any[] ? IndexProperties<T> : keyof T;
type IterProperties<T> = T extends any[] ? IndexProperties<T> : ArrayProperties<T>;

type CallCallback<T, U> = (path: Path<T>, index: number, value: any) => U;
type EachCallback<T> = (path: Path<ArrayElement<T>>, index: number, value: any) => void;
type MapCallback<T, U> = (path: Path<ArrayElement<T>>, index: number, value: any) => U;

// This path interface is going to override a bunch of functions on the regular
// prettier AstPath interface. This is because we want stricter types than the
// current version of @types/prettier provides.
//
// For each of the tree walk functions (call, each, and map) this provides 5
// strict type signatures, along with a fallback at the end if you end up
// calling more than 5 properties deep (we don't do that but I've included it
// for completeness).
//
// getParentNode is being overridden because previously it was restricted to the
// type T of the given AST, but it's very unlikely you're going to be receiving
// a parent node that exactly matches your current node. So for now just
// returning any.
// prettier-ignore
interface StrictPath<T> {
  call<U>(callback: CallCallback<T, U>): U;
  call<U, P1 extends CallProperties<T>>(callback: CallCallback<IndexValue<T, P1>, U>, prop1: P1): U;
  call<U, P1 extends keyof T, P2 extends CallProperties<T[P1]>>(callback: CallCallback<IndexValue<IndexValue<T, P1>, P2>, U>, prop1: P1, prop2: P2): U;
  call<U, P1 extends keyof T, P2 extends CallProperties<T[P1]>, P3 extends CallProperties<IndexValue<T[P1], P2>>>(callback: CallCallback<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, U>, prop1: P1, prop2: P2, prop3: P3): U;
  call<U, P1 extends keyof T, P2 extends CallProperties<T[P1]>, P3 extends CallProperties<IndexValue<T[P1], P2>>, P4 extends CallProperties<IndexValue<IndexValue<T[P1], P2>, P3>>>(callback: CallCallback<IndexValue<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, P4>, U>, prop1: P1, prop2: P2, prop3: P3, prop4: P4): U;
  call<U, P extends PropertyKey>(callback: CallCallback<any, U>, prop1: P, prop2: P, prop3: P, prop4: P, ...props: P[]): U;

  each(callback: EachCallback<T>): void;
  each<P1 extends IterProperties<T>>(callback: EachCallback<IndexValue<T, P1>>, prop1: P1): void;
  each<P1 extends keyof T, P2 extends IterProperties<T[P1]>>(callback: EachCallback<IndexValue<IndexValue<T, P1>, P2>>, prop1: P1, prop2: P2): void;
  each<P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>>(callback: EachCallback<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>>, prop1: P1, prop2: P2, prop3: P3): void;
  each<P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>, P4 extends IterProperties<IndexValue<IndexValue<T[P1], P2>, P3>>>(callback: EachCallback<IndexValue<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, P4>>, prop1: P1, prop2: P2, prop3: P3, prop4: P4): void;
  each<P extends PropertyKey>(callback: EachCallback<any>, prop1: P, prop2: P, prop3: P, prop4: P, ...props: P[]): void;

  getParentNode: (count?: number | undefined) => any | null,

  map<U>(callback: MapCallback<T, U>): U[];
  map<U, P1 extends IterProperties<T>>(callback: MapCallback<IndexValue<T, P1>, U>, prop1: P1): U[];
  map<U, P1 extends keyof T, P2 extends IterProperties<T[P1]>>(callback: MapCallback<IndexValue<IndexValue<T, P1>, P2>, U>, prop1: P1, prop2: P2): U[];
  map<U, P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>>(callback: MapCallback<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, U>, prop1: P1, prop2: P2, prop3: P3): U[];
  map<U, P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>, P4 extends IterProperties<IndexValue<IndexValue<T[P1], P2>, P3>>>(callback: MapCallback<IndexValue<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, P4>, U>, prop1: P1, prop2: P2, prop3: P3, prop4: P4): U[];
  map<U, P extends PropertyKey>(callback: MapCallback<any, U>, prop1: P, prop2: P, prop3: P, prop4: P, ...props: P[]): U[];
};

// Exporting an overall node union type so that we can reference it in parsers
// and everything.
export type AnyNode = AttributeCstNode | ChardataCstNode | ContentCstNodeExt | DocTypeDeclNodeExt | DocumentCstNode | ElementCstNodeExt | ExternalIDNodeExt | PrologCstNode;

// Reexporting every export from the parser so that the different node types can
// be referenced.
export * from "@xml-tools/parser";

// Rexporting the IToken from chevrotain because that is effectively another
// node in th tree.
export type { IToken } from "chevrotain";

// Reexporting the Doc type mostly because it's annoying to have to reference
// type so deeply in the Prettier namespace. Also because we only really want to
// be pulling in types from this file as they're less likely to change.
export type Doc = Prettier.doc.builders.Doc;

// This is the same embed as is present in prettier, except that it's required.
export type Embed = (
  path: Path<AnyNode>,
  print: (path: Path<any>) => Doc,
  textToDoc: (text: string, options: Options) => Doc,
  options: Options
) => Doc | null;

// These are the regular options from prettier except they also include all of
// the options we defined in our plugin configuration.
export type Options = Prettier.ParserOptions<any> & {
  bracketSameLine: boolean;
  xmlWhitespaceSensitivity: "ignore" | "strict";
};

// We're going to change the signature of our parse function to accept our
// options as opposed to the generic options that don't contain the options we
// defined in our plugin configuration.
export type Parser = Omit<Prettier.Parser<AnyNode>, "parse"> & {
  parse: (text: string, parsers: { [name: string]: Prettier.Parser<any> }, options: Options) => any
};

// We're overwriting a bunch of function here that walk around the tree here
// because if you restrict the AST for the main path then presumably you're
// printing a lower node in the tree that won't match the current AST type.
export type Path<T> = Omit<Prettier.AstPath<T>, keyof StrictPath<T>> & StrictPath<T>;

// Overwriting the parsers option so that we can again pass our defined options
// into the parse functions.
export type Plugin = Omit<Prettier.Plugin<AnyNode>, "parsers" | "printers"> & {
  parsers: { [name: string]: Parser },
  printers: { [name: string]: Printer }
};

// We're overwriting the print function with a print function that accepts the
// options we've defined.
export type Printer = Omit<Prettier.Printer<AnyNode>, "embed" | "print"> & {
  embed: Embed,
  print: (path: Path<AnyNode>, options: Options, print: Print) => Doc;
};

// This is the regular print node, except it's not restricted by the AST that
// is passed to the parent AST. That's because when you're using it, you are not
// typically printing the same node type again.
export type Print = (path: Path<any>) => Doc;
