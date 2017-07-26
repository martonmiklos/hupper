const semver = require('semver');

function getChromeVersion (version) {
	const ver = semver(version);

	if (ver.prerelease.length) {
		const prerelease = ver.prerelease[ver.prerelease.length - 1];
		ver.minor -= 1;

		ver.prerelease = [100 + prerelease];
	}

	return ver.format().replace(/-(\d+)$/, '.$1');
}

function getFirefoxVersion (version) {
	const ver = semver(version);

	if (ver.prerelease.length) {
		const prerelease = ver.prerelease[ver.prerelease.length - 1];

		ver.prerelease = ['beta', prerelease];
	} else {
		ver.prerelease = [];
	}

	return ver.format();
}

module.exports = (grunt) => {
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerMultiTask('manifest', function () {
		const target = this.target;
		const options = this.options({
			beta: false,
		});

		const manifest = grunt.file.readJSON('./manifest.json');
		let { version } = grunt.file.readJSON('./package.json');

		const versionName = version;

		if (typeof options.beta === 'number') {
			switch (options.versioning) {
				case 'chrome':
					version = getChromeVersion(version);
					break;
				case 'firefox':
					version = getFirefoxVersion(version);
					break;
			}

			grunt.verbose.writeln(options.versioning, 'version', version, 'versionName', versionName);
		}

		grunt.file.write(`manifest_${target}.json`, JSON.stringify(Object.assign({}, manifest, {
			version,
			/* eslint-disable camelcase */
			version_name: versionName,
			/* eslint-enable camelcase */
		}), null, '\t'));
	});

	const chromeConfig = {
		transform: [
			[
				'babelify', { presets: [ [
					'env', { targets: { browsers: ['last 5 Chrome versions'] }, },
				], ], },
			],
		],
	};

	const firefoxConfig = {
		transform: [
			[
				'babelify', { presets: [ [
					'env', { targets: { browsers: ['Firefox 52'] }, },
				], ], },
			],
		],
	};

	grunt.initConfig({
		clean: {
			firefox: 'hupper_firefox.zip',
			chrome: 'hupper_chrome.zip',
			manifestBackup: 'manifest.json.bak',
			manifestFirefox: 'manifest_firefox.json',
			manifestChrome: 'manifest_chrome.json',
		},

		copy: {
			icons: {
				files: [{
					'images/icons/009-pen.png': '../icons/IconMoon/009-pen.png'
				}]
			},

			manifestBackup: {
				files: {
					'./manifest.json.bak': './manifest.json',
				},
			},

			manifestChrome: {
				files: {
					'./manifest.json': './manifest_chrome.json',
				},
			},

			manifestFirefox: {
				files: {
					'./manifest.json': './manifest_firefox.json',
				},
			},

			manifestRestore: {
				files: {
					'./manifest.json': './manifest.json.bak',
				},
			},
		},

		browserify: {
			chromeOptions: {
				options: chromeConfig,
				files: { 'options/bundle.js': 'options/main.js', },
			},

			chromeLib: {
				options: chromeConfig,
				files: { 'lib/bundle.js': 'lib/main.js', },
			},

			chromeData: {
				options: chromeConfig,
				files: { 'data/bundle.js': 'data/main.js', },
			},

			firefoxOptions: {
				options: firefoxConfig,
				files: { 'options/bundle.js': 'options/main.js', },
			},

			firefoxLib: {
				options: firefoxConfig,
				files: { 'lib/bundle.js': 'lib/main.js', },
			},

			firefoxData: {
				options: firefoxConfig,
				files: { 'data/bundle.js': 'data/main.js', },
			},
		},

		eslint: {
			options: {
				ignorePattern: 'bundle\\.js',
				configFile: '.eslintrc',
			},
			opts: [ 'options/**/*.js', ],

			lib: [ 'lib/**/*.js', ],

			data: [ 'data/**/*.js', ],

			core: [ 'core/**/*.js', ]
		},

		compress: {
			chrome: {
				options: {
					archive: 'hupper_chrome.zip',
				},
				files: [
					{ src: 'images/icons/*.png', dest: 'images/icons/' },
					{ src: 'data/bundle.js', dest: 'data/', },
					{ src: 'data/core/css/*.css', dest: 'data/core/' },
					{ src: 'lib/bundle.js', dest: 'lib/' },
					{ src: 'options/bundle.js', dest: 'options/' },
					{ src: 'options/*.css', dest: 'options/' },
					{ src: 'options.html', dest: './' },
					{ src: 'manifest.json', dest: './', expand: true },
					{ src: 'icons/128.png', dest: 'icons/' },
					{ src: 'icons/48.png', dest: 'icons/' },
					{ src: 'icons/32.png', dest: 'icons/' },
					{ src: 'icons/16.png', dest: 'icons/' },
				],
			},

			firefox: {
				options: {
					archive: 'hupper_firefox.zip',
				},
				files: [
					{ src: 'images/icons/*.png', dest: 'images/icons/' },
					{ src: 'data/bundle.js', dest: 'data/', },
					{ src: 'data/core/css/*.css', dest: 'data/core/' },
					{ src: 'lib/bundle.js', dest: 'lib/' },
					{ src: 'options/bundle.js', dest: 'options/' },
					{ src: 'options/*.css', dest: 'options/' },
					{ src: 'options.html', dest: './' },
					{ src: 'manifest.json', dest: './', expand: true },
					{ src: 'icons/128.png', dest: 'icons/' },
					{ src: 'icons/48.png', dest: 'icons/' },
					{ src: 'icons/32.png', dest: 'icons/' },
					{ src: 'icons/16.png', dest: 'icons/' },
				],
			},
		},

		manifest: {
			options: {
				beta: 4,
			},
			chrome: {
				options: {
					versioning: 'chrome',
				},
			},

			firefox: {
				options: {
					versioning: 'firefox',
				},
			}
		},

		concurrent: {
			eslint: [
				'eslint:opts',
				'eslint:lib',
				'eslint:data',
				'eslint:core',
			],
			browserifyChrome: [
				'browserify:chromeOptions',
				'browserify:chromeLib',
				'browserify:chromeData',
			],
			browserifyFirefox: [
				'browserify:firefoxOptions',
				'browserify:firefoxLib',
				'browserify:firefoxData',
			],
		},
	});

	grunt.registerTask('firefox', [
		'clean:firefox',
		'concurrent:eslint',
		'concurrent:browserifyFirefox',
		'copy:manifestBackup',
		'manifest:firefox',
		'copy:icons',
		'copy:manifestFirefox',
		'compress:firefox',
		'copy:manifestRestore',
		'clean:manifestFirefox',
		'clean:manifestBackup',
	]);

	grunt.registerTask('chrome', [
		'clean:chrome',
		'concurrent:eslint',
		'concurrent:browserifyChrome',
		'copy:manifestBackup',
		'manifest:chrome',
		'copy:manifestChrome',
		'copy:icons',
		'compress:chrome',
		'copy:manifestRestore',
		'clean:manifestChrome',
		'clean:manifestBackup',
	]);
};
