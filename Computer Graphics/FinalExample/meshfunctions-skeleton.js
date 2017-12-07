/**
 * Created by gosnat on 7/14/2017.
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

//document elements
var canvas;

//interaction and rotation state
var xAngle;
var yAngle;
var mouse_button_down = false;
var prevMouseX = 0;
var prevMouseY = 0;

//mesh vars
var meshVertexBufferID;
var indexBufferID;

var meshVertexData;
var indexData;

var positionData;
var triangleList;

var treeDepth = 5;

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2', {antialias:false});
    if (!gl) {
        alert("WebGL isn't available");
    }
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    //https://codepen.io/matt-west/pen/KjEHg
    var fileInput = document.getElementById("fileInput");
    fileInput.addEventListener('change', function(e){
        var file = fileInput.files[0];
        var textType = /text.*/;
        // if(file.type.match(textType)){

            var reader = new FileReader();
            reader.onload = function(e){
                createMesh(reader.result); //ok, we have our data, so parse it
                requestAnimationFrame(render); //ask for a new frame
            };
            reader.readAsText(file);
        // }else{
        //     console.log("File not supported: " + file.type + ".");
        // }
    });
    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////

    //allow the user to rotate mesh with the mouse
    canvas.addEventListener("mousedown", mouse_down);
    canvas.addEventListener("mousemove", mouse_drag);
    canvas.addEventListener("mouseup", mouse_up);

    //start as blank arrays
    meshVertexData = [];
    indexData = [];

    //white background
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    umv = gl.getUniformLocation(program, "mv");
    uproj = gl.getUniformLocation(program, "proj");

    //set up basic perspective viewing
    gl.viewport(0, 0, canvas.width, canvas.height);
    p = perspective(60, (canvas.width / canvas.height), 5, 500);
    gl.uniformMatrix4fv(uproj, false, flatten(p));

    //initialize rotation angles
    xAngle = 0;
    yAngle = 0;


};

function initializeOcTree(){
    var rootNode = new Node();
    rootNode.currentDepth = 0;
    rootNode.hasChildren = true;
    rootNode.xMin = -1;
    rootNode.xMax = 1;
    rootNode.yMin = -1;
    rootNode.yMax = 1;
    rootNode.zMin = -1;
    rootNode.zMax = 1;
    rootNode.length = 1;
    makeChildren(rootNode);
    /*
    For the first node, we assume it will have to create children.
    However, when we recursively create more, how do you handle children already existing?
    */
}

function makeChildren(node){
    if(currentDepth < treeDepth){
        //for each triangle
            for(var i = 0; i < triangleList.length; i++){
                //check if triangle is within the bounds of the node
                if((triangleList[i].xMax < node.xMax) && (triangleList[i].xMin > node.xMin)
                    && (triangleList[i].yMax < node.yMax) && (triangleList[i].yMin > node.yMin)
                    && (triangleList[i].zMax < node.zMax) && (triangleList[i].zMin > node.zMin)){
                    //first we need to check if there are children or not at this node level

                    //if this is false, we know we have to split it up into 8 octants
                    //how do we get the bounds of the new octants?
                    //8 possible cases, creates new octants

                    //if children already exist then load them
                    //
                    // check them all to see which ones the triangle falls into
                    // if the octant's min/maxes fall between the
                    




                    
                }
            }
    }else{
        return node;
    }
}

function Node(depth, pxMin, pxMax, pyMin, pyMax, pzMin, pzMax){
    this.currentDepth = depth+1;
    //this is the length of all sides
    this.length = Math.pow(.5, currentDepth);
    this.hasChildren = false;
    this.xMin = pxMin;
    this.xMax = pxMax;
    this.yMin = pyMin;
    this.yMax = pyMax;
    this.zMin = pzMin;
    this.zMax = pzMax;
    this.children = null;
}

function generateTriangleObjects(){
    for(var i = 0; i < indexData.length; i+=3){
        triangleList.push(new Triangle(i));
    }
}

function Triangle(i){
    this.vert1 = positionData[indexData[i]];
    this.vert2 = positionData[indexData[i+1]];
    this.vert3 = positionData[indexData[i+2]];

    /*
    Based on this...
        vert1[0] is X coordinate of first triangle point
        vert1[1] is Y coordinate of first triangle point
        vert1[2] is Z coordinate of first triangle point
    */

    //Now we need to find the minimum/maximum X, Y and Z values of the triangle
    this.minX = Math.min(vert1[0], vert2[0], vert3[0]);
    this.maxX = Math.max(vert1[0], vert2[0], vert3[0]);
    this.minY = Math.min(vert1[1], vert2[1], vert3[1]);
    this.maxY = Math.max(vert1[1], vert2[1], vert3[1]);
    this.minZ = Math.min(vert1[2], vert2[2], vert3[2]);
    this.maxZ = Math.max(vert1[2], vert2[2], vert3[2]);
}

