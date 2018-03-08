# keyv-fs

[![NPM Version](http://img.shields.io/npm/v/keyv-fs.svg?style=flat)](https://www.npmjs.org/package/keyv-fs)
[![Build Status](https://travis-ci.org/roneyrao/keyv-fs.svg?branch=master)](https://travis-ci.org/roneyrao/keyv-fs)
[![codecov](https://codecov.io/gh/roneyrao/keyv-fs/branch/master/graph/badge.svg)](https://codecov.io/gh/roneyrao/keyv-fs)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/roneyrao/keyv-fs/master/LICENSE)

Filesystem storage adapter for [Keyv](https://github.com/lukechilds/keyv). Especially useful for browser cache.

## Install

```shell
npm install keyv-fs
```

## Usage

```js
const Keyv = require('keyv');
const KeyvFs = require('keyv-fs');

const fsStore = new KeyvFs();
const keyv = new Keyv({ store: redis });
```

## Api

```
new KeyvFs(fs, rootDir, clean)
```

* fs: custom file system, such as [memory-fs](https://github.com/webpack/memory-fs), if omited, local file system is implied.

* rootDir: directory where cache folder is placed, `process.cwd()` is by default. Cache folder is named with keyvs namespace.

* clean: whether to clear the cache folder when startup, false by default.


## License

[MIT](LICENSE).

