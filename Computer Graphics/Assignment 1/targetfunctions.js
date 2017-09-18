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

function makeShapeAndBuffer(){
    squareList = [];
    hitList = [];
    var numSquares = 3;


    for(var i = 0; i < numSquares; i++) {
        xoffset = Math.random() * (.9 - (-.9)) + (-.9);
        yoffset = Math.random() * (.9 - (-.9)) + (-.9);

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

function mouseDownListener(event){
    var rect = canvas.getBoundingClientRect();
    var canvasY = event.clientY - rect.top;
    var flippedY = canvas.height - canvasY;

    yclick = 2*flippedY / canvas.height - 1;
    xclick = 2*(event.clientX - rect.left)/canvas.width-1;

    for(var i = 0; i < squareList.length; i = i + 4){
        if((squareList[i][0] <= xclick) && (xclick <= squareList[i+2][0])){
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

    if(mode) {
        for (var i = 0; i < squareList.length; i = i + 4) {


            for(var j = i; j < 4+i; j++){
                // var xreverse;
                // var yreverse;
                if(squareList[j][0] < -1){
                    xreverse = true;
                }
                if(squareList[j][1] < -1){
                    yreverse = true;
                }
                if(squareList[j][0] > 1){
                    xreverse = false;
                }
                if(squareList[j][1] > 1){
                    yreverse = false;
                }
            }

            var xinterval;
            var yinterval;

            if (xreverse) {
                xinterval = .01;
            } else {
                xinterval = -.01;
            }

            if (yreverse) {
                yinterval = .01;
            } else {
                yinterval = -.01;
            }

            for(var k = i; k < 4+i; k++){
                squareList[k][0] += xinterval;
                squareList[k][1] += yinterval;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(squareList), gl.STATIC_DRAW);
            requestAnimationFrame(render);
        }
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