function findMax(a, b, c){
    var max;
    if(a > b && a > c){
        max = a;
    }else if(b > c && b > a){
        max = b
    }else{
        max = c;
    }

    return max;
}

function findMin(a, b, c){
    var min;
    if(a < b && a < c){
        min = a;
    }else if(b < c && b < a){
        min = b
    }else{
        min = c;
    }

    return min;
}





/**
 * Parse string into list of vertices and triangles
 * Not robust at all, but simple enough to follow as an introduction
 * @param input string of ascii floats
 */
function createMesh(input){
    var numbers = input.split(/\s+/); //split on white space
    var numVerts = 35947; //first element is number of vertices
    var numTris = 69451; //second element is number of triangles
    positionData = [];

    //three numbers at a time for xyz
    for(var i = 0; i < 5*numVerts; i+= 5){
        positionData.push(vec4(parseFloat(numbers[i]), parseFloat(numbers[i+1]), parseFloat(numbers[i+2]), 1));
        // console.log(numbers[i] + ' ' + numbers[i+1] + ' ' + numbers[i+2]);
    }
    console.log("Position length: " + positionData.length);
    indexData = []; //empty out any previous data
    //three vertex indices per triangle
    // 5*numVerts + 4*numTris
    for(var i = 5*numVerts; i < 5*numVerts + 4*numTris; i+=4){
        indexData.push(parseInt(numbers[i+1]));
        indexData.push(parseInt(numbers[i+2]));
        indexData.push(parseInt(numbers[i+3]));
        // console.log(numbers[i] + ' ' + numbers[i+1] + ' ' + numbers[i+2] + ' ' + numbers[i+3]);
    }
    console.log("Index length: " + indexData.length);


    var normalVectors = [];

    for(var i = 0; i < positionData.length; i++) {
        normalVectors.push(vec4(0,0,0,0));
    }

    for(var i = 0; i < indexData.length; i+= 3) {
        var triLeg1 = normalize(vec3(subtract(positionData[indexData[i+1]], positionData[indexData[i]])));
        var triLeg2 = normalize(vec3(subtract(positionData[indexData[i+2]], positionData[indexData[i]])));
        var triNormal = vec4(normalize(cross(triLeg1, triLeg2)), 0);

        normalVectors[indexData[i]] = add(normalVectors[indexData[i]], triNormal);
        normalVectors[indexData[i]] = add(normalVectors[indexData[i+1]], triNormal);
        normalVectors[indexData[i]] = add(normalVectors[indexData[i+2]], triNormal);
    }


    for(var i = 0; i < normalVectors.length; i++) {
        normalVectors[i] = normalize(normalVectors[i]);
    }

    //This is used for rendering
    meshVertexData = [];
    for(var i = 0; i<positionData.length; i++) {
        meshVertexData.push(positionData[i]);
        meshVertexData.push(normalVectors[i]);
    }

    generateTriangleObjects();

    //buffer vertex data and enable vPosition attribute
    meshVertexBufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, meshVertexBufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(meshVertexData), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0); //stride is 32 bytes total for position, normal
    gl.enableVertexAttribArray(vPosition);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vNormal);

    //we could at this point go through the list and duplicate vertex data as needed, or we can
    //just buffer the list of indices and use drawElements() instead of drawArrays()

    indexBufferID = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferID);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    //note we have Uint16 so we have UNSIGNED_SHORT, which allows us 65k vertices.  If our mesh has more
    //than that we'll need to switch to an UNSIGNED_INT with 32 bits

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

//draw a frame
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //position camera 10 units back from origin
    mv = lookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    var scalefactor = 25;
    mv = mult(mv, scalem(scalefactor, scalefactor, scalefactor));
    //rotate if the user has been dragging the mouse around
    mv = mult(mv, mult(rotateY(yAngle), rotateX(xAngle)));

    //send the modelview matrix over
    gl.uniformMatrix4fv(umv, false, flatten(mv));

    //if we've loaded a mesh, draw it
    if(meshVertexData.length > 0) {

        //note that we're using gl.drawElements() here instead of drawArrays()
        //this allows us to make use of shared vertices between triangles without
        //having to repeat the vertex data.  However, if each vertex has additional
        //attributes like color, normal vector, texture coordinates, etc that are not
        //shared between triangles like position is, than this might cause problems
        gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

    }
}