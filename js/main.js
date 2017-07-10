var camera, scene, renderer, mainObject, standardMaterial, startTime, spotLight, spotLight2, cameraTarget;
var lastFrame = null;
init();


function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    // renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;

    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // planeMaterial = new THREE.MeshStandardMaterial( {color:0xFFFFFF, roughness:1, metalness:0.6} );
    standardMaterial = new THREE.MeshPhongMaterial( {color:0x80FFB7, shading:THREE.FlatShading, dithering:false} );
    planeMaterial = new THREE.MeshPhongMaterial( {color:0xF49CD2, shading:THREE.FlatShading, dithering:false} );

    scene = new THREE.Scene();
    startTime = performance.now();

    // var hemisphereLight = new THREE.HemisphereLight( 0xFFFFFF, 0xFFFFFF, 0.6 );
    // scene.add( hemisphereLight );

    spotLight = new THREE.SpotLight(0xFFFFFF,0.6, 300, toRadians(60), 0.7,0.1);
    spotLight.position.x = -24.8;
    spotLight.position.z = -24.8;
    spotLight.position.y = 32;
    spotLight.target.position.set(0,0,0);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 4096;
    spotLight.shadow.mapSize.height = 4096;
    spotLight.shadow.camera.near = 25;
    spotLight.shadow.camera.far = 150;

    scene.add(spotLight);
    scene.add(spotLight.target);

    var helper = new THREE.CameraHelper( spotLight.shadow.camera );
    // scene.add( helper );

    var lightHelper = new THREE.SpotLightHelper( spotLight );
    // scene.add( lightHelper );

    spotLight2 = new THREE.SpotLight(0xFFFFFF,0.4,20, toRadians(180), 0.3, 0);
    spotLight2.position.z = -24.4;
    spotLight2.position.y = -12;
    // scene.add(spotLight2);
    spotLight2.target.position.set(0,0,0);
    scene.add(spotLight2.target);

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(8000,8000), planeMaterial);
    plane.position.y = -8;
    plane.rotation.x =toRadians(-90);

    plane.receiveShadow = true;

    scene.add(plane);


    document.getElementById("canvas_wrapper").appendChild( renderer.domElement );
    addMouseHandler(renderer.domElement);

    camera.position.z = -16 ;

    cameraTarget = new THREE.Vector3(0,0,0)
    camera.lookAt(cameraTarget);


    placeMainObject();
}

function placeMainObject(){
    var jsonLoader = new THREE.JSONLoader();

// load a resource
    jsonLoader.load(

        // resource URL
            './models/ananas.json',

            // Function when resource is loaded
            function ( geometry, materials ) {
                var material = materials[ 0 ];
                var bufferGeometry = new THREE.BufferGeometry();
                bufferGeometry.fromGeometry(geometry);
                mainObject = new THREE.Mesh( bufferGeometry, standardMaterial);

                mainObject.castShadow = true;


                scene.add( mainObject );
                animate();

            }
        );
    }

function determineColour(offset){
    // var colors = [0x4E1559, 0x618897, 0x4A5825, 0x73492C, 0x77745D];
    var colors = [0x994AC0, 0x82D6A5, 0x6017A5, 0xA791EF, 0xBC56C2, 0x4EA54D];
    var totalTimePassed = ((performance.now() - startTime)/100) + offset;
    var colourDuration = 30;
    var currentColourIndex = Math.floor((totalTimePassed/colourDuration))%(colors.length-1);
    var currentColour = new THREE.Color(colors[currentColourIndex]);
    var nextColour = new THREE.Color(colors[(currentColourIndex +1)%(colors.length-1)]);
    var alpha = (totalTimePassed%colourDuration)/colourDuration;
    return currentColour.lerp(nextColour, alpha);
}

function animate() {
    requestAnimationFrame( animate );
    update();
}

function update() {
    var timePassed = getTimeSinceLastFrame();
    var animationConstant = timePassed/100 ;
    renderer.render( scene, camera );
}

var mouseDown = false,
    mouseX = 0,
    mouseY = 0,
    dragMoveX = 0,
    mouseTween = null,
    lastMoveEvent = null;

function getTimeSinceLastMoveEvent() {
    if (lastMoveEvent === null) {
        lastMoveEvent = performance.now();
    }

    var timePassed = performance.now() - lastMoveEvent;
    lastMoveEvent = performance.now();
    return timePassed;
}

function onMouseMove(evt) {
    if (!mouseDown) {
        return;
    }
        var timePassed = getTimeSinceLastMoveEvent();
        evt.preventDefault();
        var deltaX = evt.clientX - mouseX,
            deltaY = evt.clientY - mouseY;
        mouseX = evt.clientX;
        mouseY = evt.clientY;
        if (timePassed != 0) {
            dragMoveX = (deltaX / timePassed) / 100;
        }
        rotateMainObject(deltaX / 100);

}

function onMouseDown(evt) {
    evt.preventDefault();
    if(mouseTween != null){
        mouseTween.kill();
    }
    dragMoveX = 0;
    mouseDown = true;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}

function onMouseUp(evt) {
    evt.preventDefault();
    mouseTween = TweenMax.to(window, 4, {dragMoveX:0, ease: Power2.easeOut, onUpdate: rotateMainObjectByTween});
    mouseDown = false;


}function onTouchMove(evt) {
    if (!mouseDown) {
        return;
    }
    var timePassed = getTimeSinceLastMoveEvent();
    evt.preventDefault();
    var deltaX = evt.touches[0].clientX - mouseX,
        deltaY = evt.touches[0].clientY - mouseY;
    mouseX = evt.touches[0].clientX;
    mouseY = evt.touches[0].clientY;
    if(timePassed != 0) {
        dragMoveX = (deltaX / timePassed)/40;
    }
    rotateMainObject(deltaX/100);
}

function onTouchStart(evt) {
    evt.preventDefault();
    if(mouseTween != null){
        mouseTween.kill();
    }
    dragMoveX = 0;
    mouseDown = true;
    mouseX = evt.touches[0].clientX;
    mouseY = evt.touches[0].clientY;
}

function onTouchEnd(evt) {
    evt.preventDefault();
    mouseTween = TweenMax.to(window, 4, {dragMoveX:0, ease: Power2.easeOut, onUpdate: rotateMainObjectByTween});
    mouseDown = false;
}

function addMouseHandler(canvas_wrapper) {
    canvas_wrapper.addEventListener('mousemove', function (e) {
        onMouseMove(e);
    }, false);
    canvas_wrapper.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    }, false);
    canvas_wrapper.addEventListener('mouseup', function (e) {
        onMouseUp(e);
    }, false);
    canvas_wrapper.addEventListener('mouseout', function (e) {
        onMouseUp(e);
    }, false);
    canvas_wrapper.addEventListener('touchmove', function (e) {
        onTouchMove(e);
    }, false);
    canvas_wrapper.addEventListener('touchstart', function (e) {
        onTouchStart(e);
    }, false);
    canvas_wrapper.addEventListener('touchend', function (e) {
        onTouchEnd(e);
    }, false);
}

function rotateMainObject(amount) {
    mainObject.rotation.y += amount;
}
function rotateMainObjectByTween(){
    mainObject.rotation.y += dragMoveX;
}

function toRadians(deg){
    return deg*(Math.PI/180)
}

function getTimeSinceLastFrame(){
    var currentTime = performance.now();
    if(lastFrame === null){
        lastFrame = currentTime;
    }
    var timePassed = currentTime - lastFrame;
    lastFrame = currentTime;
    return timePassed
}

window.onresize = function(event){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

