"use strict";
//it will be handy to have references to some of our WebGL related objects
var gl;
var canvas;
var program;
var color;
var ucolor; //store location of color uniform

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

    color = vec4(1,1,1,1);//start as white

    //we need to know where to send values for our color uniform
    //fetch an index from our compiled shader program
    ucolor = gl.getUniformLocation(program, "color");
    gl.uniform4fv(ucolor, color);

    //This won't execute until the user hits a key
    //Note that we're defining the function anonymously.  If this gets too complicated
    //we probably want to split the code off somewhere and just give the name of the function
    //to call for this event
    window.addEventListener("keydown" ,function(event){
        switch(event.key) {
            case "r":
                color = vec4(1,0,0,1); //red
                break;
            case "g":
                color = vec4(0,1,0,1); //green
                break;
            case "b":
                color = vec4(0,0,1,1); //blue
                break;
            case "c": //random color
                color = vec4(Math.random(), Math.random(), Math.random(), 1);
                break;
        }

        //we're sending over a vec4 to be used by every vertex until we change
        //to some other color.  Note the 4fv is because we have 4 float values in a vector (array)
        //take the local vec4 in the color variable, and send it to the uniform location we stored in ucolor
        gl.uniform4fv(ucolor, color);
        requestAnimationFrame(render);//and now we need a new frame since we made a change
    });

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

//Make a triangle and send it over to the graphics card
function makeTriangleAndBuffer(){
    var trianglePoints = []; //empty array

    //create 3 vertices and add them to the array
    //since we haven't talked about projection yet, we need to stay between -1 and 1 since that's the default volume
    trianglePoints.push(vec4(-0.5, -0.5, 0, 1));
    trianglePoints.push(vec4(0, 0.5, 0, 1));
    trianglePoints.push(vec4(0.5, -0.5, 0, 1));

    //we need some graphics memory for this information
    var bufferId = gl.createBuffer();
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

//draw a new frame
function render(){
    //start by clearing any previous data
    gl.clear(gl.COLOR_BUFFER_BIT);
    //draw the geometry we previously sent over.  It's a list of 1 triangle(s),
    //we want to start at index 0, and there will be a total of 3 vertices
    gl.drawArrays(gl.TRIANGLES, 0, 3);

}
