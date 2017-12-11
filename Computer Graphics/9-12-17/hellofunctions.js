"use strict";
//it will be handy to have references to some of our WebGL related objects
var gl;
var canvas;
var bufferId; //since we need to refer to it in multiple places
var trianglePoints; //since we need to refer to it in multiple places
var program;
var color;
var ucolor; //store location of color uniform
var xoffset;
var yoffset;
var mode;
var reverse;

//We want some set up to happen immediately when the page loads
window.onload = function init() {

    window.setInterval(update, 16);
    mode = false;
    //fetch reference to the canvas element we defined in the html file
    canvas = document.getElementById("gl-canvas");
    //grab the WebGL 2 context for that canvas.  This is what we'll use to do our drawing
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL isn't available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program); //and we want to use that program for our rendering

    color = vec4(1,1,1,1);//start as white

    //we need to know where to send values for our color uniform
    //fetch an index from our compiled shader program
    ucolor = gl.getUniformLocation(program, "color");
    gl.uniform4fv(ucolor, color);

    window.addEventListener("keydown" ,function(event){
        if(event.key == " "){
            if(mode){
                mode = false;
            } else {
                mode = true;
            }
        }

        //we're sending over a vec4 to be used by every vertex until we change
        //to some other color.  Note the 4fv is because we have 4 float values in a vector (array)
        //take the local vec4 in the color variable, and send it to the uniform location we stored in ucolor
        gl.uniform4fv(ucolor, color);
        requestAnimationFrame(render);//and now we need a new frame since we made a change
    });

    //If the user clicks somewhere in the canvas area, we want to respond to that
    //note that we can give the name of a function rather than defining an anonymous function inline here
    canvas.addEventListener("mousedown", mouseDownListener);

    xoffset = 0;
    yoffset = 0;
    //We'll split this off to its own function for clarity, but we need something to make a picture of
    makeTriangleAndBuffer();

    //we'll talk more about this in a future lecture, but this is saying what part of the canvas
    //we want to draw to.  In this case, that's all of it.
    gl.viewport(0, 0, canvas.width, canvas.height);

    //What color do you want the background to be?  This sets it to black and opaque.
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //request that a frame be drawn
    render(); //we'll have a better way to trigger a new frame in the next lecture, but this will work for now
};

function mouseDownListener(event){
    var rect = canvas.getBoundingClientRect(); //note that the canvas doesn't go all the way to the edge of the window
    var canvasY = event.clientY - rect.top; //convert window coordinates to canvas coordinates
    var flippedY = canvas.height - canvasY; //canvas 0 is top, gl 0 is bottom, so flip the y

    //before we go any further, note that in gl space, our coordnates currently go from -1 to 1
    //in canvas space, our coordinates go from 0 to canvas.height
    //so the 0 to canvas.height distance needs to be scaled down to a length of 2
    //and instead of 0 being the smallest value, we need -1 to be the smallest value
    //if we divide by canvas.height, that will get us to the 0-1 range, multiply that by 2 to
    //get to a 0-2 range, then subtract 1 to get to a -1 to 1 range
    yoffset = 2 * flippedY / canvas.height - 1;

    //and we need to similarly convert the x coordinate (no flip needed)
    xoffset = 2*(event.clientX - rect.left)/canvas.width -1;

    //now that we have the new location, adjust the triangle data accordingly
    //we'll have a much better way to accomplish this next week, but we haven't talked about
    //transformation matrices yet, so we'll do this the bad way for now
    trianglePoints[0][0] = -0.5 + xoffset;
    trianglePoints[0][1] = -0.5 + yoffset;
    trianglePoints[1][0] = 0 + xoffset;
    trianglePoints[1][1] = 0.5 + yoffset;
    trianglePoints[2][0] = 0.5 + xoffset;
    trianglePoints[2][1] = -0.5 + yoffset;

    //we should still be bound to this buffer, but just to set a good example for the future
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trianglePoints), gl.STATIC_DRAW);

    requestAnimationFrame(render);//and now we need a new frame since we made a change
}

//Make a triangle and send it over to the graphics card
function makeTriangleAndBuffer(){
    trianglePoints = []; //empty array

    //create 3 vertices and add them to the array
    //since we haven't talked about projection yet, we need to stay between -1 and 1 since that's the default volume
    trianglePoints.push(vec4(-0.5, -0.5, 0, 1));
    trianglePoints.push(vec4(0, 0.5, 0, 1));
    trianglePoints.push(vec4(0.5, -0.5, 0, 1));

    //we need some graphics memory for this information
    bufferId = gl.createBuffer();
    //tell WebGL that the buffer we just created is the one we want to work with right now
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trianglePoints), gl.STATIC_DRAW);

    //What is this data going to be used for?
    //The vertex shader has an attribute named "vPosition".  Let's associate this data to that attribute
    var vPosition = gl.getAttribLocation(program, "vPosition");
    //attribute location we just fetched, 4 elements in each vector, data type float, don't normalize this data,
    //data has no gaps, and starts right away at index 0
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function update(){
    if(mode){
        if(xoffset < -1){
            reverse = true;
        }

        if(xoffset > 1){
            reverse = false;
        }

        if(reverse){
            xoffset = xoffset+.005;
        }else{
            xoffset = xoffset-.005;
        }
        trianglePoints[0][0] = -0.5 + xoffset;
        trianglePoints[0][1] = -0.5 + yoffset;
        trianglePoints[1][0] = 0 + xoffset;
        trianglePoints[1][1] = 0.5 + yoffset;
        trianglePoints[2][0] = 0.5 + xoffset;
        trianglePoints[2][1] = -0.5 + yoffset;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(trianglePoints), gl.STATIC_DRAW);

    requestAnimationFrame(render);//and now we need a new frame since we made a change
}

//draw a new frame
function render(){
    //start by clearing any previous data
    gl.clear(gl.COLOR_BUFFER_BIT);
    //draw the geometry we previously sent over.  It's a list of 1 triangle(s),
    //we want to start at index 0, and there will be a total of 3 vertices
    gl.drawArrays(gl.POINTS, 0, 3);

}
