const path = require('path');
const Fs = require('memory-fs');
const test = require('ava');
const keyvTestSuite = require('@keyv/test-suite').default;
const Keyv = require('keyv');
const KeyvFs = require('../src');

const root = path.resolve(__dirname, '__downloaded__');

const store = () => {
	const fs = new Fs();
	fs.mkdirpSync(root);
	return new KeyvFs(fs, root, true);
};
keyvTestSuite(test, Keyv, store);
