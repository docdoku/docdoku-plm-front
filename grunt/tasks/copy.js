var moduleName = 'copy';

module.exports = {

    name: moduleName,

    loadConf: function (config, grunt) {

        config.copy.libs = {
            files: [
                {
                    expand: true,
                    dot: false,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        'bower_components/requirejs/require.js',
                        'bower_components/modernizr/modernizr.js',
                        'bower_components/jquery/jquery.min.*',
                        'bower_components/underscore/underscore-min.js',
                        'bower_components/threejs/index.js',
                        'bower_components/tweenjs/src/Tween.js',
                        'bower_components/bootstrap/docs/assets/js/bootstrap.min.js',
                        'bower_components/backbone/backbone-min.js',
                        'bower_components/oidc-client/dist/oidc-client.min.js',
                        'bower_components/fontawesome/fonts/*'
                    ]
                }
            ]
        };
        config.copy.properties = {
            files: [
                {
                    expand: true,
                    dot: false,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        'webapp.properties.json',
                    ]
                }
            ]
        };


        config.copy.assets = {
            files: [
                {
                    expand: true,
                    dot: false,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        'callback.html',
                        'css/**',
                        'images/**',
                        'sounds/**',
                        'js/home/main.js',
                        'js/lib/plugin-detect.js',
                        'js/lib/empty.pdf',
                        'js/lib/helvetiker_regular.typeface.json'
                    ]
                }, {
                    expand: true,
                    dot: false,
                    cwd: 'app/bower_components/bootstrap/',
                    dest: 'dist',
                    src: [
                        'img/*'
                    ]
                }
            ]
        };

        config.copy.dmu = {
            files: [
                {
                    expand: true,
                    dot: false,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        'product-structure/js/workers/*',
                        'js/dmu/**'
                    ]
                }
            ]
        };

        config.copy.i18n = {
            files: [
                {
                    expand: true,
                    dot: false,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        'js/localization/nls/*',
                        'js/localization/nls/fr/*',
                        'js/localization/nls/es/*'
                    ]
                }
            ]
        };
    },

    loadTasks: function (grunt) {
    }

};
