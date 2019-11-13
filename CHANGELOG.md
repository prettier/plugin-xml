# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Support for cdata tags.
- Support for the `locStart` and `locEnd` functions by tracking node metadata in the new parser.

### Changed

- Dropped the dependency on `fast-xml-parser` in favor of writing our own for better control over comments and node location.

## [0.2.0] - 2019-11-12

### Changed

- Renamed package to `@prettier/plugin-xml`.

## [0.1.0] - 2019-11-12

### Added

- Initial release 🎉

[unreleased]: https://github.com/prettier/plugin-xml/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/prettier/plugin-xml/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/prettier/plugin-xml/compare/289f2a...v0.1.0
