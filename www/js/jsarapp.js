window.ARThreeOnLoad = function() {
    /**
     * Helper for setting up a Three.js AR scene using the device camera as input.
     */
    ARController.getUserMediaThreeScene({ 
        
        maxARVideoSize: 320, 
        
        cameraParam: 'Data/camera_para_android.dat',
        /**
         * Called on successful initialization with an ThreeARScene object.
         */
        onSuccess: function(arScene, arController) {

            /**
             * ADD CSS CLASS - ORIENTATION - CANVAS STYLE
             */
            document.body.className = arController.orientation;

            /**
             * SET DETECTION MODE - BARCODE AND PATTERN
             */
            arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);

            /**
             * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas.
             * This renderer should be used for browsers that support webGL.
             */
            var renderer = new THREE.WebGLRenderer({antialias: true});
            if (arController.orientation === 'portrait') {
                var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
                var h = window.innerWidth;
                renderer.setSize(w, h);
                renderer.domElement.style.paddingBottom = (w-h) + 'px';
            } else {
                if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
                    renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
                } else {
                    renderer.setSize(arController.videoWidth, arController.videoHeight);
                    document.body.className += ' desktop';
                }
            }

            /**
             * ADD CANVAS TO DOM - BODY FIRST CHILD
             */
            document.body.insertBefore(renderer.domElement, document.body.firstChild);

            /**
             * event.preventDefault() -> Cancels the event if it is cancelable, without stopping further propagation of the event.
             * MEMORIZE CURRENT ROTATION TARGET
             */
            var rotationV = 0;
            var rotationTarget = 0;
            renderer.domElement.addEventListener('click', function(ev) {
                ev.preventDefault();
                rotationTarget += 1;
            }, false);

            /**
             * THREE.JS - SPHERE
             */
            var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(1.0, 8, 8),
                new THREE.MeshNormalMaterial()
            );
            sphere.material.shading = THREE.FlatShading;
            sphere.position.z = 1.0;

            /**
             * THREE.JS - TORUS
             */
            var torus = new THREE.Mesh(
                new THREE.TorusGeometry(0.3*2.5, 0.2*2.0, 8, 8),
                new THREE.MeshNormalMaterial()
            );
            torus.material.shading = THREE.FlatShading;
            torus.position.z = 1.25;
            torus.rotation.x = Math.PI/2;

            /**
             * THREE.JS - CUBE
             */
            var cube = new THREE.Mesh(
                new THREE.BoxGeometry(1,1,1),
                new THREE.MeshNormalMaterial()
            );
            cube.material.shading = THREE.FlatShading;
            cube.position.z = 0.5;

            /**
             * THREE.JS - ICOSAHEDRON
             */
            var icosahedron = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.7, 1, 1),
                new THREE.MeshNormalMaterial()
            );
            icosahedron.material.shading = THREE.FlatShading;
            icosahedron.position.z = 0.7;

            /**
             * THREE.JS - TEXT
             */
            var loader = new THREE.FontLoader();
            loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
                var geometry = new THREE.TextGeometry("FHK", {
                    font: font,
                    size: 1,
                    height: 1,
                    curveSegments: 10
                });
                var material = new THREE.MultiMaterial([
                    new THREE.MeshBasicMaterial( { color: 0xffffff, overdraw: 0.5 } ),
                    new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
                ]);

                var textGeometry = new THREE.Mesh(geometry,material);
                textGeometry.position.z = 0.1;
                textGeometry.position.x = -1.1;
                textGeometry.position.y = -0.5;
                textGeometry.rotation.y = Math.PI * 2;
                textGeometry.rotation.x = 1;
                /**
                 * CREATE NEW PATTERN-MARKER
                 * ADD 3D OBJECT
                 * ADD TO SCENE
                 */
                arController.loadMarker('Data/patt.fhk', function(markerId) {
                    var markerRoot = arController.createThreeMarker(markerId, 1);
                    markerRoot.add(textGeometry);
                    arScene.scene.add(markerRoot);
                });
            } );

            /**
             * CREATE NEW BARCODE-MARKER
             * ADD 3D OBJECT
             * AT TO SCENE
             */
            var markerRoot = arController.createThreeBarcodeMarker(20, 1);
            markerRoot.add(icosahedron);
            arScene.scene.add(markerRoot);

            /**
             * DETECT, RENDERON, CHANGE ON ANIMATION
             */
            var tick = function() {
                /**
                 * Detects markers in the given image. The process method dispatches marker detection events during its run.
                 */
                arScene.process();
                rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
                sphere.rotation.z += rotationV;
                torus.rotation.y += rotationV;
                cube.rotation.z += rotationV;
                icosahedron.rotation.z += rotationV;
                rotationV *= 0.8;
                arScene.renderOn(renderer);
                /**
                 * The window.requestAnimationFrame() method tells the browser that you wish to perform an animation
                 * and requests that the browser call a specified function to update an animation before the next repaint.
                 */
                requestAnimationFrame(tick);
            };
            tick();
        }
    });
    /**
     * Delete Object when finished
     */
    delete window.ARThreeOnLoad
};
/**
 * Fully loaded - start -> ARThreeOnLoad function
 */
if (window.ARController && ARController.getUserMediaThreeScene) {
    ARThreeOnLoad();
}