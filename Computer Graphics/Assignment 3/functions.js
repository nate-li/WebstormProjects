"use strict";

var gl;
var canvas;
var program;
var umv;
var uproj;
var xoffset;
var yoffset;
var zoffset;
var vPosition;
var vColor;

var cubeBuffer;
var cylinderBuffer;
var circleBuffer;
var groundBuffer;
var trackBuffer;
var boardBuffer;
var railBuffer;
var sphereBuffer;
var eyeBuffer;

var cubePoints;
var cylinderPoints;
var circlePoints;
var groundPoints;
var trackPoints;
var boardPoints;
var railPoints;
var spherePoints;
var eyePoints;

var rotateAngle;
var move;
var fileChosen;

//sphere rotation
var sphereright = false;
var sphereleft = false;
var sphereposition = 0;

//camera controls
var rotateview;
var rotationnum;
var dollyin = false;
var dollyout = false;
var fovup = false;
var fovdown = false;
var followcam = false;
var fov = 45;
var zmove = 50;
var xmove = 0;
var ymove = 20;


var num;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL isn't available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");

    xoffset = yoffset = zoffset = 0;
    rotateAngle = 0;
    fileChosen = false;
    move = false;
    rotateview = false;
    rotationnum = 0;
    num = 0;

    window.addEventListener("keydown", function(event){
        switch(event.key){
            case "m":
                if(move){
                    move = false;
                }
                else{
                    move = true;
                }
                break;
            case "=":
                if(rotateview){
                    rotateview = false;
                }
                else{
                    rotateview = true;
                }
                break;
            //fov up
            case "x":
                if(fovup){
                    fovup = false;
                }else{
                    fovup = true;
                    fovdown = false;
                }
                break;
            //fov down
            case "z":
                if(fovdown){
                    fovdown = false;
                }else{
                    fovdown = true;
                    fovup = false;
                }
                break;
            //dolly in
            case "q":
                if(dollyin){
                    dollyin = false;
                }else {
                    dollyin = true;
                    dollyout = false;
                }
                break;
            //dolly out
            case "e":
                if(dollyout){
                    dollyout = false;
                }else {
                    dollyout = true;
                    dollyin = false;
                }
                break;
            //follow cam
            case "f":
                if(followcam){
                    followcam = false;
                }else{
                    followcam = true;
                }
                break;
            //reset camera to default
            case "r":
                fov = 45;
                zmove = 50;
                xmove = 0;
                ymove = 20;
                dollyin = false;
                dollyout = false;
                fovup = false;
                fovdown = false;
                followcam = false;
                break;

            case "ArrowLeft":
                if(sphereleft){
                    sphereleft = false;
                }else {
                    sphereleft = true;
                    sphereright = false;
                }
                break;
            case "ArrowRight":
                if(sphereright){
                    sphereright = false;
                }else {
                    sphereright = true;
                    sphereleft = false;
                }
                break;
        }
        requestAnimationFrame(render);
    });

    var fileInput = document.getElementById("fileInput");
    fileInput.addEventListener('change', function(e){
        var file = fileInput.files[0];
        var textType = /text.*/;
        if(file.type.match(textType)){

            var reader = new FileReader();
            reader.onload = function(e){
                parseData(reader.result); //ok, we have our data, so parse it
                requestAnimationFrame(render); //ask for a new frame
            };
            reader.readAsText(file);
        }else{
            alert("File not supported: " + file.type + ".");
        }
    });

    //make cube
    makeCubeAndBuffer();
    //make cylinder
    makeCylinderAndBuffer();
    //make circle
    makeCircleAndBuffer();
    //make ground
    makeGroundAndBuffer();
    //make board
    makeBoardAndBuffer();
    //make rail
    makeRailAndBuffer();
    //make sphere
    generateSphere(15);
    //make eye
    generateEye(15);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    window.setInterval(update, 16);
    requestAnimationFrame(render);
};

//parse the track data into individual track points
function parseData(input){
    trackPoints = [];
    var numbers = input.split(/\s+/);
    for(var i = 0; i < numbers.length; i+= 3){
        trackPoints.push(vec4(parseFloat(numbers[i]), parseFloat(numbers[i+1]), parseFloat(numbers[i+2]), 1));
        trackPoints.push(vec4(0,0,0,1));
    }
    trackBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trackBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trackPoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);

    fileChosen = true;
}

