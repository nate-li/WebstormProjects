var gl;
var canvas;
var program;
var newColor;
var ucolor;

window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL isn't there");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    newColor = vec4(1,1,1,1);//white
    ucolor = gl.getUniformLocation(program, "newColor");

    window.addEventListener("keydown", function(event) {
        switch (event.key) {
            case "r":
                newColor = vec4(1, 0, 0, 1);
                break;
            case "g":
                newColor = vec4(0, 1, 0, 1);
                break;
            case "b":
                newColor = vec4(0, 0, 1, 1);
                break;
            case "c":
                newColor = vec4(Math.random(), Math.random(), Math.random(), 1);
                break;
        }

        gl.uniform4fv(ucolor, newColor);
        requestAnimationFrame(render);
    });

    window.addEventListener("mousedown", function(event) {
        var rect = canvas.getBoundingClientRect();

        var canvasY = event.clientY - rect.top;
        var flippedY = canvas.height - canvasY;




    });


    makeTriangleAndBuffer();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    render();
};

function makeTriangleAndBuffer(){
    var trianglePoints = [];

    trianglePoints.push(vec4(-0.5, -0.5, 0, 1));
    trianglePoints.push(vec4(1, 0, 0, 1)); //red

    trianglePoints.push(vec4(0, 0.5, 0, 1));
    trianglePoints.push(vec4(0, 1, 0, 1)); //green

    trianglePoints.push(vec4(0.5, -0.5, 0, 1));
    trianglePoints.push(vec4(0, 0, 1, 1)); //blue

    var bufferID = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trianglePoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}