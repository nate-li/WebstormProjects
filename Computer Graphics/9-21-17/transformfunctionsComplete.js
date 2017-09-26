"use strict";
//it will be handy to have references to some of our WebGL related objects
var gl;
var canvas;
var program;
var umv; //index of the shader uniform for modelview matrix
var uproj; //index of the shader uniform for projection matrix
var bufferId;
var mode; //for the various demo modes
var rotateAngle; //keep track of how many degrees to rotate by
var orbit; //a second angle for the orbiting behavior
var rotmat; //what if we wanted to do a change in coordinate frame instead?
var xoffset; //translation x
var yoffset; //translation y
var zoffset; //translation z
var vPosition; //remember the location of shader attributes
var vColor; //remember the location of shader attributes

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

    //initialize various animation parameters
    xoffset = yoffset = zoffset = 0;
    rotateAngle = 0;
    mode = 0;
    orbit = 0;
    rotmat = mat4();//identity matrix

    //This won't execute until the user hits a key
    //Note that we're defining the function anonymously.  If this gets too complicated
    //we probably want to split the code off somewhere and just give the name of the function
    //to call for this event
    window.addEventListener("keydown" ,function(event){
        switch(event.key) {
            case "0": //switch modes
            case "1":
            case "2":
                mode = parseInt(event.key);
                break;
            case "ArrowDown":
                yoffset -= 0.1;
                break;
            case "ArrowUp":
                yoffset += 0.1;
                break;
            case "ArrowLeft":
                xoffset -= 0.1;
                break;
            case "ArrowRight":
                xoffset += 0.1;
                break;
            case "a":
                zoffset -= 0.1;
                break;
            case "z":
                zoffset += 0.1;
                break;

        }

        requestAnimationFrame(render);//and now we need a new frame since we made a change
    });

    //We'll split this off to its own function for clarity, but we need something to make a picture of
    makeCubeAndBuffer();

    //we'll talk more about this in a future lecture, but this is saying what part of the canvas
    //we want to draw to.  In this case, that's all of it.
    gl.viewport(0, 0, canvas.width, canvas.height);

    //What color do you want the background to be?  This sets it to black and opaque.
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //we need to do this to avoid having objects that are behind other objects show up anyway
    gl.enable(gl.DEPTH_TEST);


    window.setInterval(update, 16); //target 60 frames per second
};

//Make a triangle and send it over to the graphics card
function makeCubeAndBuffer(){
    var cubepoints = []; //empty array

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

    //we need some graphics memory for this information
    bufferId = gl.createBuffer();
    //tell WebGL that the buffer we just created is the one we want to work with right now
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubepoints), gl.STATIC_DRAW);

    //Data is packed in groups of 4 floats which are 4 bytes each, 32 bytes total for position and color
    // position            color
    //  x   y   z     w       r    g     b    a
    // 0-3 4-7 8-11 12-15  16-19 20-23 24-27 28-31

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

//increase rotation angle and request new frame
function update(){
    //alter the rotation angle
    rotateAngle += 3;
    while (rotateAngle >= 360){
        rotateAngle -= 360;
    }

    //alter the orbit angle
    orbit += 0.25;
    while (orbit >= 360){
        orbit -= 360;
    }

    //what if we want a change in coordinate frame matrix?
    //we need to calculate side, up and forward vectors
    //this is just one example of what we might want as our goal
    //project 2 will follow a similar process, but there your goal orientation
    //and location will be dictated by the track points

    //convert to radians
    var phi = orbit*Math.PI / 180.0;
    var theta = rotateAngle*Math.PI / 180;

    //Let's say we want our cube to always keep it's right side facing right
    var side = vec4(1, 0, 0, 0);
    //but we want our up vector to be based on our rotateAngle angle so the cube is doing somersaults
    var up = vec4(0, Math.cos(theta), -Math.sin(theta), 0);
    //and our forward vector will need to be perpendicular to the other two either by taking a cross product
    //or by trigonometric properties
    var forward = vec4(0, Math.sin(theta), Math.cos(theta), 0);
    //and finally our new location is based on translating to our orbit position
    var origin = vec4(3*Math.cos(phi), 0, 3*Math.sin(phi), 1);

    //putting that all together into a matrix
    rotmat = mat4(side, up, forward, origin);
    //but remember Angel puts together mat4s by row, and we wanted it by column, so transpose
    rotmat = transpose(rotmat);

    requestAnimationFrame(render);
}

//draw a new frame
function render(){
    //start by clearing any previous data for both color and depth
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //we'll discuss projection matrices in a couple of days, but use this for now:
    var p = perspective(45.0, canvas.width / canvas.height, 1.0, 100.0);
    gl.uniformMatrix4fv(uproj, false, flatten(p));

    //now set up the model view matrix and send it over as a uniform
    //the inputs to this lookAt are to move back 20 units, point at the origin, and the positive y axis is up
    var mv = lookAt(vec3(0, 0, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    mv = mult(mv, translate(xoffset, yoffset, zoffset));

    var commonMat = mv; //so we can get back to this state later

    mv = mult(mv, rotateY(rotateAngle));

    gl.uniformMatrix4fv(umv, false, flatten(mv));

    //we only have one object at the moment, but just so we don't forget this step if we have multiple buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);

    //draw the geometry we previously sent over.  It's a list of 12 triangle(s),
    //we want to start at index 0, and there will be a total of 36 vertices (6 faces with 6 vertices each)
    gl.drawArrays(gl.TRIANGLES, 0, 36);    // draw the cube

    mv = commonMat; //go back to the transforms that apply to the whole scene

    if (mode == 1){
         mv = mult(mv, mult(rotateY(orbit), mult(translate(3, 0, 0), rotateX(rotateAngle))));
         gl.uniformMatrix4fv(umv, false, flatten(mv));
         gl.drawArrays(gl.TRIANGLES, 0, 36);    // draw the same cube but in a different location/orientation
     }
     else if (mode == 2){
         mv = mult( mv, rotmat); //see update() for how we construct this
         gl.uniformMatrix4fv(umv, false, flatten(mv));
         gl.drawArrays(gl.TRIANGLES, 0, 36);    // draw the cube
     }

}
