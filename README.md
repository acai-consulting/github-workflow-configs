# @nuvibit/github-terraform-semantic-release-config

[**semantic-release**](https://github.com/semantic-release/semantic-release) shareable config to create release of Terraform Modules with [Github Actions](https://github.com/nuvibit/github-terraform-workflows).

## Plugins

This shareable configuration use the following plugins:

- [`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer)
- [`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator)
- [`@semantic-release/github`](https://github.com/semantic-release/github)
- [`@semantic-release/changelog`](https://github.com/semantic-release/changelog)
- [`@semantic-release/git`](https://github.com/semantic-release/git)

## Install

```bash
$ npm install --save-dev semantic-release @nuvibit/github-terraform-semantic-release-config
```

## Usage

The shareable config can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "extends": "@nuvibit/github-terraform-semantic-release-config"
}
```

## Configuration

See each [plugin](#plugins) documentation for required installation and configuration steps.
