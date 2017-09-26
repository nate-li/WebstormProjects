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
var cubePoints;
var cylinderPoints;
var circlePoints;
var groundPoints;
var rotateAngle;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL isn't available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program); //and we want to use that program for our rendering

    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");

    xoffset = yoffset = zoffset = 0;
    rotateAngle = 0;

    //TODO make cube
    makeCubeAndBuffer();
    //TODO make cylinder
    makeCylinderAndBuffer();
    //TODO make circle
    makeCircleAndBuffer();
    //TODO make ground
    makeGroundAndBuffer();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // gl.clearColor(0, 0, 0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    window.setInterval(update, 16); //target 60 frames per second
};

function makeCubeAndBuffer(){
    cubepoints = [];
    //front face = 6 verts, position then color
    cubepoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubepoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubepoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubepoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubepoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan
    cubepoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //cyan

    //back face
    cubepoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //magenta
    cubepoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubepoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubepoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubepoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta
    cubepoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 1.0, 1.0));//magenta

    //left face
    cubepoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubepoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubepoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubepoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubepoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow
    cubepoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //yellow

    //right face
    cubepoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubepoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubepoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubepoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubepoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red
    cubepoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //red

    //top
    cubepoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubepoints.push(vec4(1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubepoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubepoints.push(vec4(-1.0, 1.0, -1.0, 1.0));
    cubepoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubepoints.push(vec4(-1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue
    cubepoints.push(vec4(1.0, 1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //blue

    //bottom
    cubepoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubepoints.push(vec4(1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubepoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubepoints.push(vec4(-1.0, -1.0, 1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubepoints.push(vec4(-1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    cubepoints.push(vec4(1.0, -1.0, -1.0, 1.0));
    cubepoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green

    cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubepoints), gl.STATIC_DRAW);

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

//TODO
function update(){
    rotateAngle += 10;
    while(rotateAngle >= 360){
        rotateAngle -= 360
    }

    requestAnimationFrame(render);
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var p = perspective(45.0, canvas.width / canvas.height, 1.0, 100.0);
    gl.uniformMatrix4fv(uproj, false, flatten(p));


    var mainMV = lookAt(vec3(5, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    mainMV = mult(mainMV, translate(xoffset, yoffset, zoffset));
    gl.uniformMatrix4fv(umv, false, flatten(mainMV));


    //TODO cube
    var cubeMV = mult(mainMV, translate(0, 0, 5));
    cubeMV = mult(cubeMV, rotateY(0));
    cubeMV = mult(cubeMV, scalem(1.5, 1, 1));
    gl.uniformMatrix4fv(umv, false, flatten(cubeMV));

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLES, 0, 36);


    //TODO cylinder 1
    var cylinderMV = mult(cubeMV, translate(-.8, -1, .9));
    cylinderMV = mult(cylinderMV, scalem(.35, .5, 1));
    gl.uniformMatrix4fv(umv, false, flatten(cylinderMV));

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length/2);


    //TODO circle 1
    var circleMV = mult(cubeMV, translate(-.8, -1, 1.05));
    circleMV = mult(circleMV, scalem(.35 , .5, 1));
    circleMV = mult(circleMV, rotateZ(rotateAngle));
    gl.uniformMatrix4fv(umv, false, flatten(circleMV));

    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length/2);

    //TODO cylinder 2
    var cylinder2MV = mult(cubeMV, translate(.8, -1, .9));
    cylinder2MV = mult(cylinder2MV, scalem(.35, .5, 1));
    gl.uniformMatrix4fv(umv, false, flatten(cylinder2MV));

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length/2);

    //TODO circle 2
    var circle2MV = mult(cubeMV, translate(.8, -1, 1.05));
    circle2MV = mult(circle2MV, scalem(.35, .5, 1));
    circle2MV = mult(circle2MV, rotateZ(rotateAngle));
    gl.uniformMatrix4fv(umv, false, flatten(circle2MV));

    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length/2);

    //TODO cylinder 3
    var cylinder3MV = mult(cubeMV, translate(-.8, -1, -1.1));
    cylinder3MV = mult(cylinder3MV, scalem(.35, .5, 1));
    gl.uniformMatrix4fv(umv, false, flatten(cylinder3MV));

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length/2);

    //TODO circle 3
    var circle3MV = mult(cubeMV, translate(-.8, -1, -1.05));
    circle3MV = mult(circle3MV, scalem(.35, .5, 1));
    circle3MV = mult(circle3MV, rotateZ(rotateAngle));
    gl.uniformMatrix4fv(umv, false, flatten(circle3MV));

    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length/2);

    //TODO cylinder 4
    var cylinder4MV = mult(cubeMV, translate(.8, -1, -1.1));
    cylinder4MV = mult(cylinder4MV, scalem(.35, .5, 1));
    gl.uniformMatrix4fv(umv, false, flatten(cylinder4MV));

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cylinderPoints.length/2);

    //TODO circle 4
    var circle4MV = mult(cubeMV, translate(.8, -1, -1.05));
    circle4MV = mult(circle4MV, scalem(.35, .5, 1));
    circle4MV = mult(circle4MV, rotateZ(rotateAngle));

    gl.uniformMatrix4fv(umv, false, flatten(circle4MV));

    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circlePoints.length/2);

    //TODO ground
    var groundMV = mult(mainMV, translate(0, -1.5, 5));
    groundMV = mult(groundMV, rotateX(90));
    groundMV = mult(groundMV, scalem(20, 20, 0));

    gl.uniformMatrix4fv(umv, false, flatten(groundMV));

    gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
