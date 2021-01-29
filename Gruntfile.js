'use strict';

module.exports = function (grunt) {

    var config = {
        clean: {
            options: {
                force: true
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            }
        },
        copy: {},
        less: {},
        usemin: {},
        htmlmin: {},
        requirejs: {},
        uglify: {},
        replace: {
            bustCache: {
                src: ['dist/**/*.{js,html}'],
                overwrite: true,
                replacements: [{
                    from: '__BUST_CACHE__',
                    to: 'rev=' + Date.now()
                }]
            },
            buildNumber: {
                src: ['dist/main/main.js'],
                overwrite: true,
                replacements: [{
                    from: '_DOCDOKUPLM_BUILD_NUMBER_',
                    to: require('./package.json').version
                }]
            }
        }
    };

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt);
    grunt.loadNpmTasks('grunt-text-replace');

    function initModule(module) {
        module.loadConf(config, grunt);
        module.loadTasks(grunt);
        return module;
    }

    initModule(require('./grunt/dev/server-front'));
    initModule(require('./grunt/dev/tests'));
    initModule(require('./grunt/dev/jshint'));
    initModule(require('./grunt/tasks/copy'));
    initModule(require('./grunt/tasks/build'));

    initModule(require('./grunt/modules/account-management'));
    initModule(require('./grunt/modules/change-management'));
    initModule(require('./grunt/modules/document-management'));
    initModule(require('./grunt/modules/documents'));
    initModule(require('./grunt/modules/download'));
    initModule(require('./grunt/modules/main'));
    initModule(require('./grunt/modules/parts'));
    initModule(require('./grunt/modules/product-management'));
    initModule(require('./grunt/modules/product-structure'));
    initModule(require('./grunt/modules/visualization'));
    initModule(require('./grunt/modules/workspace-management'));
    initModule(require('./grunt/modules/organization-management'));

    grunt.initConfig(config);

    grunt.registerTask('default', ['jshint', 'build']);

}
;
