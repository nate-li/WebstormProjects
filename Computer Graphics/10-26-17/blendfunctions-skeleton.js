"use strict";
//it will be handy to have references to some of our WebGL related objects
var gl;
var canvas;
var program;

//uniform locations
var umv; //uniform for mv matrix
var uproj; //uniform for projection matrix

//matrices
var mv; //local mv
var p; //local projection

//We want some set up to happen immediately when the page loads
window.onload = function init() {

    //fetch reference to the canvas element we defined in the html file
    canvas = document.getElementById("gl-canvas");
    //grab the WebGL 2 context for that canvas.  This is what we'll use to do our drawing
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL isn't available");
    }

    //Take the vertex and fragment shaders we provided and compile them into a shader program
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program); //and we want to use that program for our rendering

    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");

    //TODO Enable blending
    gl.enable(gl.BLEND);
    //TODO define a blending function
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

    //We'll split this off to its own function for clarity, but we need something to assign colors to
    makeSquareAndBuffer();

    //we'll talk more about this in a future lecture, but this is saying what part of the canvas
    //we want to draw to.  In this case, that's all of it.
    gl.viewport(0, 0, canvas.width, canvas.height);

    //What color do you want the background to be?  This sets it to black and opaque.
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //request that a frame be drawn
    render(); //we'll have a better way to trigger a new frame in the next lecture, but this will work for now
};

//Make a square and send it over to the graphics card
function makeSquareAndBuffer(){
    var squarePoints = []; //empty array

    //create 6 vertices and add them to the array
    squarePoints.push(vec4(-1, -1, 0, 1));
    squarePoints.push(vec4(1, -1, 0, 1));
    squarePoints.push(vec4(1, 1, 0, 1));
    squarePoints.push(vec4(1, 1, 0, 1));
    squarePoints.push(vec4(-1, 1, 0, 1));
    squarePoints.push(vec4(-1, -1, 0, 1));

    //we need some graphics memory for this information
    var bufferId = gl.createBuffer();
    //tell WebGL that the buffer we just created is the one we want to work with right now
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squarePoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

}

//draw a new frame
function render(){
    //start by clearing any previous data
    gl.clear(gl.COLOR_BUFFER_BIT);


    var p = perspective(45.0, canvas.width / canvas.height, 1.0, 100.0);
    gl.uniformMatrix4fv(uproj, false, flatten(p));

    var mv = lookAt(vec3(0, 0, 5), vec3(0, 0, 0), vec3(0, 1, 0));

    var commonmv = mv; //so we can get back to this state later


    gl.uniformMatrix4fv(umv, false, flatten(mv));


    //TODO Play with the color values (specifically that alpha value)
    var vColor = gl.getAttribLocation(program, "vColor");
    //opaque red
    gl.vertexAttrib4fv(vColor, vec4(.5, 0, 0, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 6);


    mv = mult(commonmv, translate(-0.5, 0.5, 0));

    gl.uniformMatrix4fv(umv, false, flatten(mv));

    //TODO play with color/alpha
    //translucent green
    gl.vertexAttrib4fv(vColor, vec4(0, 0.5, 0, .5));
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}
