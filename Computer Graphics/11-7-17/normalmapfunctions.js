/**
 * Created by gosnat on 11/7/2017.
 */

"use strict";
var gl;
var program;



//uniform locations
var umv; //uniform for mv matrix
var uproj; //uniform for projection matrix

//matrices
var mv; //local mv
var p; //local projection

//shader variable indices for material properties
var vPosition; //
var vNormal; //actually need a normal vector to modify
var vTangent; //need a tangent vector as well
var vTexCoord; //texture coordinate
var utexmapsampler;//this will be a pointer to our sampler2D for color
var unormalmapsampler; //this will be a pointer to our sampler2D for normal map
var uLightPosition;
var uAmbienLight;
var uLightColor;


//document elements
var canvas;

//interaction and rotation state
var xAngle;
var yAngle;
var mouse_button_down = false;
var prevMouseX = 0;
var prevMouseY = 0;
var zoom = 45;

//geometry

var squareverts;
var squareBufferID;

var flattex;
var brickcolortex;
var bricknormaltex;

var flatimage;
var brickcolorimage;
var bricknormalimage;

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2', {antialias:true});
    if (!gl) {
        alert("WebGL isn't available");
    }


    //allow the user to rotate mesh with the mouse
    canvas.addEventListener("mousedown", mouse_down);
    canvas.addEventListener("mousemove", mouse_drag);
    canvas.addEventListener("mouseup", mouse_up);


    //black background
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);


    program = initShaders(gl, "vshader-normal.glsl", "fshader-normal.glsl");

    gl.useProgram(program);
    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");
    uLightColor = gl.getUniformLocation(program, "light_color");
    uLightPosition = gl.getUniformLocation(program, "light_position");
    uAmbienLight = gl.getUniformLocation(program, "ambient_light");

    //TODO
    utexmapsampler = gl.getUniformLocation(program, "colorMap");
    //TODO
    gl.uniform1i(utexmapsampler, 0);//assign this one to texture unit 0
    //TODO
    unormalmapsampler = gl.getUniformLocation(program, "normalMap");
    //TODO
    gl.uniform1i(unormalmapsampler, 1);//assign normal map to 2nd texture unit


    //set up basic perspective viewing
    gl.viewport(0, 0, canvas.width, canvas.height);
    p = perspective(zoom, (canvas.width / canvas.height), 1, 20);
    gl.uniformMatrix4fv(uproj, false, flatten(p));


    initTextures();
    makeSquareAndBuffer();

    //initialize rotation angles
    xAngle = 0;
    yAngle = 0;

    window.addEventListener("keydown" ,function(event){
        switch(event.key) {
            case "ArrowDown":
                if(zoom < 170){
                    zoom += 5;
                }
                break;
            case "ArrowUp":
                if(zoom > 10){
                    zoom -= 5;
                }
                break;
        }

        p = perspective(zoom, (canvas.width / canvas.height), 1, 20);
        gl.uniformMatrix4fv(uproj, false, flatten(p));
        requestAnimationFrame(render);//and now we need a new frame since we made a change
    });

    requestAnimationFrame(render);

};




