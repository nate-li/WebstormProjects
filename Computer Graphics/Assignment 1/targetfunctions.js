"use strict";
var gl;
var canvas;
var bufferId;
var program;
var color;
var ucolor;
var mode;
var points;

window.onload = function init(){
    // window.setInterval(update, 16);
    mode = false;

    canvas=document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL isn't available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    color = vec4(1,1,1,1);
    ucolor = gl.getUniformLocation(program, "color");

    makeShapeAndBuffer();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    render();
};

function makeShapeAndBuffer(){
    points = [];
    // points.push(vec4(-0.5, -0.5, 0, 1));
    // points.push(vec4(0, 0.5, 0, 1));
    // points.push(vec4(0.5, -0.5, 0, 1));

    points.push(vec4(-0.25, -0.25, 0, 1));
    points.push(vec4(0.25, -0.25, 0, 1));
    points.push(vec4(-0.25, 0.25, 0, 1));
    points.push(vec4(0.25, 0.25, 0, 1));

    bufferId = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.RECTANGLES, 0, 4);
}