//create the cube for the cart
function makeCubeAndBuffer(){
    cubePoints = [];
    //front face = 6 verts, position then color
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan

    //back face
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //magenta
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta

    //left face
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow

    //right face
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red

    //top
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue

    //bottom
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green

    cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);

    //What is this data going to be used for?
    //The vertex shader has an attribute named "vPosition".  Let's associate part of this data to that attribute
    vPosition = gl.getAttribLocation(program, "vPosition");
    //attribute location we just fetched, 4 elements in each vector, data type float, don't normalize this data,
    //each position starts 32 bytes after the start of the previous one, and starts right away at index 0
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    //The vertex shader also has an attribute named "vColor".  Let's associate the other part of this data to that attribute
    vColor = gl.getAttribLocation(program, "vColor");
    //attribute location we just fetched, 4 elements in each vector, data type float, don't normalize this data,
    //each color starts 32 bytes after the start of the previous one, and the first color starts 16 bytes into the data
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

//create the cylinder object for the wheel
function makeCylinderAndBuffer(){
    cylinderPoints = [];

    for(var i = 0; i < 2*Math.PI; i+= .1){
        cylinderPoints.push(vec4(Math.cos(i), Math.sin(i), 0, 1));
        cylinderPoints.push(vec4(0,0,0,1)); //black
        cylinderPoints.push(vec4(Math.cos(i), Math.sin(i), .2, 1));
        cylinderPoints.push(vec4(0,0,0,1)); //black
    }

    cylinderPoints.push(vec4(Math.cos(2*Math.PI), Math.sin(2*Math.PI), 0, 1));
    cylinderPoints.push(vec4(0,0,0,1)); //black
    cylinderPoints.push(vec4(Math.cos(2*Math.PI), Math.sin(2*Math.PI), .2, 1));
    cylinderPoints.push(vec4(0,0,0,1)); //black


    cylinderBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cylinderPoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

//create the wheel object for the wheel
function makeCircleAndBuffer(){
    circlePoints = [];

    for(var i = 0; i < 2*Math.PI; i+=.1){
        circlePoints.push(vec4(Math.cos(i), Math.sin(i), 0, 1));
        circlePoints.push(0);
    }

    circleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(circlePoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

//create the square to represent the ground
function makeGroundAndBuffer(){
    groundPoints = [];
    groundPoints.push(vec4(1, -1, 1, 1));
    groundPoints.push(vec4(0.122,0.535,0.090,1));
    groundPoints.push(vec4(1, 1, 1, 1));
    groundPoints.push(vec4(0.122,0.535,0.090,1));
    groundPoints.push(vec4(-1, 1, 1, 1));
    groundPoints.push(vec4(0.122,0.535,0.090,1));
    groundPoints.push(vec4(-1, -1, 1, 1));
    groundPoints.push(vec4(0.122,0.535,0.090,1));

    groundBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(groundPoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

//create the railroad tie object
function makeBoardAndBuffer(){
    var boardColor = vec4(0.525,0.437,0.118,1);
    boardPoints = makeCube(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    //
    // //back face
    // boardPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    //
    // //left face
    // boardPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    //
    // //right face
    // boardPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    //
    // //top
    // boardPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    //
    // //bottom
    // boardPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);
    // boardPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // boardPoints.push(boardColor);

    boardBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boardBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(boardPoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

//create the rail prism object
function makeRailAndBuffer(){
    var railColor = vec4(0,0,0,1);
    railPoints = [];
    railPoints = makeCube(railColor);
    // railPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    //
    // //back face
    // railPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    //
    // //left face
    // railPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    //
    // //right face
    // railPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    //
    // //top
    // railPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    //
    // //bottom
    // railPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);
    // railPoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    // railPoints.push(railColor);

    railBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, railBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(railPoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

function generateSphere(subdiv){
    var step = (360.0 / subdiv)*(Math.PI / 180.0); //how much do we increase the angles by per triangle?
    spherePoints = makeSphere(step, vec4(0, 0, 0, 1));

    // for (var lat = 0; lat <= Math.PI ; lat += step){ //latitude
    //     for (var lon = 0; lon + step <= 2*Math.PI; lon += step){ //longitude
    //         //triangle 1
    //         sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 1.0)); //position
    //         sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 0.0)); //normal
    //         sphereverts.push(color);
    //
    //         sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon+step), Math.sin(lat)*Math.sin(lon+step), Math.cos(lat), 1.0)); //position
    //         sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon+step), Math.sin(lat)*Math.sin(lon+step), Math.cos(lat), 0.0)); //normal
    //         sphereverts.push(color);
    //
    //         sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 1.0)); //etc
    //         sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 0.0));
    //         sphereverts.push(color);
    //
    //         //triangle 2
    //         sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 1.0));
    //         sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 0.0));
    //         sphereverts.push(color);
    //
    //         sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon), Math.sin(lat+step)*Math.sin(lon), Math.cos(lat+step), 1.0));
    //         sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon), Math.sin(lat+step)*Math.sin(lon), Math.cos(lat+step),0.0));
    //         sphereverts.push(color);
    //
    //         sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 1.0));
    //         sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 0.0));
    //         sphereverts.push(color);
    //     }
    // }

    //and send it over to graphics memory
    sphereBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(spherePoints), gl.STATIC_DRAW);
}

function generateEye(subdiv){
    var step = (360.0 / subdiv)*(Math.PI / 180.0); //how much do we increase the angles by per triangle?
    eyePoints = makeSphere(step, vec4(1, 0, 0, 1));

    eyeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, eyeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(eyePoints), gl.STATIC_DRAW);

}

function makeSphere(step, color){
    var verts = [];
    for (var lat = 0; lat <= Math.PI ; lat += step){ //latitude
        for (var lon = 0; lon + step <= 2*Math.PI; lon += step){ //longitude
            //triangle 1
            verts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 1.0)); //position
            verts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 0.0)); //normal
            verts.push(color);

            verts.push(vec4(Math.sin(lat)*Math.cos(lon+step), Math.sin(lat)*Math.sin(lon+step), Math.cos(lat), 1.0)); //position
            verts.push(vec4(Math.sin(lat)*Math.cos(lon+step), Math.sin(lat)*Math.sin(lon+step), Math.cos(lat), 0.0)); //normal
            verts.push(color);

            verts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 1.0)); //etc
            verts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 0.0));
            verts.push(color);

            //triangle 2
            verts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 1.0));
            verts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 0.0));
            verts.push(color);

            verts.push(vec4(Math.sin(lat+step)*Math.cos(lon), Math.sin(lat+step)*Math.sin(lon), Math.cos(lat+step), 1.0));
            verts.push(vec4(Math.sin(lat+step)*Math.cos(lon), Math.sin(lat+step)*Math.sin(lon), Math.cos(lat+step),0.0));
            verts.push(color);

            verts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 1.0));
            verts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 0.0));
            verts.push(color);
        }
    }
    return verts;
}


