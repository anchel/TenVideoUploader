/*global module:false*/
module.exports = function(grunt) {
	grunt.file.defaultEncoding = 'utf8';
	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %>\n * Powered by <%= pkg.author.team%>' + '\n */\n',
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: false
			},
			tenvideouploader_worker: {
                src: [
                    './ftn_html5/util/CommonUtil.js',
                    './ftn_html5/modules/worker/define.js',
                    './ftn_html5/modules/ConstDef.js',
                    './ftn_html5/modules/DataDict.js',
                    './ftn_html5/modules/algorithm/md5-spark.js',
                    './ftn_html5/modules/algorithm/sha1-calculator.js',
                    './ftn_html5/modules/algorithm/sha1-rusha.js',
                    './ftn_html5/modules/worker/alg-main.js',
                    './ftn_html5/modules/worker/upload-main.js'
                ],
                dest: '<%= pkg.cfg.releasePath %>tvu.uploader.worker.js'
            },
			tenvideouploader_all: {
				src: [
					'./core/tvu.intro.js',
					// './lib/tvu.$.extend.js',
					'./base/tvu.util.js',
					'./base/tvu.global.js',
					'./base/tvu.baseconfig.js',
					'./base/tvu.reporter.js',
					'./base/tvu.fileinfo.js',
					'./base/tvu.baseuploader.js',
					'./ftn/tvu.ftnconfig.js',
					'./ftn/tvu.ftnuploader.js',
					
					'./ftn_html5/tvu.ftnhtml5config.js',
					
					'./ftn_html5/util/CommonUtil.js',
					'./ftn_html5/modules/base/namespace.js',
                    './ftn_html5/modules/base/Emitter.js',
                    './ftn_html5/modules/ConstDef.js',
                    './ftn_html5/modules/DataDict.js',
                    './ftn_html5/modules/worker-adapter/workerAdapter.js',
                    './ftn_html5/modules/upload/upload.core.js',

                    './ftn_html5/tvu.ftnhtml5uploader.js',
					
					'./html5/tvu.html5config.js',
					'./html5/tvu.html5uploader.js',
					'./html5/tvu.html5uploader.core.js',
					'./flash/tvu.flashconfig.js',
					'./flash/tvu.flashuploader.js',
					'./core/tvu.queue.js',
					'./core/tvu.uploader.js',
					'./core/tvu.outro.js'
				],
				dest: '<%= pkg.cfg.releasePath %>tvu.uploader.js'
			}
		},
		uglify: {
			options: {
				// report: 'min',
				// report: 'gzip',
				banner: '<%= banner %>'
			},
			tenvideouploader: {
				files: [{
					expand: true,
					cwd: '<%= pkg.cfg.releasePath %>',
					src: ['**/*.js', '!**/*.min.js'],
					dest: '<%= pkg.cfg.releasePath %>',
					ext: '$1.js',
					rename: function(pwd, src) {
						return pwd + src.replace('.js', '');
					}
				}]
			}
		},
		watch: {
			tenvideouploader: {                
				files: ['**/*.js', 'dev.html'],
				tasks: ['dev']
			},
			options: {
				interval: 250
			}
		},
		copy: {
			source: {
				files: [{
					expand: true,
					cwd: '<%= pkg.cfg.releasePath %>',
					src: ['**/*.js'],
					dest: '<%= pkg.cfg.debugPath %>',
					filter: 'isFile'
       			}]
			},
			qzs233: {
				files: [{
					expand: true,
					cwd: '<%= pkg.cfg.debugPath %>',
					src: ['**/*.js'],
					dest: 'V:/tvu/_debug_/ftnh5/',
					filter: 'isFile'
				},{
                    expand: true,
                    cwd: '<%= pkg.cfg.releasePath %>',
                    src: ['**/*.js'],
                    dest: 'V:/tvu/js/ftnh5/',
                    filter: 'isFile'
                }]
			},
			vqq252: {
				files: [{
					expand: true,
					src: ['dev.html'],
					dest: 'O:/tencentvideo_apache/upload/',
					filter: 'isFile'
				}]
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['concat', 'copy:source', 'uglify']);
	grunt.registerTask('dev', ['concat', 'copy']);
	grunt.registerTask('build', ['concat', 'copy:source', 'uglify']);
};