//Make a square and send it over to the graphics card
function makeSquareAndBuffer(){
    var squarePoints = []; //empty array

    //create 6 vertices and add them to the array
    squarePoints.push(vec4(-1, -1, 0, 1));
    squarePoints.push(vec4(0,0,1,0)); //normal vector
    //TODO
    squarePoints.push(vec4(1,0,0,0)); //tangent vector  For a perfectly flat square, the tangent direction is easy

    squarePoints.push(vec2(0,0)); //texture coordinates, bottom left
    squarePoints.push(vec4(1, -1, 0, 1));
    squarePoints.push(vec4(0,0,1,0)); //normal vector
    squarePoints.push(vec4(1,0,0,0)); //tangent vector
    squarePoints.push(vec2(1,0)); //texture coordinates, bottom right
    squarePoints.push(vec4(1, 1, 0, 1));
    squarePoints.push(vec4(0,0,1,0)); //normal vector
    squarePoints.push(vec4(1,0,0,0)); //tangent vector
    squarePoints.push(vec2(1,1)); //texture coordinates, top right
    squarePoints.push(vec4(-1, 1, 0, 1));
    squarePoints.push(vec4(0,0,1,0)); //normal vector
    squarePoints.push(vec4(1,0,0,0)); //tangent vector
    squarePoints.push(vec2(0,1)); //texture coordinates, top left

    //TODO I'm deleting the vertices to force you to read this
    // squarePoints = [];
    //The tangent direction for a sphere will not be the same as for a flat square like this
    //Please don't try to copy and paste this for a sphere and expect it to work

    //we need some graphics memory for this information
    var bufferId = gl.createBuffer();
    //tell WebGL that the buffer we just created is the one we want to work with right now
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squarePoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 56, 0); //stride is 56 bytes total for position, normal, tangent texcoord
    gl.enableVertexAttribArray(vPosition);

    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 56, 16);
    gl.enableVertexAttribArray(vNormal);

    vTangent = gl.getAttribLocation(program, "vTangent");
    gl.vertexAttribPointer(vTangent, 4, gl.FLOAT, false, 56, 32);
    gl.enableVertexAttribArray(vTangent);

    vTexCoord = gl.getAttribLocation(program, "texCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 56, 48);
    gl.enableVertexAttribArray(vTexCoord);

}

//update rotation angles based on mouse movement
function mouse_drag(){
    var thetaY, thetaX;
    if (mouse_button_down) {
        thetaY = 360.0 *(event.clientX-prevMouseX)/canvas.width;
        thetaX = 360.0 *(event.clientY-prevMouseY)/canvas.height;
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
        xAngle += thetaX;
        yAngle += thetaY;
    }
    requestAnimationFrame(render);
}

//record that the mouse button is now down
function mouse_down() {
    //establish point of reference for dragging mouse in window
    mouse_button_down = true;
    prevMouseX= event.clientX;
    prevMouseY = event.clientY;
    requestAnimationFrame(render);
}

//record that the mouse button is now up, so don't respond to mouse movements
function mouse_up(){
    mouse_button_down = false;
    requestAnimationFrame(render);
}

//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
function initTextures() {
    flattex = gl.createTexture();
    flatimage = new Image();
    flatimage.onload = function() { handleTextureLoaded(flatimage, flattex); }
    flatimage.src = 'flat.png';

    brickcolortex = gl.createTexture();
    brickcolorimage = new Image();
    brickcolorimage.onload = function() { handleTextureLoaded(brickcolorimage, brickcolortex); }
    brickcolorimage.src = 'brickwork-texture.jpg';

    bricknormaltex = gl.createTexture();
    bricknormalimage = new Image();
    bricknormalimage.onload = function() { handleTextureLoaded(bricknormalimage, bricknormaltex); }
    bricknormalimage.src = 'brickwork_normal-map.jpg';
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    var anisotropic_ext = gl.getExtension('EXT_texture_filter_anisotropic');
    gl.texParameterf(gl.TEXTURE_2D, anisotropic_ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


//draw a frame
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //position camera 10 units back from origin
    var camera = lookAt(vec3(0, 0, 5), vec3(0, 0, 0), vec3(0, 1, 0));

    //rotate if the user has been dragging the mouse around
    mv = mult(camera, mult(translate(2, 0, 0), mult(rotateY(yAngle), rotateX(xAngle))));

    //send the modelview matrix over
    gl.uniformMatrix4fv(umv, false, flatten(mv));



    gl.uniform4fv(uLightPosition, vec4(0, 0, 50, 1));  //light is locked to the camera position
    gl.uniform4fv(uLightColor, vec4(1,1,1,1));
    gl.uniform4fv(uAmbienLight, vec4(.1, .1, .1, 1));

    //TODO
    gl.activeTexture(gl.TEXTURE0);
    //TODO
    gl.bindTexture(gl.TEXTURE_2D, brickcolortex); //which texture do we want?
    //TODO
    gl.activeTexture(gl.TEXTURE1);
    //TODO
    gl.bindTexture(gl.TEXTURE_2D, flattex);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    mv = mult(camera, mult(translate(-2, 0, 0), mult(rotateY(yAngle), rotateX(xAngle))));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    //TODO
    gl.activeTexture(gl.TEXTURE1);
    //TODO
    gl.bindTexture(gl.TEXTURE_2D, bricknormaltex);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

}