function makeCube(cubeColor){
    cubePoints = [];
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);

    //back face
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);

    //left face
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);

    //right face
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);

    //top
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);

    //bottom
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);
    cubePoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubePoints.push(cubeColor);

    return cubePoints;
}

function update(){
    //to move the cart and spin the wheel
    if(move){
        rotateAngle += 10;
        while(rotateAngle >= 360){
            rotateAngle -= 360
        }
        num += 2;
        while(num >= trackPoints.length-3){
            num = 0;
        }
    }

    //to rotate the camera around the track
    if(rotateview){
        rotationnum += .5;
        while (rotationnum >= 360){
            rotationnum -= 360;
        }
    }

    if(fovup && fov < 180){
        fov += .2;
    }

    if(sphereleft && sphereposition < 45){
        sphereposition += 1;
    }

    if(sphereright && sphereposition > -45){
        sphereposition -= 1;
    }


    if(fovdown && fov > 20){
        fov -= .2;
    }

    if(dollyin && zmove < 60) {
        zmove += .2
    }

    if(dollyout && zmove > 5){
        zmove -= .2
    }

    if(followcam){
        xoffset
    }

    requestAnimationFrame(render);
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var p = perspective(fov, canvas.width / canvas.height, 1.0, 100.0);
    gl.uniformMatrix4fv(uproj, false, flatten(p));

//look straight down
//     var mainMV = lookAt(vec3(0, 50, 0), vec3(0, 0, 0), vec3(0, 0, 1));
//look stright from the side

    var mainMV = lookAt(vec3(xmove, ymove, zmove), vec3(0, 0, 0), vec3(0, 1, 0));
    if(followcam){
        mainMV = lookAt(vec3(trackPoints[num][0], trackPoints[num][1], zmove), vec3(0, 0, 0), vec3(0, 1, 0));
    }
    //create the main MV
    mainMV = mult(mainMV, rotateY(rotationnum));
    mainMV = mult(mainMV, translate(xoffset, yoffset, zoffset));
    gl.uniformMatrix4fv(umv, false, flatten(mainMV));

    //TODO track
    if(fileChosen) {
        var trackMV = mult(mainMV, translate(0, 0, 0));
        var tracksize = .2;
        trackMV = mult(trackMV, scalem(tracksize, tracksize, tracksize));

        //create the track
        for (var i = 0; i < trackPoints.length; i += 2) {
            //calculate direction for each track point
            var eyeB;
            if(i === trackPoints.length-2){
                eyeB = vec3(trackPoints[0][0], trackPoints[0][1], trackPoints[0][2]);
            } else {
                eyeB = vec3(trackPoints[i+2][0], trackPoints[i+2][1], trackPoints[i+2][2]);
            }
            var atB = vec3(trackPoints[i][0], trackPoints[i][1], trackPoints[i][2]);
            var nB = normalize(subtract(eyeB, atB));
            var uB = vec4(normalize(cross(vec3(0,1,0), nB)), 0);
            var vB = vec4(normalize(cross(nB,uB)), 0);
            var tB = vec4(0, 0, 0, 1);
            var cB = mat4(uB, vB, nB, tB);
            var resultB = transpose(cB);

            //render the railroad tie
            var boardMV = mult(trackMV, translate(0, 0, 0));
            boardMV = mult(boardMV, translate(trackPoints[i][0], trackPoints[i][1], trackPoints[i][2]));

            boardMV = mult(boardMV, resultB);
            boardMV = mult(boardMV, rotateY(90));
            boardMV = mult(boardMV, scalem(1.1, .5, 5));
            gl.uniformMatrix4fv(umv, false, flatten(boardMV));
            gl.bindBuffer(gl.ARRAY_BUFFER, boardBuffer);
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
            gl.drawArrays(gl.TRIANGLES, 0, boardPoints.length / 2);

            //render the rails
            var railMV = mult(trackMV, translate(0, 0, 0));
            railMV = mult(railMV, translate(trackPoints[i][0], trackPoints[i][1], trackPoints[i][2]));
            railMV = mult(railMV, resultB);
            railMV = mult(railMV, rotateY(90));
            railMV = mult(railMV, scalem(2, 1, .5));

            var rail2MV = mult(railMV, translate(0, 0, -4));
            railMV = mult(railMV, translate(0, 0, 4));

            gl.uniformMatrix4fv(umv, false, flatten(railMV));
            gl.bindBuffer(gl.ARRAY_BUFFER, railBuffer);
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
            gl.drawArrays(gl.TRIANGLES, 0, railPoints.length / 2);

            gl.uniformMatrix4fv(umv, false, flatten(rail2MV));
            gl.bindBuffer(gl.ARRAY_BUFFER, railBuffer);
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
            gl.drawArrays(gl.TRIANGLES, 0, railPoints.length / 2);
        }

        //render the cart and all its parts
        //TODO cube
        var cubeMV = mult(trackMV, translate(0, 0, 0));
        cubeMV = mult(cubeMV, translate(trackPoints[num][0], trackPoints[num][1]+3.6, trackPoints[num][2]));
        var eye = vec3(trackPoints[num+2][0], trackPoints[num+2][1], trackPoints[num+2][2]);
        var at = vec3(trackPoints[num][0], trackPoints[num][1], trackPoints[num][2]);
        var n = normalize(subtract(eye, at));
        var u = vec4(normalize(cross(vec3(0,1,0), n)), 0);
        var v = vec4(normalize(cross(n,u)), 0);
        var t = vec4(0, 0, 0, 1);
        var c = mat4(u, v, n, t);

        var result = transpose(c);
        cubeMV = mult(cubeMV, result);
        cubeMV = mult(cubeMV, rotateY(90));
        cubeMV = mult(cubeMV, scalem(3, 2, 2));
        gl.uniformMatrix4fv(umv, false, flatten(cubeMV));

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        //sphere
        var sphereMV = mult(cubeMV, translate(-.5, 3, 0));
        sphereMV = mult(sphereMV, scalem((2/3)*.8, .8, .8));
        sphereMV = mult(sphereMV, rotateY(sphereposition));
        gl.uniformMatrix4fv(umv, false, flatten(sphereMV));

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 48, 0);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 48, 32);
        gl.drawArrays(gl.TRIANGLES, 0, spherePoints.length/3);

        //TODO eye 1
        var eye1MV = mult(sphereMV, translate(-.7, .1, .4));
        eye1MV = mult(eye1MV, scalem(.3, .4, .3));
        gl.uniformMatrix4fv(umv, false, flatten(eye1MV));

        gl.bindBuffer(gl.ARRAY_BUFFER, eyeBuffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 48, 0);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 48, 32);
        gl.drawArrays(gl.TRIANGLES, 0, eyePoints.length/3);

        //TODO eye 2
        var eye2MV = mult(sphereMV, translate(-.7, .1, -.4));
        eye2MV = mult(eye2MV, scalem(.3, .4, .3));
        gl.uniformMatrix4fv(umv, false, flatten(eye2MV));

        gl.bindBuffer(gl.ARRAY_BUFFER, eyeBuffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 48, 0);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 48, 32);
        gl.drawArrays(gl.TRIANGLES, 0, eyePoints.length/3);

        //cylinder 1
        var cylinder1MV = mult(cubeMV, translate(-.8, -.9, .9));
        renderCylinder(cylinder1MV);
        // cylinderMV = mult(cylinderMV, scalem(.35, .5, 1));
        // gl.uniformMatrix4fv(umv, false, flatten(cylinderMV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length / 2);

        //cylinder 2
        var cylinder2MV = mult(cubeMV, translate(.8, -1, .9));
        renderCylinder(cylinder2MV);
        // cylinder2MV = mult(cylinder2MV, scalem(.35, .5, 1));
        // gl.uniformMatrix4fv(umv, false, flatten(cylinder2MV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length / 2);

        //cylinder 3
        var cylinder3MV = mult(cubeMV, translate(-.8, -1, -1.1));
        renderCylinder(cylinder3MV);
        // cylinder3MV = mult(cylinder3MV, scalem(.35, .5, 1));
        // gl.uniformMatrix4fv(umv, false, flatten(cylinder3MV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length / 2);

        //cylinder 4
        var cylinder4MV = mult(cubeMV, translate(.8, -1, -1.1));
        renderCylinder(cylinder4MV);
        // cylinder4MV = mult(cylinder4MV, scalem(.35, .5, 1));
        // gl.uniformMatrix4fv(umv, false, flatten(cylinder4MV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length / 2);

        //circle 1
        var circle1MV = mult(cubeMV, translate(-.8, -1, 1.05));
        renderCircle(circle1MV);
        // circleMV = mult(circleMV, scalem(.35, .5, 1));
        // circleMV = mult(circleMV, rotateZ(rotateAngle));
        // gl.uniformMatrix4fv(umv, false, flatten(circleMV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length / 2);

        //circle 2
        var circle2MV = mult(cubeMV, translate(.8, -1, 1.05));
        renderCircle(circle2MV);
        // circle2MV = mult(circle2MV, scalem(.35, .5, 1));
        // circle2MV = mult(circle2MV, rotateZ(rotateAngle));
        // gl.uniformMatrix4fv(umv, false, flatten(circle2MV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length / 2);

        //circle 3
        var circle3MV = mult(cubeMV, translate(-.8, -1, -1.05));
        renderCircle(circle3MV);
        // circle3MV = mult(circle3MV, scalem(.35, .5, 1));
        // circle3MV = mult(circle3MV, rotateZ(rotateAngle));
        // gl.uniformMatrix4fv(umv, false, flatten(circle3MV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length / 2);

        //circle 4
        var circle4MV = mult(cubeMV, translate(.8, -1, -1.05));
        renderCircle(circle4MV);
        // circle4MV = mult(circle4MV, scalem(.35, .5, 1));
        // circle4MV = mult(circle4MV, rotateZ(rotateAngle));
        //
        // gl.uniformMatrix4fv(umv, false, flatten(circle4MV));
        //
        // gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
        // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length / 2);

        //ground
        var groundMV = mult(mainMV, translate(0, -1.5, 0));
        groundMV = mult(groundMV, rotateX(90));
        groundMV = mult(groundMV, scalem(20, 20, 0));

        gl.uniformMatrix4fv(umv, false, flatten(groundMV));

        gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
}

function renderCylinder(cylinderMV){
    cylinderMV = mult(cylinderMV, scalem(.35, .5, 1));
    gl.uniformMatrix4fv(umv, false, flatten(cylinderMV));

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length / 2);
}

function renderCircle(circleMV){
    circleMV = mult(circleMV, scalem(.35, .5, 1));
    circleMV = mult(circleMV, rotateZ(rotateAngle));
    gl.uniformMatrix4fv(umv, false, flatten(circleMV));

    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length / 2);
}