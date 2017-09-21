"use strict";
var gl;
var canvas;
var bufferId;
var program;
var color;
var ucolor;
var mode;
var xreverse;
var yreverse;
var xoffset;
var yoffset;
var squareList;
var hitList;
var directionXList;
var directionYList;
var xclick;
var yclick;


window.onload = function init(){
    window.setInterval(update, 16);
    mode = false;
    xreverse = false;
    yreverse = false;

    canvas=document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL isn't available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    color = vec4(1,1,1,1);
    ucolor = gl.getUniformLocation(program, "color");

    window.addEventListener("keydown" , function(event){
       if(event.key === "m") {
           if (mode) {
               mode = false;
           } else {
               mode = true;
           }
           if(getTargetsRemaining() === 0){
               gameOver();
           } else {
               document.getElementById("feedback").innerHTML = "You have " + getTargetsRemaining() + " target(s) remaining.";
           }
       }
        gl.uniform4fv(ucolor, color);
        requestAnimationFrame(render);
    });

    canvas.addEventListener("mousedown", mouseDownListener);

    makeShapeAndBuffer();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    crosshairMouse();
    render();
};

//render the squares
function makeShapeAndBuffer(){
    squareList = [];
    hitList = [];
    directionXList = [];
    directionYList = [];

    //the number of targets to render
    var numSquares = 6;


    for(var i = 0; i < numSquares; i++) {
        //give random starting position
        xoffset = Math.random() * (.9 - (-.9)) + (-.9);
        yoffset = Math.random() * (.9 - (-.9)) + (-.9);

        //set direction of square
        var xinterval = Math.random() * (.01 - (.005)) + (.005);
        var yinterval = Math.random() * (.01 - (.005)) + (.005);

        //push all the points, direction, and the fact that it hasn't been hit yet
        directionXList.push(xinterval);
        directionYList.push(yinterval);
        hitList.push(false);
        squareList.push(vec4(-0.1 + xoffset, -0.1 + yoffset, 0, 1));
        squareList.push(vec4(0.1 + xoffset, -0.1 + yoffset, 0, 1));
        squareList.push(vec4(0.1 + xoffset, 0.1 + yoffset, 0, 1));
        squareList.push(vec4(-0.1 + xoffset, 0.1 + yoffset, 0, 1));
    }

    bufferId = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squareList), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

//onclick see if a square has been hit
function mouseDownListener(event){
    //conversion
    var rect = canvas.getBoundingClientRect();
    var canvasY = event.clientY - rect.top;
    var flippedY = canvas.height - canvasY;

    yclick = 2*flippedY / canvas.height - 1;
    xclick = 2*(event.clientX - rect.left)/canvas.width-1;

    for(var i = 0; i < squareList.length; i = i + 4){
        //check to see if x coordinate is valid
        if((squareList[i][0] <= xclick) && (xclick <= squareList[i+2][0])){
            //check to see if y coordinate is valid
            if((squareList[i][1] <= yclick) && (yclick <= squareList[i+2][1])){
                hitList[i/4] = true;
                document.getElementById("feedback").innerHTML = "You have " + getTargetsRemaining() + " target(s) remaining.";
                if(getTargetsRemaining() === 0){
                    gameOver();
                }
            }
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squareList), gl.STATIC_DRAW);
    requestAnimationFrame(render);
}

function update(){
    //see if movement is enabled
    if(mode) {
        //loops through all squares
        for (var i = 0; i < squareList.length; i = i + 4) {
            var xchanged = false;
            var ychanged = false;

            //check to see if a direction needs to be changed
            for(var j = i; j < 4+i; j++){
                //check x direction
                if(((squareList[j][0] < -1) || (squareList[j][0] > 1)) && !xchanged){
                    directionXList[i/4] *= -1;
                    xchanged = true;
                }
                //check y direction
                if(((squareList[j][1] < -1) || (squareList[j][1] > 1)) && !ychanged) {
                    directionYList[i / 4] *= -1;
                    ychanged = true;
                }
            }

            //update positions of square coordinates
            for(var k = i; k < i+4; k++){
                squareList[k][0] += directionXList[i/4];
                squareList[k][1] += directionYList[i/4];
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(squareList), gl.STATIC_DRAW);
        requestAnimationFrame(render);
    }
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(var i = 0; i < squareList.length; i = i+4){
        if(!hitList[i/4]){
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        }
    }
}

function crosshairMouse(){
    document.getElementById("gl-canvas").style.cursor = "crosshair";
}

function getTargetsRemaining(){
    var count = 0;
    for(var i = 0; i < hitList.length; i++){
        if (!hitList[i]){
            count++;
        }
    }
        return count;
}

function gameOver(){
    document.getElementById("feedback").innerHTML = "Congratulations, you won!";
    document.getElementById("feedback").style.fontSize = "3em";
    document.getElementById("feedback").style.color = "green";
}

function startOver(){
    location.reload();
}