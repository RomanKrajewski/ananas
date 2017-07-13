var camera, scene, renderer,dummy, mainObject, standardMaterial, startTime, spotLight, spotLight2, cameraTarget, wasSplit, wasReflected, rotateAllTween, useShaders;
var lastFrame = null;
var shaderTime = 0;
init();


function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );


    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // planeMaterial = new THREE.MeshStandardMaterial( {color:0xFFFFFF, roughness:1, metalness:0.6} );
    // standardMaterial = new THREE.MeshPhongMaterial( {color:0x80FFB7, shading:THREE.FlatShading, dithering:false} );

    var spongebobMap = new THREE.CubeTextureLoader()
        .setPath( './tex/spongebob/' )
        .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
    spongebobMap.mapping = THREE.CubeRefractionMapping;

    standardMaterial = new THREE.MeshPhongMaterial( {color:0xFFFFFF,shininess:0, shading:THREE.FlatShading, reflectivity:0.0, dithering:false, envMap:spongebobMap} );
    planeMaterial = new THREE.MeshPhongMaterial( {color:0xF49CD2, shading:THREE.FlatShading, dithering:false} );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xF3D0E6 );
    startTime = performance.now();


    spotLight = new THREE.SpotLight(0x80FFB7,0.9, 300, toRadians(20), 1,0);
    spotLight.position.x = -18.8;
    spotLight.position.z = -28.8;
    spotLight.position.y = 20;
    spotLight.target.position.set(0,0,0);

    scene.add(spotLight);
    scene.add(spotLight.target);

    spotLight2 = new THREE.SpotLight(0xf37cbe,1, 300, toRadians(25), 1,0);
    spotLight2.position.x = 16;
    spotLight2.position.z = -2;
    spotLight2.position.y = -4;
    spotLight2.target.position.set(0,4,0);
    scene.add(spotLight2);
    scene.add(spotLight2.target);


    spotLight3 = new THREE.SpotLight(0xB57FFF,0.8, 300, toRadians(25), 1,0);
    spotLight3.position.x = 16;
    spotLight3.position.z = -22;
    spotLight3.position.y = -8;
    spotLight3.target.position.set(0,-9,0);

    scene.add(spotLight3);
    scene.add(spotLight3.target);


    // var helper = new THREE.CameraHelper( spotLight.shadow.camera );
    // scene.add( helper );

    // var lightHelper = new THREE.SpotLightHelper( spotLight );
    // scene.add( lightHelper );


    document.getElementById("canvas_wrapper").appendChild( renderer.domElement );
    addMouseHandler(renderer.domElement);

    camera.position.z = -16 ;

    cameraTarget = new THREE.Vector3(0,0,0)
    camera.lookAt(cameraTarget);


    //Init DAT GUI control panel
    badTVParams = {
        mute:true,
        show: true,
        distortion: 2.5,
        distortion2: 2.5,
        speed: 0.02,
        rollSpeed: 0
    };
    staticParams = {
        show: true,
        amount:0.05,
        size:4.0
    };
    rgbParams = {
        show: true,
        amount: 0.002,
        angle: 20,
    };
    filmParams = {
        show: true,
        count: 800,
        sIntensity: 0.2,
        nIntensity: 0.3
    };



    composer = new THREE.EffectComposer( renderer);
    renderPass = new THREE.RenderPass( scene, camera );
    badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
    rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
    filmPass = new THREE.ShaderPass( THREE.FilmShader );
    staticPass = new THREE.ShaderPass( THREE.StaticShader );
    copyPass = new THREE.ShaderPass( THREE.CopyShader );
    composer.addPass( renderPass );
    composer.addPass( copyPass );
    copyPass.renderToScreen = true;
    document.getElementById("shaderSwitch").addEventListener("click", onToggleShaders);

    filmPass.uniforms.grayscale.value = 0;

    onParamsChange();

    placeMainObject();
}

function onToggleShaders(){
    shaderSwitch = document.getElementById("shaderSwitch");
    useShaders = shaderSwitch.checked;
    composer = new THREE.EffectComposer( renderer);
    composer.addPass( renderPass );
    if(useShaders){
        composer.addPass( filmPass );
        composer.addPass( badTVPass );
        composer.addPass( rgbPass );
        composer.addPass( staticPass );
    }
    composer.addPass( copyPass );
    copyPass.renderToScreen = true;
}

function onParamsChange() {
    //copy gui params into shader uniforms
    badTVPass.uniforms[ 'distortion' ].value = badTVParams.distortion;
    badTVPass.uniforms[ 'distortion2' ].value = badTVParams.distortion2;
    badTVPass.uniforms[ 'speed' ].value = badTVParams.speed;
    badTVPass.uniforms[ 'rollSpeed' ].value = badTVParams.rollSpeed;
    staticPass.uniforms[ 'amount' ].value = staticParams.amount;
    staticPass.uniforms[ 'size' ].value = staticParams.size;
    rgbPass.uniforms[ 'angle' ].value = rgbParams.angle*Math.PI;
    rgbPass.uniforms[ 'amount' ].value = rgbParams.amount;
    filmPass.uniforms[ 'sCount' ].value = filmParams.count;
    filmPass.uniforms[ 'sIntensity' ].value = filmParams.sIntensity;
    filmPass.uniforms[ 'nIntensity' ].value = filmParams.nIntensity;
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
            dummy = new THREE.Mesh(new THREE.CubeGeometry(.001, .001, .001), standardMaterial);
            // dummy = splitUpObject(12, 6);
            // mainObject.rotation.x = toRadians(0);
            //
            wasSplit = false;
            wasReflected = false;
            dummy.add( mainObject );
            scene.add(dummy);
            TweenMax.fromTo(dummy.scale,.5, {x:0,y:0,z:0},{x:1,y:1,z:1, delay: 1});
            // TweenMax.delayedCall(2, splitSequence);
            animate();

        }
    );
}

