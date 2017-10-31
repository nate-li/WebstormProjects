/**
 * Created by gosnat on 7/14/2017.
 */

"use strict";
var gl;
var program; //this is going to be an array instead of just a single program
var NUM_PROGRAMS = 2; //at first we only have one program, but we'll eventually have more
var activeProgram; //we'll demonstrate how to switch between shader programs
var UNLIT = 0; //This is so we can give a name to the shader program at index 0
var GOURAUD = 1;
//uniform locations

var umv; //uniform for mv matrix
var uproj; //uniform for projection matrix

//local copies of these matrices
var mv; //local mv
var p; //local projection

//shader variable indices for per vertex and material attributes
var vPosition; //
var vNormal;
var vAmbientDiffuseColor; //Ambient and Diffuse can be the same for the material
var vSpecularColor; //highlight color
var vSpecularExponent;

//uniform indices for light properties
//TODO
var light_position;
var light_color;
var ambient_light;

//document elements
var canvas;

//interaction and rotation state
var xAngle;
var yAngle;
var mouse_button_down = false;
var prevMouseX = 0;
var prevMouseY = 0;

//mesh vars
var sphereverts; //local copy of vertex data
var sphereBufferID; //buffer id

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL isn't available");
    }


    //allow the user to rotate mesh with the mouse
    canvas.addEventListener("mousedown", mouse_down);
    canvas.addEventListener("mousemove", mouse_drag);
    canvas.addEventListener("mouseup", mouse_up);

    //white background
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //initialize rotation angles
    xAngle = 0;
    yAngle = 0;

    program = [];
    program.push(initShaders(gl, "vshader-unlit.glsl", "fshader-unlit.glsl"));
    program.push(initShaders(gl, "vshader-lighting.glsl", "fshader-lighting.glsl"));
    program.push(initShaders(gl, "vshader-phong.glsl", "fshader-phong.glsl"));
    //eventually we're going to add additional shader programs here
    //note that these are located in .glsl files, so we're using InitShaders2.js
    //Also note that we'll need to be using a local web server rather than just loading it off the harddrive to make
    //the browser happy with external .glsl files

    //Eventually we're going to have to store references to these attributes an uniforms in many different shaders
    //TODO
    umv = [];
    uproj = [];
    vPosition = [];
    vNormal = [];
    vAmbientDiffuseColor = [];
    vSpecularColor = [];
    vSpecularExponent = [];
    light_position = [];
    light_color = [];
    ambient_light = [];
    for(var i = 0; i < NUM_PROGRAMS; i++){
        gl.useProgram(program[i]);
        umv.push(gl.getUniformLocation(program[i], "model_view"));
        uproj.push(gl.getUniformLocation(program[i], "projection"));
        vPosition.push(gl.getAttribLocation(program[i], "vPosition"));
        vNormal.push(gl.getAttribLocation(program[i], "vNormal"));
        vAmbientDiffuseColor.push(gl.getAttribLocation(program[i], "vAmbientDiffuseColor"));
        vSpecularColor.push(gl.getAttribLocation(program[i], "vSpecularColor"));
        vSpecularExponent.push(gl.getAttribLocation(program[i], "vSpecularExponent"));
        light_position.push(gl.getUniformLocation(program[i], "light_position"));
        light_color.push(gl.getUniformLocation(program[i], "light_color"));
        ambient_light.push(gl.getUniformLocation(program[i], "ambient_light"));
    }


    //get our sphere, 15 slices around the circle
    generateSphere(15);

    switchShaders(UNLIT); //start with the unlit shader

};

function switchShaders(index){
    //There are a variety of ways to accomplish this, but this way is pretty straightforward
    //note that we don't re-buffer the data, simply connect the existing buffer to a different shader program

    //switch to the new program
    gl.useProgram(program[index]);
    activeProgram = index; //and remember which program is active

    //set up basic perspective viewing and make sure the new shader gets it
    gl.viewport(0, 0, canvas.width, canvas.height);
    p = perspective(60, (canvas.width / canvas.height), 5, 500);
    gl.uniformMatrix4fv(uproj[index], false, flatten(p));


    //Set up the connections between vertex attributes and buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBufferID);

    gl.vertexAttribPointer(vPosition[activeProgram], 4, gl.FLOAT, false, 32, 0); //stride is 32 bytes total for position, normal
    gl.enableVertexAttribArray(vPosition[activeProgram]);

    if(activeProgram != 0) { //the normal vector isn't used in our unlit program
        gl.vertexAttribPointer(vNormal[activeProgram], 4, gl.FLOAT, false, 32, 16);
        gl.enableVertexAttribArray(vNormal[activeProgram]);
    }
}

