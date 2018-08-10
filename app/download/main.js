/*global _,require,window*/

var App = {};

require.config({

    urlArgs: '__BUST_CACHE__',

    baseUrl: 'js',

    shim: {
        jqueryUI: {deps: ['jquery'], exports: 'jQuery'},
        bootstrap: {deps: ['jquery', 'jqueryUI'], exports: 'jQuery'},
        backbone: {deps: ['underscore', 'jquery'], exports: 'Backbone'}
    },

    paths: {
        jquery: '../../bower_components/jquery/jquery',
        jqueryUI: '../../bower_components/jqueryui/ui/jquery-ui',
        backbone: '../../bower_components/backbone/backbone',
        underscore: '../../bower_components/underscore/underscore',
        mustache: '../../bower_components/mustache/mustache',
        text: '../../bower_components/requirejs-text/text',
        i18n: '../../bower_components/requirejs-i18n/i18n',
        bootstrap: '../../bower_components/bootstrap/docs/assets/js/bootstrap',
        'common-objects': '../../js/common-objects',
        localization: '../../js/localization',
        jwt_decode: '../../bower_components/jwt-decode/build/jwt-decode',
        moment: '../../bower_components/moment/min/moment-with-locales',
        momentTimeZone: '../../bower_components/moment-timezone/builds/moment-timezone-with-data'
    },

    deps: [
        'jquery',
        'underscore',
        'bootstrap',
        'jqueryUI'
    ],
    config: {
        i18n: {
            locale: (function () {
                'use strict';
                try {
                    return window.localStorage.locale || 'en';
                } catch (ex) {
                    return 'en';
                }
            })()
        }
    }
});

require(['common-objects/contextResolver', 'i18n!localization/nls/common', 'i18n!localization/nls/download'],
    function (ContextResolver, commonStrings, downloadStrings) {

        'use strict';

        App.config.i18n = _.extend(commonStrings, downloadStrings);

        var load = function () {
            require(['backbone', 'app', 'common-objects/views/header'], function (Backbone, AppView, HeaderView) {
                App.appView = new AppView().render();
                App.headerView = new HeaderView().render();
            });
        };

        ContextResolver.resolveServerProperties('..')
            //.then(ContextResolver.resolveAccount)
            .then(load);

    });

