module.exports = function(grunt){

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    var files = [
    	'js/gallery.slide.js', 
    	'js/gallery.image.js', 
    	'js/gallery.iframe.js', 
    	'js/gallery.nav.js', 
    	'js/gallery.thumbnails.js', 
    	'js/gallery.viewer.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        tag: {
            banner: '/*! <%= pkg.name %> v<%= pkg.version %> | (c) <%= grunt.template.today(\'yyyy\') %> Kaspars Bulins http://webit.lv */\n',
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                commit: false,
                push: false,
                createTag: false
            }
        },
        uglify: {
		    build: {
		        files: {
		            'build/gallery.min.js': files
		        },
                options: {
                    banner: '<%= tag.banner %>'
                }
		    }
		},
		concat: {
		  	js: {
		    	src: files,
		    	dest: 'build/gallery.js'
		    }
		},
        copy: {
            js: {
                src: 'build/gallery.min.js', 
                dest: 'build/gallery.min-<%= pkg.version %>.js'
            }
        },
        clean: {
        	build: ['build/*']
        },
        watch: {
            js: {
                files: files,
                tasks: ['concat']
            }
        }
    });

    grunt.registerTask('default', ['watch']);
    // Veidojam konkatenēto versiju, minimizēto un ar versijas numuru faila vārdā
    grunt.registerTask('build', ['bump', 'clean:build', 'concat', 'uglify', 'copy:js']);
};