//***********************************************
//TODO HEY! READ THIS!
//In this particular case, our normal vectors and vertex vectors are identical since the sphere is centered at the origin
//For most objects this won't be the case, so I'm treating them as separate values for that reason
//This could also be done as separate triangle strips, but I've chosen to make them just triangles so I don't
//have to execute multiple glDrawArrays() commands
//***********************************************
function generateSphere(subdiv){

    var step = (360.0 / subdiv)*(Math.PI / 180.0); //how much do we increase the angles by per triangle?
    sphereverts = [];
        
    for (var lat = 0; lat <= Math.PI ; lat += step){ //latitude
        for (var lon = 0; lon + step <= 2*Math.PI; lon += step){ //longitude
            //triangle 1
            sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 1.0)); //position
            sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 0.0)); //normal
            sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon+step), Math.sin(lat)*Math.sin(lon+step), Math.cos(lat), 1.0)); //position
            sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon+step), Math.sin(lat)*Math.sin(lon+step), Math.cos(lat), 0.0)); //normal
            sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 1.0)); //etc
            sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 0.0));

            //triangle 2
            sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 1.0));
            sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon+step), Math.sin(lon+step)*Math.sin(lat+step), Math.cos(lat+step), 0.0));
            sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon), Math.sin(lat+step)*Math.sin(lon), Math.cos(lat+step), 1.0));
            sphereverts.push(vec4(Math.sin(lat+step)*Math.cos(lon), Math.sin(lat+step)*Math.sin(lon), Math.cos(lat+step),0.0));
            sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 1.0));
            sphereverts.push(vec4(Math.sin(lat)*Math.cos(lon), Math.sin(lon)*Math.sin(lat), Math.cos(lat), 0.0));
        }
    }

    //and send it over to graphics memory
    sphereBufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereverts), gl.STATIC_DRAW);

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

window.addEventListener("keydown" ,function(event){
    switch(event.key) {
        case "g":
            switchShaders(GOURAUD);
            break;
        case "p":
            switchShaders(PHONG);
            break;
        case "u":
            switchShaders(PHONG_UNPROTECT);
            break;
        case "c": //random color
            switchShaders(CEL);
            break;
        default:
            switchShaders(UNLIT);
    }
    requestAnimationFrame(render);//and now we need a new frame since we made a change
});

//draw a frame
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //position camera 10 units back from origin
    mv = lookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));

    //rotate if the user has been dragging the mouse around
    mv = mult(mv, mult(rotateY(yAngle), rotateX(xAngle)));

    //send the modelview matrix over
    gl.uniformMatrix4fv(umv[activeProgram], false, flatten(mv));

    //note that if we have one value that should be applied to all the vertices,
    //we can send it over just once even if it's an attribute and not a uniform
    gl.vertexAttrib4fv(vAmbientDiffuseColor[activeProgram], vec4(.5, 0, 0, 1));

    if(activeProgram != 0) { //if we actually have lights
        gl.vertexAttrib4fv(vSpecularColor[activeProgram], vec4(1.0, 1.0, 1.0, 1.0));
        gl.vertexAttrib1f(vSpecularExponent[activeProgram], 30.0);
        gl.uniform4fv(light_position[activeProgram], mult(mv, vec4(50, 50, 50, 1)));
        gl.uniform4fv(light_color[activeProgram], vec4(1, 1, 1, 1));
        gl.uniform4fv(ambient_light[activeProgram], vec4(.5, .5, .5, 5));
    }
    gl.drawArrays(gl.TRIANGLES, 0, sphereverts.length/2)
}