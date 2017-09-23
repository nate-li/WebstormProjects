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
var bufferId;

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

    //TODO make cube
    makeCubeAndBuffer();
    //TODO make cylinder

    //TODO make ground


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    window.setInterval(update, 16); //target 60 frames per second
};

function makeCubeAndBuffer(){
    var cubepoints = [];
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

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
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

//TODO
function update(){

    requestAnimationFrame(render);
}

function render(){
    //start by clearing any previous data for both color and depth
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //we'll discuss projection matrices in a couple of days, but use this for now:
    var p = perspective(45.0, canvas.width / canvas.height, 1.0, 100.0);
    gl.uniformMatrix4fv(uproj, false, flatten(p));

    //now set up the model view matrix and send it over as a uniform
    //the inputs to this lookAt are to move back 20 units, point at the origin, and the positive y axis is up
    //TODO construct a model view matrix and send it as a uniform to the vertex shader
    var mv = lookAt(vec3(10, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

    mv = mult(mv, translate(xoffset, yoffset, zoffset));

    gl.uniformMatrix4fv(umv, false, flatten(mv));

    //we only have one object at the moment, but just so we don't forget this step later...
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //draw the geometry we previously sent over.  It's a list of 12 triangle(s),
    //we want to start at index 0, and there will be a total of 36 vertices (6 faces with 6 vertices each)
    gl.drawArrays(gl.TRIANGLES, 0, 36);    // draw the cube
}
