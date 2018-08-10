/*global _,define,App*/
define(['threecore', 'objloader', 'views/progress_bar_view'], function (THREE, OBJLoader, ProgressBarView) {
    'use strict';
    var LoaderManager = function (options) {
        _.extend(this, options);
        if (this.progressBar) {
            this.listenXHRProgress();
        }
    };

    var defaultMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xff0000)});

    function setShadows(object) {
        if (object instanceof THREE.Object3D) {
            object.traverse(function (o) {
                if (o instanceof THREE.Mesh) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });
        } else if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    }

    function updateMaterial(object) {
        if (object instanceof THREE.Object3D) {
            object.traverse(function (o) {
                if (o instanceof THREE.Mesh && !o.material.name) {
                    o.material = defaultMaterial;
                }
            });
        } else if (object instanceof THREE.Mesh && !object.material.name) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    }

    LoaderManager.prototype = {

        listenXHRProgress: function () {

            // Override xhr open prototype
            var pbv = new ProgressBarView().render();
            var xhrCount = 0;
            var _xhrOpen = XMLHttpRequest.prototype.open;

            XMLHttpRequest.prototype.open = function () {

                // Subscribe only to files requests
                var isGeometryRequest = arguments[1].indexOf(App.config.serverBasePath + 'api/files/') === 0;

                if (isGeometryRequest) {

                    var totalAdded = false,
                        totalLoaded = 0,
                        xhrLength = 0;

                    this.addEventListener('loadstart', function () {
                        xhrCount++;
                    }, false);

                    this.addEventListener('progress', function (pe) {

                        if (xhrLength === 0) {
                            xhrLength = pe.total;
                        }

                        if (totalAdded === false) {
                            pbv.addTotal(xhrLength);
                            totalAdded = true;
                        }

                        pbv.addLoaded(pe.loaded - totalLoaded);
                        totalLoaded = pe.loaded;

                    }, false);

                    this.addEventListener('loadend', function () {
                        xhrCount--;
                        setTimeout(function () {
                            pbv.removeXHRData(xhrLength);
                        }, 20);
                    }, false);
                }

                _xhrOpen.apply(this, arguments);

                // Force server to send the file without compression (custom header)
                if (isGeometryRequest) {
                    this.setRequestHeader('x-accept-encoding', 'identity');
                }

            };
        },


        parseFile: function (filename, texturePath, callbacks) {
            var loader = new OBJLoader();
            loader.load(filename, /* texturePath + '/attachedfiles/',*/ function (object) {
                setShadows(object);
                updateMaterial(object);
                callbacks.success(object);
            });
        }
    };
    return LoaderManager;
});
