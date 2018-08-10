/*global $,require,window,_*/
var App = {};

require.config({

    urlArgs:'__BUST_CACHE__',

    baseUrl: '../product-structure/js',

    shim: {
        jqueryUI: { deps: ['jquery'], exports: 'jQuery' },
        bootstrap: { deps: ['jquery', 'jqueryUI'], exports: 'jQuery' },
        backbone: {deps: ['underscore', 'jquery'], exports: 'Backbone'}
    },
    paths: {
        jquery: '../../bower_components/jquery/jquery',
        jqueryUI: '../../bower_components/jqueryui/ui/jquery-ui',
        backbone: '../../bower_components/backbone/backbone',
        bootstrap:'../../bower_components/bootstrap/docs/assets/js/bootstrap',
        underscore: '../../bower_components/underscore/underscore',
        mustache: '../../bower_components/mustache/mustache',
        text: '../../bower_components/requirejs-text/text',
        i18n: '../../bower_components/requirejs-i18n/i18n',
        threecore: '../../bower_components/threejs/index',
        async: '../../bower_components/async/lib/async',
        tween:'../../bower_components/tweenjs/src/Tween',
        date:'../../bower_components/date.format/date.format',
        dat:'../../bower_components/dat.gui/dat.gui',
        localization: '../../js/localization',
        moment:'../../bower_components/moment/min/moment-with-locales',
        momentTimeZone:'../../bower_components/moment-timezone/builds/moment-timezone-with-data',
        'common-objects': '../../js/common-objects',
        transformcontrols: '../../js/dmu/controls/TransformControls',
        pointerlockcontrols: '../../js/dmu/controls/PointerLockControls',
        trackballcontrols: '../../js/dmu/controls/TrackballControls',
        orbitcontrols: '../../js/dmu/controls/OrbitControls',
        buffergeometryutils: '../../js/dmu/utils/BufferGeometryUtils',
        objloader: '../../js/dmu/loaders/OBJLoader',
        mtlloader: '../../js/dmu/loaders/MTLLoader',
        stats:'../../js/dmu/utils/Stats',
        utilsprototype:'../../js/utils/utils.prototype',
        jwt_decode: '../../bower_components/jwt-decode/build/jwt-decode'
    },

    deps: [
        'stats',
        'dat',
        'utilsprototype',
        'bootstrap'
    ],
    config: {
        i18n: {
            locale: (function(){
	            'use strict';
                try{
                    return window.localStorage.locale || 'en';
                }catch(ex){
                    return 'en';
                }
            })()
        }
    }
});

require(['common-objects/contextResolver','i18n!localization/nls/common','i18n!localization/nls/product-structure', 'common-objects/views/error'],
function (ContextResolver,  commonStrings, productStructureStrings, ErrorView) {

    'use strict';
    App.config.i18n = _.extend(commonStrings,productStructureStrings);

    App.config.workspaceId = decodeURIComponent(/^#(product|assembly)\/([^\/]+)/.exec(window.location.hash)[2]).trim() || null;
    App.config.productId = decodeURIComponent(window.location.hash.split('/')[2]).trim() || null;

    if (!App.config.workspaceId) {
        new ErrorView({el: '#content'})
            .renderWorkspaceSelection(ContextResolver.resolveServerProperties('..')
                .then(ContextResolver.resolveWorkspaces));
        return;
    }

    App.WorkerManagedValues = {
        maxInstances: 500,
        maxAngle: Math.PI / 4,
        maxDist: 100000,
        minProjectedSize: 0.000001,//100,
        distanceRating: 0.6,//0.7,
        angleRating: 0.4,//0.6,//0.5,
        volRating: 1.0//0.7
    };

    App.SceneOptions = {
        grid: false,
        zoomSpeed: 1.2,
        rotateSpeed: 1.0,
        panSpeed: 0.3,
        cameraNear: 1,
        cameraFar: 5E4,
        defaultCameraPosition: {x: -1000, y: 800, z: 1100},
        defaultTargetPosition: {x: 0, y: 0, z: 0},
        ambientLightColor:0xffffff,
        cameraLight1Color:0xbcbcbc,
        cameraLight2Color:0xffffff,
        transformControls:false
    };

    ContextResolver.resolveServerProperties('..')
        .then(ContextResolver.resolveAccount)
        .then(ContextResolver.resolveWorkspaces)
        .then(ContextResolver.resolveGroups)
        .then(ContextResolver.resolveUser)
        .then(function(){
            require(['backbone', 'frameRouter', 'dmu/SceneManager','dmu/InstancesManager'],function(Backbone,  Router,SceneManager,InstancesManager){
                App.$SceneContainer = $('div#frameWorkspace');
                App.instancesManager = new InstancesManager();
                App.sceneManager = new SceneManager();
                App.sceneManager.init();
                App.router = Router.getInstance();
                Backbone.history.start();
            });
        },function(xhr){
            new ErrorView({el:'#content'}).renderError(xhr);
        });
});
