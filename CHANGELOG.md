# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.1] - 2021-03-03

### Changed

- Fixed a bug with newlines when there is empty content.
## [0.13.0] - 2021-01-22

### Added

- Maintain newlines if there are some in the original source.

## [0.12.0] - 2020-08-31

### Added

- Allow embedded parsers to handle content if element tags contain only text content and the tag name matches the name of an existing parser. For example:

```xml
<style type="text/css">
.box {
  height: 100px;
  width: 100px;
}
</style>
```

- Additionally support `.inx` files.

## [0.11.0] - 2020-08-14

### Changed

- Support for a whole wide variety of file types, as per linguist.

## [0.10.0] - 2020-07-24

### Changed

- Some better support for indenting mixed content when whitespace is set to ignore.

## [0.9.0] - 2020-07-21

### Added

- Ignored print ranges using the special `<!-- prettier-ignore-start -->` and `<!-- prettier-ignore-end -->` comments. For example, you can now do:

```xml
<foo>
  <!-- prettier-ignore-start -->
    < this-content-will-not-be-formatted />
  <!-- prettier-ignore-end -->
</foo>
```

and it will maintain your formatting.

## [0.8.0] - 2020-07-03

### Added

- Support `.wsdl` files.

## [0.7.2] - 2020-02-12

### Changed

- Bump dependency on `@xml-tools/parser` to `v1.0.2`.

## [0.7.1] - 2020-02-10

### Changed

- Require `prettier/doc` instead of `prettier` to load less code in standalone mode.

## [0.7.0] - 2020-01-29

### Added

- Handle processing instructions inside elements.
- Properly handle mult-line CData tags.

## [0.6.0] - 2020-01-27

### Added

- The `xmlWhitespaceSensitivity` option, with current valid values of `"strict"` and `"ignore"`. `"strict"` behavior maintains the current behavior, while `"ignore"` allows the plugin more freedom in where to place nodes.

## [0.5.0] - 2020-01-21

### Added

- Support for DOCTYPE nodes.

## [0.4.0] - 2020-01-19

### Added

- A dependency on the `@xml-tools/parser` package to handle parsing.
- We now register as supporting `.svg` and `.xsd` files.
- The `xmlSelfClosingSpace` option for specifying whether or not to add spaces before self-closing element tags.

## [0.3.0] - 2019-11-14

### Added

- Support for cdata tags.
- Support for the `locStart` and `locEnd` functions by tracking node metadata in the new parser.
- Support for comment nodes.
- Support for `<?xml ... ?>` and `<?xml-model ... ?>` tags.

### Changed

- Dropped the dependency on `fast-xml-parser` in favor of writing our own for better control over comments and node location.

## [0.2.0] - 2019-11-12

### Changed

- Renamed package to `@prettier/plugin-xml`.

## [0.1.0] - 2019-11-12

### Added

- Initial release 🎉

[unreleased]: https://github.com/prettier/plugin-xml/compare/v0.13.1...HEAD
[0.13.1]: https://github.com/prettier/plugin-xml/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/prettier/plugin-xml/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/prettier/plugin-xml/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/prettier/plugin-xml/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/prettier/plugin-xml/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/prettier/plugin-xml/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/prettier/plugin-xml/compare/v0.7.2...v0.8.0
[0.7.2]: https://github.com/prettier/plugin-xml/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/prettier/plugin-xml/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/prettier/plugin-xml/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/prettier/plugin-xml/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/prettier/plugin-xml/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/prettier/plugin-xml/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/prettier/plugin-xml/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/prettier/plugin-xml/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/prettier/plugin-xml/compare/289f2a...v0.1.0
