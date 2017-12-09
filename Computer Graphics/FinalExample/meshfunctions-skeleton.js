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
var treeNode;

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

//This method kicks off the creation of the octree.
//It creates a 'root' node and starts the recursive call
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
    //-1 to 1 yields a total length of 2
    rootNode.length = 2;
    treeNode = makeTree(rootNode);
}

/*
The meat of the octree. It checks to see which level the current node is at, and either evaluates if the triangle
occupies any space in that octant or returns the leaf node if it is at the maximum depth.

In the case that it needs to continue evaluating, it first splits the current octant into 8 sub-octants.
Next, it goes through each triangle and determines whether or not the triangle has overlap in that octant.
If it does, we need to split it further so it makes a recursive call. Otherwise, it returns the current node and tells
the tree we are done creating that particular traversal.
 */
function makeTree(node){
    if(currentDepth < treeDepth){
        //for each triangle
        for(var i = 0; i < triangleList.length; i++){
            //first we need to check if there are children or not at this node level
            if(!node.hasChildren){
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
                node.children.push(new Node(node.currentDepth, childLength, node.minX, node.minX+childLength, node.minY, node.minY+childLength, node.minZ, node.minZ+childLength)); //0x to 0y to 0z
                node.children.push(new Node(node.currentDepth, childLength, node.minX, node.minX+childLength, node.minY, node.minY+childLength, node.minZ+childLength, node.maxZ)); //0x to 0y to .5z
                node.children.push(new Node(node.currentDepth, childLength, node.minX, node.minX+childLength, node.minY+childLength, node.maxY, node.minZ, node.minZ+childLength)); //0x to .5y to 0z
                node.children.push(new Node(node.currentDepth, childLength, node.minX, node.minX+childLength, node.minY+childLength, node.maxY, node.minZ+childLength, node.maxZ)); //0x to .5y to .5z
                node.children.push(new Node(node.currentDepth, childLength, node.minX+childLength, node.maxX, node.minY, node.minY+childLength, node.minZ, node.minZ+childLength)); //.5x to 0y to 0z
                node.children.push(new Node(node.currentDepth, childLength, node.minX+childLength, node.maxX, node.minY, node.minY+childLength, node.minZ+childLength, node.maxZ)); //.5x to 0y to .5z
                node.children.push(new Node(node.currentDepth, childLength, node.minX+childLength, node.maxX, node.minY+childLength, node.maxY, node.minZ, node.minZ+childLength)); //.5x to .5y to 0z
                node.children.push(new Node(node.currentDepth, childLength, node.minX+childLength, node.maxX, node.minY+childLength, node.maxY, node.minZ+childLength, node.maxZ)); //.5x to .5y to .5z
                node.hasChildren = true;
            }

            //by now, the current node has children created or it is determined that the node in question already has children
            //we can now check them all to see which ones the triangle falls into
            var xOverlap = false;
            var yOverlap = false;
            var zOverlap = false;

            for(var j = 0; j < node.children.length; j++){
                //does the triangle's xmin fall between the octant's xmin and xmax?
                if (triangleList[i].minX > node.children[j].xMin && triangleList[i].minX < node.children[j].xMax){
                    xOverlap = true;
                }
                //does the triangle's xmax fall between the octant's xmin and xmax?
                if (triangleList[i].maxX > node.children[j].xMin && triangleList[i].maxX < node.children[j].xMax){
                    xOverlap = true;
                }
                //does the triangle's ymin fall between the octant's ymin and ymax?
                if (triangleList[i].minY > node.children[j].yMin && triangleList[i].minY < node.children[j].yMax){
                    yOverlap = true;
                }
                //does the triangle's ymax fall between the octant's ymin and ymax?
                if (triangleList[i].maxY > node.children[j].yMin && triangleList[i].maxY < node.children[j].yMax){
                    yOverlap = true;
                }
                //does the triangle's zmin fall between the octant's zmin and zmax?
                if (triangleList[i].minZ > node.children[j].zMin && triangleList[i].minZ < node.children[j].zMax){
                    zOverlap = true;
                }
                //does the triangle's zmax fall between the octant's zmin and zmax?
                if (triangleList[i].maxZ > node.children[j].zMin && triangleList[i].maxZ < node.children[j].zMax){
                    zOverlap = true;
                }

                //in order to determine if there is any overlap, we must have at least 1 min or max of each dimension have "overlap" in each dimension
                //if this occurs, we need to go down to the next level of octants
                if(xOverlap && yOverlap && zOverlap){
                    node = makeTree(node);
                }else{
                    node.leafNode = true;
                    node.triangles.push(triangleList[i]);
                    return node;
                }


            }
        }
    }else{
        //if we've gotten this far, we know the node is a leaf node.
        node.leafNode = true;
        //if the maximum level of nodes is reached, then we return the node with the information of the previous node's children
        return node;
    }
}

//This represents an octant of the tree, it scales accordingly to its parent octant
function Node(depth, newxMin, newxMax, newyMin, newyMax, newzMin, newzMax){
    this.currentDepth = depth+1;
    //this is the length of all sides
    this.length = length;
    this.hasChildren = false;
    this.xMin = newxMin;
    this.xMax = newxMax;
    this.yMin = newyMin;
    this.yMax = newyMax;
    this.zMin = newzMin;
    this.zMax = newzMax;
    this.children = null;
    this.triangles = null;
    this.leafNode = false;

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