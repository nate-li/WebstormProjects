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
var xOffset = 0;
var yOffset = 0;
var mouse_button_down = false;
var prevMouseX = 0;
var prevMouseY = 0;

//mesh vars
var meshVertexBufferID;
var indexBufferID;

var meshVertexData;
var indexData;

var positionData;
var triangleList = [];
var scalefactor = 10;
var vPosition;
var vNormal;

var treeDepth = 3;
var rootNode = new Node();
var collision = false;
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

    window.addEventListener("keydown", function(event){
        switch(event.key){
            case "w":
                yOffset+=.1;
                break;
            case "s":
                yOffset-=.1;
                break;
            case "a":
                xOffset-=.1;
                break;
            case "d":
                xOffset+=.1;
                break;
            case " ":
                //collision detection
                evaluateHit();
                if(collision === true){
                    document.getElementById("results").innerHTML = "Collision detected.";
                }else{
                    document.getElementById("results").innerHTML = "No hit.";
                }
                break;

        }
       requestAnimationFrame(render);
    });

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
    requestAnimationFrame(render);
};

/*
 * The collision detection method
 *  This currently does not work, but here is the methodology:
 *  we check the current position and evaluate each octant that falls within that position to see
 *  if there is any triangles in that octant to determine whether or not there woudl be a "collision"
 */
function evaluateHit(){
    //how far left/right are we from the origin?
    var originX = xOffset/scalefactor;
    var originY = yOffset/scalefactor;
    //this is how far away the camera is from the origin
    var originZ = 7/scalefactor;

    console.log("evaluating");
    //we are going to go to the other side of the screen in the z direction
    //every time we go through this loop, move further away from the camera
    for(var i = originZ; i > -7; i-=.01) {
        if(rootNode.xMin < originX && rootNode.xMax > originX
            && rootNode.yMin < originY && rootNode.yMax > originY
            && rootNode.zMin < i/scalefactor && rootNode.zMax > i/scalefactor){
            for (var j = 0; j < rootNode.children.length; j++) {
                    checkBounds(rootNode, originX, originY, i/scalefactor);
            }
        }else{
            hit = false;
        }
    }
}

function checkBounds(node, oX, oY, oZ){
    var checkMore = false;

    if(node.leafNode === true && node.triangleList !== []){
        //if the node is a leaf that has references to triangles we decide it is a collision
        collision = true;
    }else if(node.xMin < oX && node.xMax > oX
            && node.yMin < oY && node.yMax > oY
            && node.zMin < oZ && node.zMax > oZ) {
            //if the ray is in the bounds of the parent octant, we need to check children of the node.
        for(var i = 0; i < node.children.length; i++){
            if(node.children[i].hasChildren === true){
                checkMore = true;
                if(collision === false) {
                    checkBounds(node.children[i], oX, oY, oZ)
                }
            }
        }

    }
}

//This method kicks off the creation of the octree.
//It creates a 'root' node and starts the recursive call
function initializeOcTree(){
    rootNode.currentDepth = 0;
    rootNode.hasChildren = false;
    rootNode.xMin = -1;
    rootNode.xMax = 1;
    rootNode.yMin = -1;
    rootNode.yMax = 1;
    rootNode.zMin = -1;
    rootNode.zMax = 1;
    //-1 to 1 yields a total length of 2
    rootNode.length = 2;

    for(var i = 0; i < triangleList.length; i++){
        makeTree(rootNode, triangleList[i]);
    }
}

/*
The meat of the octree. It checks to see which level the current node is at, and either evaluates if the triangle
occupies any space in that octant or returns the leaf node if it is at the maximum depth.

In the case that it needs to continue evaluating, it first splits the current octant into 8 sub-octants.
Next, it goes through each triangle and determines whether or not the triangle has overlap in that octant.
If it does, we need to split it further so it makes a recursive call. Otherwise, it returns the current node and tells
the tree we are done creating that particular traversal.
 */
