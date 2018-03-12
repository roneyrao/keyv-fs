const EventEmitter = require('events');
const join = require('path').join;
const localFs = require('fs');
const rimraf = require('rimraf');
const pify = require('pify');

const rimrafPified = pify(rimraf);

class KeyvFs extends EventEmitter {
	constructor(fs, rootDir, clean) {
		super();
		this.folder = null;
		this.namespaceLength = 0;

		if (fs) {
			if (!fs.lstat) {
				if (fs.stat) {
					fs.lstat = fs.stat;
				} else {
					this.throwError('method stat/lstat is required');
				}
			}
		} else {
			fs = localFs;
		}

		if (rootDir) {
			if (!fs.existsSync(rootDir)) {
					this.throwError('rootDir directory doesn\'t exist, ' + rootDir);
			}
		} else {
			rootDir = process.cwd();
		}

		const apiRs = fs.lstat('/abc', () => {});
		if (!apiRs || (typeof apiRs.then) !== 'function') {
			['lstat', 'readFile', 'writeFile', 'unlink', 'rmdir', 'mkdir'].forEach(method => {
				if (!fs[method]) {
					this.throwError('file system doesn\'t support method - ' + method);
				}
				fs[method] = pify(fs[method].bind(fs));
			});
		}

		this.rootDir = rootDir;
		this.fs = fs;
		this.clean = clean; // Clear existing folder
	}

	throwError(msg) {
		throw new Error('keyv-fs - ' + msg);
	}

	createMeta() {
		return Promise.resolve().then(() => {
			this.meta = {};
			return this.fs.writeFile(this.metaFilePath, '{}');
		});
	}

	updateMetaFile() {
		return Promise.resolve().then(() => {
			return this.fs.writeFile(this.metaFilePath, JSON.stringify(this.meta));
		});
	}

	checkFolder() { // This can be prevented if `keyv` exposes its namespace at initialization.
		return Promise.resolve().then(() => {
			if (this.folder) {
				return;
			}
			this.namespaceLength = this.namespace.length + 1;
			this.folder = join(this.rootDir, this.namespace);
			this.metaFilePath = join(this.folder, '.meta');
			this.meta = {};
			return this.fs.lstat(this.folder).then(() => {
				return this.fs.lstat(this.metaFilePath)
					.then(() => {
						if (this.clean) {
							return this.clear();
						}
						return this.fs.readFile(this.metaFilePath).then(ctn => {
							if (ctn) {
								this.meta = JSON.parse(ctn);
							} else {
								this.meta = {};
							}
						});
					}, () => {
						return this.createMeta();
					});
			}, () => {
				return this.fs.mkdir(this.folder).then(() => {
					return this.createMeta();
				});
			});
		});
	}

	generateFilename() {
		return new Date().valueOf().toString(16) + Math.random().toString(16).substr(2, 4);
	}

	getFilePath(key) {
		const filepath = key.substr(this.namespaceLength);
		let filename;
		if (Object.prototype.hasOwnProperty.call(this.meta, filepath)) {
			filename = this.meta[filepath];
		} else {
			filename = this.generateFilename();
			this.meta[filepath] = filename;
			this.updateMetaFile();
		}
		return join(this.folder, filename);
	}

	deletePath(filepath) {
		return Promise.resolve().then(() => {
			if (Object.prototype.hasOwnProperty.call(this.meta, filepath)) {
				delete this.meta[filepath];
				return this.updateMetaFile();
			}
		});
	}

	clearPaths() {
		this.meta = {};
		return this.updateMetaFile();
	}

	get(key) {
		return this.checkFolder().then(() => {
			const filepath = this.getFilePath(key);
			return this.fs.readFile(filepath).then(buf => buf.toString(), () => undefined);
		});
	}

	set(key, value) {
		return this.checkFolder().then(() => {
			const filepath = this.getFilePath(key);
			return this.fs.writeFile(filepath, value);
		});
	}

	delete(key) {
		return this.checkFolder()
			.then(() => {
				const filepath = this.getFilePath(key);
				return this.deletePath(filepath)
					.then(() => {
						return this.fs.unlink(filepath).then(() => true, () => false);
					});
			});
	}

	clear() {
		return this.checkFolder()
			.then(() => {
				return rimrafPified(this.folder, this.fs);
			})
			.then(() => {
				return this.fs.lstat(this.folder);
			})
			.then(() => {}, () => this.fs.mkdir(this.folder));
	}
}

module.exports = KeyvFs;
