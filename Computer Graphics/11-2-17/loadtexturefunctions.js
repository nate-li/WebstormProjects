/**
 * Created by gosnat on 11/1/2017.
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
var vTexCoord;
var uTextureSampler;//this will be a pointer to our sampler2D


//document elements
var canvas;

//interaction and rotation state
var xAngle;
var yAngle;
var mouse_button_down = false;
var prevMouseX = 0;
var prevMouseY = 0;
var zoom = 45;

//texture object references
var domotex;
var alpacatex;
var logotex;

//The actual image data we load from the file
var domoimage;
var alpacaimage;
var logoimage;

var anisotropic_ext;
var factor = 8;

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

    //same shaders as before
    program = initShaders(gl, "vshader-texture.glsl", "fshader-texture.glsl");

    gl.useProgram(program);
    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");
    uTextureSampler = gl.getUniformLocation(program, "textureSampler");//get reference to sampler2D

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
            case 1:
                factor = 1;
                break;
            case 4:
                factor = 4;
                break;
            case 8:
                factor = 8;
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
    squarePoints.push(vec2(0,0)); //texture coordinates, bottom left
    squarePoints.push(vec4(1, -1, 0, 1));
    squarePoints.push(vec2(1,0)); //texture coordinates, bottom right
    squarePoints.push(vec4(1, 1, 0, 1));
    squarePoints.push(vec2(1,1)); //texture coordinates, top right
    squarePoints.push(vec4(-1, 1, 0, 1));
    squarePoints.push(vec2(0,1)); //texture coordinates, top left

    //we need some graphics memory for this information
    var bufferId = gl.createBuffer();
    //tell WebGL that the buffer we just created is the one we want to work with right now
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squarePoints), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 24, 0); //stride is 24 bytes total for position, texcoord
    gl.enableVertexAttribArray(vPosition);

    vTexCoord = gl.getAttribLocation(program, "texCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 24, 16); //stride is 24 bytes total for position, texcoord
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
    //TODO
    domotex = gl.createTexture();
    domoimage = new Image();
    domoimage.onload = function() { handleTextureLoaded(domoimage, domotex); }
    domoimage.src = 'domokun.png';

    alpacatex = gl.createTexture();
    alpacaimage = new Image();
    alpacaimage.onload = function() { handleTextureLoaded(alpacaimage, alpacatex); }
    alpacaimage.src = 'Earth.png';

    logotex = gl.createTexture();
    logoimage = new Image();
    logoimage.onload = function() { handleTextureLoaded(logoimage, logotex); }
    logoimage.src = 'opengl.png';
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);  //disagreement over whether positive y goes up or down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //TODO
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.texParmeteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR));//gl.NEAREST); //if you want to see some aliasing
    anisotropic_ext = gl.getExtension('EXT_texture_filter_anisotropic');
    gl.texParameterf(gl.TEXTURE_2D, anisotropic_ext.TEXTURE_MAX_ANISOTROPY_EXT, factor);
    gl.bindTexture(gl.TEXTURE_2D, null); //we aren't bound to any textures now
}


//draw a frame
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //position camera 10 units back from origin
    mv = lookAt(vec3(0, 0, 5), vec3(0, 0, 0), vec3(0, 1, 0));

    //rotate if the user has been dragging the mouse around
    var camera = mv = mult(mv, mult(rotateY(yAngle), rotateX(xAngle)));

    //send the modelview matrix over
    gl.uniformMatrix4fv(umv, false, flatten(mv));


    //make sure the appropriate texture is sitting on texture unit 0
    gl.activeTexture(gl.TEXTURE0); //we're using texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, domotex); //we want domokun on that texture unit for the next object drawn
    //when the shader runs, the sampler2D will want to know what texture unit the texture is on
    //It's on texture unit 0, so send over the value 0
    gl.uniform1i(uTextureSampler, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // mv = mult(camera, mult(rotateY(90), translate(0,0,1)));
    // gl.uniformMatrix4fv(umv, false, flatten(mv));
    // gl.bindTexture(gl.TEXTURE_2D, alpacatex); //we're still talking about texture unit 0, but we want an alpaca on the next object drawn
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    //
    // //the next texture has some transparency, so we are drawing it last with blending turned on
    // gl.depthMask(false);//doesn't really matter in this example, but generally when drawing transparent objects, disable writing to the
    //                     //depth buffer since this object shouldn't occlude other objects that come along later
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    //
    // mv = mult(camera, mult(rotateY(-90), translate(0,0,1)));
    // gl.uniformMatrix4fv(umv, false, flatten(mv));
    // gl.bindTexture(gl.TEXTURE_2D, logotex); //we're still talking about texture unit 0, but we want a logo on the next object drawn
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    //
    // //turn blending back off
    // gl.disable(gl.BLEND);
    // gl.depthMask(true); //allow writing to the depth buffer again

}