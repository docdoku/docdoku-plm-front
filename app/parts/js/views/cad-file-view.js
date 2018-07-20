/*global define,App,requestAnimationFrame*/
define([
    'threecore',
    'reflector',
    'orbitcontrols',
    'objloader',
    'mtlloader',
    'backbone',
    'mustache',
    'text!templates/cad-file.html'
], function (THREE, Reflector, Controls, OBJLoader, MTLLoader, Backbone, Mustache, template) {

    'use strict';

    var width, height, control;
    var camera, scene, renderer, dirLight, hemiLight;
    var clock = new THREE.Clock();
    var $container;
    var needsRedraw = false;

    var CADFileView = Backbone.View.extend({

        id: 'cad-file-view',

        resize: function () {
            // setTimeout(this.handleResize.bind(this), 50);
        },

        render: function (nativeCADFile, fileName, uuid, resourceToken) {

            var options = [];

            if (uuid) {
                options.push('uuid=' + uuid);
            }

            if (resourceToken) {
                options.push('token=' + resourceToken);
            }

            if (options.length) {
                fileName += '?' + options.join('&');
                nativeCADFile += '?' + options.join('&');
            }

            this.$el.html(Mustache.render(template, {
                i18n: App.config.i18n,
                contextPath: App.config.contextPath,
                nativeCADFile: nativeCADFile
            }));

            $container = this.$('#cad-file');

            function calculateWith() {
               return $container.innerWidth();
            }

            function calculateHeight() {
                return Math.round(window.innerHeight * 0.6);
            }

            function handleResize() {
                width = calculateWith();
                height = calculateHeight();
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                control.handleResize();
                needsRedraw = true;
            }

            function render() {
                scene.updateMatrixWorld();
                renderer.render(scene, camera);
            }

            function animate() {
                requestAnimationFrame(animate);
                if (needsRedraw) {
                    control.update(clock.getDelta());
                    render();
                    needsRedraw = false;
                }
            }

            function onControlChange(){
                needsRedraw = true;
            }

            function initScene(size, position) {

                var far = size * 20;
                var fogFar = size * 10;
                var boxSize = size * 8;

                camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, far);
                camera.position.set(0, 0, 250);

                scene = new THREE.Scene();
                scene.background = new THREE.Color().setHSL(0.6, 0, 1);
                scene.fog = new THREE.Fog(scene.background, 1, fogFar);


                // CONTROLS

                control = new Controls(camera, $container[0]);
                control.enabled = true;
                control.bindEvents();
                control.maxPolarAngle = Math.PI / 2;
                control.minDistance = 1;
                control.addEventListener('change', onControlChange);


                // LIGHTS

                hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
                hemiLight.color.setHSL(0.6, 1, 0.6);
                hemiLight.groundColor.setHSL(0.095, 1, 0.75);
                hemiLight.position.set(0, 50, 0);
                scene.add(hemiLight);

                dirLight = new THREE.DirectionalLight(0xffffff, 1);
                dirLight.color.setHSL(0.1, 1, 0.95);
                dirLight.position.set(-1, 1.75, 1);
                dirLight.position.multiplyScalar(30);
                scene.add(dirLight);
                dirLight.castShadow = true;
                dirLight.shadow.mapSize.width = 2048;
                dirLight.shadow.mapSize.height = 2048;
                var d = 50;
                dirLight.shadow.camera.left = -d;
                dirLight.shadow.camera.right = d;
                dirLight.shadow.camera.top = d;
                dirLight.shadow.camera.bottom = -d;
                dirLight.shadow.camera.far = far;
                dirLight.shadow.bias = -0.0001;

                var loader = new THREE.TextureLoader();
                var texture = loader.load(App.config.contextPath + 'images/floor.jpg');
                var container = new THREE.Object3D();
                var geometry = new THREE.CircleBufferGeometry(boxSize, 32);
                var groundMirror = new Reflector(geometry, {
                    clipBias: 0.003,
                    textureWidth: 2048,
                    textureHeight: 2048,
                    color: 0x777777,
                    recursion: 1
                });
                var material = new THREE.MeshPhongMaterial({opacity: 0.75, transparent: true, map: texture});
                var groundSurface = new THREE.Mesh(geometry, material);

                groundSurface.rotateX(-Math.PI / 2);
                groundMirror.rotateX(-Math.PI / 2);

                groundMirror.position.y -= 0.2;

                container.add(groundMirror);
                container.add(groundSurface);

                scene.add(container);
                container.position.copy(position);

                // SKYDOME
                var vertexShader = 'varying vec3 vWorldPosition;\n' +
                    'void main() {\n' +
                    '    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n' +
                    '    vWorldPosition = worldPosition.xyz;\n' +
                    '    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
                    '}';

                var fragmentShader = 'uniform vec3 topColor;\n' +
                    'uniform vec3 bottomColor;\n' +
                    'uniform float offset;\n' +
                    'uniform float exponent;\n' +
                    'varying vec3 vWorldPosition;\n' +
                    'void main() {\n' +
                    '      float h = normalize( vWorldPosition + offset ).y;\n' +
                    '      gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );\n' +
                    '}\n';

                var uniforms = {
                    topColor: {value: new THREE.Color(0x0077ff)},
                    bottomColor: {value: new THREE.Color(0xffffff)},
                    offset: {value: 33},
                    exponent: {value: 0.6}
                };

                uniforms.topColor.value.copy(hemiLight.color);

                scene.fog.color.copy(uniforms.bottomColor.value);

                var skyGeo = new THREE.SphereGeometry(boxSize, 32, 15);
                var skyMat = new THREE.ShaderMaterial({
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    uniforms: uniforms,
                    side: THREE.BackSide
                });
                var sky = new THREE.Mesh(skyGeo, skyMat);
                sky.position.copy(position);
                scene.add(sky);

                // RENDERER
                renderer = new THREE.WebGLRenderer({antialias: true});
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(width, height);
                $container.append(renderer.domElement);
                renderer.gammaInput = true;
                renderer.gammaOutput = true;
                renderer.shadowMap.enabled = true;

                window.addEventListener('resize', handleResize, false);
                handleResize();
                animate();
            }


            width = calculateWith();
            height = calculateHeight();

            this.handleResize = handleResize;


            function centerOn(point, distance) {
                camera.position.set(point.x + distance, point.y, point.z + distance);
                control.target.copy(point);
                needsRedraw = true;
            }

            function onMaterials(materials) {

                var objLoader = new OBJLoader();

                if (materials && typeof materials.preload === 'function') {
                    materials.preload();
                    objLoader.setMaterials(materials);
                }

                objLoader.load(fileName, function (object) {

                    var bBoxHelper = new THREE.BoxHelper(object, 0xff0000);
                    bBoxHelper.update();
                    bBoxHelper.geometry.computeBoundingBox();
                    var radius = bBoxHelper.geometry.boundingSphere.radius;
                    var size = radius * 3;
                    var box = bBoxHelper.geometry.boundingBox;
                    var center = box.getCenter().clone();
                    var centerBottom = center.clone();
                    centerBottom.y = box.min.y;
                    initScene(size, centerBottom);
                    control.maxDistance = size * 2;
                    camera.updateProjectionMatrix();
                    centerBottom.y = box.min.y;
                    scene.add(object);
                    object.castShadow = true;
                    object.receiveShadow = true;
                    centerOn(center, size * 0.75);
                    handleResize();

                }, null, null);


            }

            var texturePath = fileName.substring(0, fileName.lastIndexOf('/') + 1);
            var split = fileName.split('?');
            var fileShortName = split[0].substr(texturePath.length, split[0].length);
            var mtlFile = fileShortName.substr(0, fileShortName.lastIndexOf('.')) + '.mtl';

            var mtlLoader = new MTLLoader(resourceToken);
            mtlLoader.setPath(texturePath + 'attachedfiles/');
            mtlLoader.load(mtlFile, onMaterials, null, onMaterials);

            return this;
        }

    });

    return CADFileView;
});

