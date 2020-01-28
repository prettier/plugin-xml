<h1 align="center">Prettier for XML</h1>

<p align="center">
  <a href="https://gitter.im/jlongster/prettier">
    <img alt="Gitter" src="https://img.shields.io/gitter/room/jlongster/prettier.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/prettier/plugin-xml">
    <img alt="Travis" src="https://img.shields.io/travis/prettier/plugin-xml/master.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/@prettier/plugin-xml">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@prettier/plugin-xml.svg?style=flat-square">
  </a>
  <a href="#badge">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square">
  </a>
  <a href="https://twitter.com/PrettierCode">
    <img alt="Follow+Prettier+on+Twitter" src="https://img.shields.io/twitter/follow/prettiercode.svg?label=follow+prettier&style=flat-square">
  </a>
</p>

`@prettier/plugin-xml` is a [prettier](https://prettier.io/) plugin for XML. `prettier` is an opinionated code formatter that supports multiple languages and integrates with most editors. The idea is to eliminate discussions of style in code review and allow developers to get back to thinking about code design instead.

## Getting started

To run `prettier` with the XML plugin, you're going to need [`node`](https://nodejs.org/en/download/) (version `8.3` or newer).

If you're using the `npm` CLI, then add the plugin by:

```bash
npm install --save-dev prettier @prettier/plugin-xml
```

Or if you're using `yarn`, then add the plugin by:

```bash
yarn add --dev prettier @prettier/plugin-xml
```

The `prettier` executable is now installed and ready for use:

```bash
./node_modules/.bin/prettier --write '**/*.xml'
```

## Configuration

Below are the options (from [`src/plugin.js`](src/plugin.js)) that `@prettier/plugin-xml` currently supports:

| API Option                 | CLI Option                     |  Default   | Description                                                                                      |
| -------------------------- | ------------------------------ | :--------: | ------------------------------------------------------------------------------------------------ |
| `printWidth`               | `--print-width`                |    `80`    | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#print-width)). |
| `tabWidth`                 | `--tab-width`                  |    `2`     | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tab-width)).   |
| `xmlSelfClosingSpace`      | `--xml-self-closing-space`     |   `true`   | Adds a space before self-closing tags.                                                           |
| `xmlWhitespaceSensitivity` | `--xml-whitespace-sensitivity` | `"strict"` | How to handle whitespaces. Options are `"strict"` and `"ignore"`.                                |

Any of these can be added to your existing [prettier configuration
file](https://prettier.io/docs/en/configuration.html). For example:

```json
{
  "tabWidth": 4
}
```

Or, they can be passed to `prettier` as arguments:

```bash
prettier --tab-width 4 --write '**/*.xml'
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/prettier/plugin-xml.

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
