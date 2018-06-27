# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

> **Types of changes**:
>
> - 🎉 **Added**: for new features.
> - ✏️ **Changed**: for changes in existing functionality.
> - ⚠️ **Deprecated**: for soon-to-be removed features.
> - ❌ **Removed**: for now removed features.
> - 🐛 **Fixed**: for any bug fixes.
> - 👾 **Security**: in case of vulnerabilities.

## [Unreleased]

## [0.3.0] - 2018-6-27

### 🐛 Fixed

- Important bug added in last release.

## [0.2.0] - 2018-6-27

### ✏️ Changed

- The `app.start` method of the package [`app`](packages/hume-app) now accepts multiple paths in the first argument.

## [0.1.0] - 2018-6-26

### 🐛 Fixed

- Fix a regression in the logger.
- Use SemVer properly to make @abdonrd happy.

## [0.0.2] - 2018-6-26

### 🎉 Added

- Firewall support, allowed options [here](packages/hume-app#appstartpath-opts---null).

### ✏️ Changed

- Using [Elastic APM](https://www.elastic.co/solutions/apm) instead of "monit-express".
- Using native LoopBack way to get the current user ID:
  - [Example](https://github.com/IBMResearch/hume/blob/master/example/server/models/cat.js#L27)
  - [`utils.lb.addUserId`](https://github.com/IBMResearch/hume/tree/master/packages/hume-utils#async-lbadduseridmodel---null)
- Using pino instead Bunyan due to [performance reasons](https://medium.com/@nearform/the-cost-of-logging-9faa11fd053).

## [0.0.1] - 2018-6-18

### 🎉 Added

- HTTP app abstraction.
- Websockect app abstraction.
- DB support.
- Cache support.
- Logging support.
- Code reuse, specially models.
- Basic HTTP security.
- Helpers: util, HTTP, testing.
- Initial Bluemix integration.
- Monitoring: [jLocke](https://github.com/IBMResearch/jlocke) moved here as [express-monit](packages/hume-express-monit)

[unreleased]: https://github.com/IBMResearch/hume/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/IBMResearch/hume/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/IBMResearch/hume/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/IBMResearch/hume/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/IBMResearch/hume/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/IBMResearch/hume/compare/40ae2fa5b031c2c3edd9981503f2cc7b08eb8d28...v0.0.1