function makeTree(node, triangle){
    //first we need to check if there are children or not at this node level
    if (node.hasChildren === false ){//&& node.leafNode === false) {
        //if this is false, we know we have to split it up into 8 octants
        //the new length of the line segment will be half as long as the current
        //1 goes to .5, .5 goes to .25, etc
        var childLength = node.length * .5;
        /*
        the min values represent the lowest bound of the new octant
        each dimension will be split between
        node.minX to node.minX + childlength
        and
        node.minX + childlength to node.maxX

        The 8 child nodes are created to reflect the 8 different octant cases:
        */
        node.children.push(new Node(node.currentDepth, childLength, node.xMin, node.xMin + childLength, node.yMin, node.yMin + childLength, node.zMin, node.zMin + childLength)); //0x to 0y to 0z
        node.children.push(new Node(node.currentDepth, childLength, node.xMin, node.xMin + childLength, node.yMin, node.yMin + childLength, node.zMin + childLength, node.zMax)); //0x to 0y to .5z
        node.children.push(new Node(node.currentDepth, childLength, node.xMin, node.xMin + childLength, node.yMin + childLength, node.yMax, node.zMin, node.zMin + childLength)); //0x to .5y to 0z
        node.children.push(new Node(node.currentDepth, childLength, node.xMin, node.xMin + childLength, node.yMin + childLength, node.yMax, node.zMin + childLength, node.zMax)); //0x to .5y to .5z
        node.children.push(new Node(node.currentDepth, childLength, node.xMin + childLength, node.xMax, node.yMin, node.yMin + childLength, node.zMin, node.zMin + childLength)); //.5x to 0y to 0z
        node.children.push(new Node(node.currentDepth, childLength, node.xMin + childLength, node.xMax, node.yMin, node.yMin + childLength, node.zMin + childLength, node.zMax)); //.5x to 0y to .5z
        node.children.push(new Node(node.currentDepth, childLength, node.xMin + childLength, node.xMax, node.yMin + childLength, node.yMax, node.zMin, node.zMin + childLength)); //.5x to .5y to 0z
        node.children.push(new Node(node.currentDepth, childLength, node.xMin + childLength, node.xMax, node.yMin + childLength, node.yMax, node.zMin + childLength, node.zMax)); //.5x to .5y to .5z
        node.hasChildren = true;
    }

    //by now, the current node has children created or it is determined that the node in question already has children
    //we can now check them all to see which ones the triangle falls into
    var xOverlap;
    var yOverlap;
    var zOverlap;

    for (var j = 0; j < node.children.length; j++) {
        xOverlap = false;
        yOverlap = false;
        zOverlap = false;
        //does the triangle's xmin fall between the octant's xmin and xmax?
        if (triangle.minX > node.children[j].xMin && triangle.minX < node.children[j].xMax) {
            xOverlap = true;
        }
        //does the triangle's xmax fall between the octant's xmin and xmax?
        if (triangle.maxX > node.children[j].xMin && triangle.maxX < node.children[j].xMax) {
            xOverlap = true;
        }
        //does the triangle's ymin fall between the octant's ymin and ymax?
        if (triangle.minY > node.children[j].yMin && triangle.minY < node.children[j].yMax) {
            yOverlap = true;
        }
        //does the triangle's ymax fall between the octant's ymin and ymax?
        if (triangle.maxY > node.children[j].yMin && triangle.maxY < node.children[j].yMax) {
            yOverlap = true;
        }
        //does the triangle's zmin fall between the octant's zmin and zmax?
        if (triangle.minZ > node.children[j].zMin && triangle.minZ < node.children[j].zMax) {
            zOverlap = true;
        }
        //does the triangle's zmax fall between the octant's zmin and zmax?
        if (triangle.maxZ > node.children[j].zMin && triangle.maxZ < node.children[j].zMax) {
            zOverlap = true;
        }

        //in order to determine if there is any overlap, we must have at least 1 min or max of each dimension have "overlap" in each dimension
        //if this occurs, we need to go down to the next level of octants
        if (xOverlap && yOverlap && zOverlap) {
            if (node.currentDepth < treeDepth) {
                makeTree(node.children[j], triangle);
            } else {
                //if we've gotten this far, we know the node is a leaf node that has an overlapping triangle
                node.leafNode = true;
                node.triangles.push(triangle);
                //if the maximum level of nodes is reached, then we return.
                return;
            }
        }
    }
    node.leafNode = false;
}