function splitSequence(){
    TweenMax.to(dummy.scale, 0.5, {x:0,y:0,z:0, onComplete:function(){
        scene.remove(dummy);
        dummy = splitUpObject(16,5.5);
        scene.add(dummy);
        TweenMax.from(dummy.scale, 0.5, {x:0,y:0,z:0, delay: 0.5});
        rotateAllTween = TweenMax.to(dummy.rotation, 30, {z:toRadians(360), repeat:-1, ease:Linear.easeNone});
    }});

}

function unsplitSequence(){
    TweenMax.to(dummy.scale,0.5, {x:0,y:0,z:0, onComplete:function(){
        rotateAllTween.kill();
        scene.remove(dummy);
        dummy = new THREE.Mesh(new THREE.CubeGeometry(.001, .001, .001), standardMaterial);
        mainObject.rotation.y = 20;
        dummy.add(mainObject);
        scene.add(dummy);
        TweenMax.from(dummy.scale, 0.5, {x:0,y:0,z:0, delay: 0.5});
    }});
}

function splitUpObject(numberOfClones, radius){
    var dummy = new THREE.Mesh(new THREE.CubeGeometry(.001, .001, .001), standardMaterial);
    var angleBetweenClones = 360/numberOfClones;
    for(var i = 0; i<numberOfClones;i++){
        var clone = mainObject.clone();
        var positionAngle = angleBetweenClones*i-90
        clone.rotation.z = toRadians(-positionAngle);
        dummy.add(clone);
        clone.position.x = ((i%2)+1)*(radius/2)*Math.cos(toRadians(positionAngle));
        clone.position.y = ((i%2)+1)*(radius/2)*Math.sin(toRadians(positionAngle));
        clone.scale.set(2/numberOfClones,2/numberOfClones,2/numberOfClones);
    }
    return dummy;
}

function determineColour(offset){
    // var colors = [0x4E1559, 0x618897, 0x4A5825, 0x73492C, 0x77745D];
    // var colors = [0x994AC0, 0x82D6A5, 0x6017A5, 0xA791EF, 0xBC56C2, 0x4EA54D];
    var colors = [0x80FFB7, 0xf37cbe, 0xB57FFF];
    var totalTimePassed = ((performance.now() - startTime)/100) + offset;
    var colourDuration = 120;
    var currentColourIndex = Math.floor((totalTimePassed/colourDuration))%(colors.length);
    var currentColour = new THREE.Color(colors[currentColourIndex]);
    var nextColour = new THREE.Color(colors[(currentColourIndex +1)%(colors.length)]);
    var alpha = (totalTimePassed%colourDuration)/colourDuration;
    return currentColour.lerp(nextColour, alpha);
}

function determineHSLColour(offset){
    var saturation = 100;
    var lightness = 75;
    var colourHues = [ 146,327,265];
    var totalTimePassed = ((performance.now() - startTime)/100) + offset;
    var colourDuration = 120;
    var currentColourIndex = Math.floor((totalTimePassed/colourDuration))%(colourHues.length);
    var nextColourIndex = (currentColourIndex+1)%(colourHues.length);
    var alpha = (totalTimePassed%colourDuration)/colourDuration;
    var hue = (1-alpha)*colourHues[currentColourIndex] + alpha*colourHues[nextColourIndex];
    var hslString = "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)";
    var newColour =  new THREE.Color(hslString);
    return newColour;
}

function animate() {
    requestAnimationFrame( animate );
    update();
}

function update() {
    var timePassed = getTimeSinceLastFrame();
    var animationConstant = timePassed/100 ;
    if(dummy.children[0].rotation.y > 50 && wasSplit == false){
        wasSplit = true;
        splitSequence();
    }
    if(dummy.children[0].rotation.y < -25 && wasSplit == true){
        wasSplit = false;
        unsplitSequence();
    }
    if(dummy.children[0].rotation.y < -50 && wasReflected == false){
        TweenMax.to(standardMaterial, 0.5, {reflectivity:0.2});
        wasReflected = true;
    }
    if(dummy.children[0].rotation.y > -25 && wasReflected == true){
        TweenMax.to(standardMaterial, 0.5, {reflectivity:0.0});
        wasReflected = false;
    }
    spotLight.color = determineHSLColour(0);
    spotLight2.color = determineHSLColour(120);
    spotLight3.color = determineHSLColour(240);
    // renderer.render( scene, camera );

    shaderTime += 0.1;
    badTVPass.uniforms[ 'time' ].value =  shaderTime;
    filmPass.uniforms[ 'time' ].value =  shaderTime;
    staticPass.uniforms[ 'time' ].value =  shaderTime;

    composer.render( 0.1 );
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
    // dummy.rotation.z += amount/5;
    dummy.children.forEach(function(child){
        child.rotation.y += amount;
        // child.rotation.x -= amount/5;
        // child.rotation.z += amount/5;
    })
}
function rotateMainObjectByTween(){
    // dummy.rotation.z += dragMoveX/5;
    dummy.children.forEach(function(child){
        child.rotation.y += dragMoveX;
        // child.rotation.x -= dragMoveX/5;
        // child.rotation.z += dragMoveX/5;
    })
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