//This represents an octant of the tree, it scales accordingly to its parent octant
function Node(depth, length, newxMin, newxMax, newyMin, newyMax, newzMin, newzMax){
    this.currentDepth = depth+1;
    //this is the length of all sides
    this.length = length;
    this.xMin = newxMin;
    this.xMax = newxMax;
    this.yMin = newyMin;
    this.yMax = newyMax;
    this.zMin = newzMin;
    this.zMax = newzMax;
    this.children = [];
    this.triangles = [];
    this.leafNode = true;
    this.hasChildren = false;
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
    this.minX = Math.min(this.vert1[0], this.vert2[0], this.vert3[0]);
    this.maxX = Math.max(this.vert1[0], this.vert2[0], this.vert3[0]);
    this.minY = Math.min(this.vert1[1], this.vert2[1], this.vert3[1]);
    this.maxY = Math.max(this.vert1[1], this.vert2[1], this.vert3[1]);
    this.minZ = Math.min(this.vert1[2], this.vert2[2], this.vert3[2]);
    this.maxZ = Math.max(this.vert1[2], this.vert2[2], this.vert3[2]);
}

/**
 * Parse string into list of vertices and triangles
 * Not robust at all, but simple enough to follow as an introduction
 * @param input string of ascii floats
 */
function createMesh(input){
    var numbers = input.split(/\s+/); //split on white space
    var numVerts = 35947;
    var numTris = 69451;
    positionData = [];

    //three numbers at a time for xyz
    for(var i = 0; i < 5*numVerts; i+= 5){
        positionData.push(vec4(parseFloat(numbers[i]), parseFloat(numbers[i+1]), parseFloat(numbers[i+2]), 1));
    }
    console.log("Position length: " + positionData.length);
    indexData = []; //empty out any previous data
    //three vertex indices per triangle
    for(var i = 5*numVerts; i < 5*numVerts + 4*numTris; i+=4){
        indexData.push(parseInt(numbers[i+1]));
        indexData.push(parseInt(numbers[i+2]));
        indexData.push(parseInt(numbers[i+3]));
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

    //point data for crosshairs
    meshVertexData.push(vec4(1, -1, 1, 1));
    meshVertexData.push(vec4(0,0,0,1));
    meshVertexData.push(vec4(1, 1, 1, 1));
    meshVertexData.push(vec4(0,0,0,1));
    meshVertexData.push(vec4(-1, 1, 1, 1));
    meshVertexData.push(vec4(0,0,0,1));
    meshVertexData.push(vec4(-1, -1, 1, 1));
    meshVertexData.push(vec4(0,0,0,1));


    generateTriangleObjects();
    initializeOcTree();

    //buffer vertex data and enable vPosition attribute
    meshVertexBufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, meshVertexBufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(meshVertexData), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0); //stride is 32 bytes total for position, normal
    gl.enableVertexAttribArray(vPosition);

    vNormal = gl.getAttribLocation(program, "vNormal");
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

    //position camera 7 units back from origin
    mv = lookAt(vec3(0, 0, 7), vec3(0, 0, 0), vec3(0, 1, 0));

    mv = mult(mv, translate(xOffset, yOffset, 0));
    var objectMV = mult(mv, scalem(scalefactor, scalefactor, scalefactor));
    //rotate if the user has been dragging the mouse around
    objectMV = mult(objectMV, mult(rotateY(yAngle), rotateX(xAngle)));


    //send the modelview matrix over
    gl.uniformMatrix4fv(umv, false, flatten(objectMV));

    //if we've loaded a mesh, draw it
    if(meshVertexData.length > 0) {

        //note that we're using gl.drawElements() here instead of drawArrays()
        //this allows us to make use of shared vertices between triangles without
        //having to repeat the vertex data.  However, if each vertex has additional
        //attributes like color, normal vector, texture coordinates, etc that are not
        //shared between triangles like position is, than this might cause problems
        gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

        var crosshairMV = mult(mv, translate(0, 0, -2));
        crosshairMV = mult(crosshairMV, scalem(.05, .5, .5));
        gl.uniformMatrix4fv(umv, false, flatten(crosshairMV));
    }
}