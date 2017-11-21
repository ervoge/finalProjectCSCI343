//Christina Lovett
//November 10, 2017
//Assignment 7

var canvas;
var gl;
var NumVertices = 36;
var numTextures = 6;
var program;

var modelView = [];

var points = [];
var texCoords = [];
var texture = [];

var texCoord = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0)	
];
var projection;

var translations = [0,0,0];

var image = [ ];

var vertices = [
        vec3( -0.25, -0.25,  0.25 ), //0
        vec3( -0.5,  0.5,  0.5 ), //1
        vec3(  0.5,  0.5,  0.5 ), //2
        vec3(  0.25, -0.25,  0.25 ), //3
        vec3( -0.25, -0.25, -0.25 ), //4
        vec3( -0.5,  0.5, -0.25 ), //5
        vec3(  0.5,  0.5, -0.5 ), //6
        vec3(  0.25, -0.25, -0.25 )  //7
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta = [ 0, 0, -360];
var thetaLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

 	textureCube();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
	
	var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vTexCoord );
	
	modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation(program, "projection");

	
	//Initialize textures	
	initializeTexture(image, "tree.jpg", 0);
	initializeTexture(image, "tree.jpg", 1);
	initializeTexture(image, "tree.jpg", 2);
	initializeTexture(image, "tree.jpg", 3);
	initializeTexture(image, "tree.jpg", 4);
	initializeTexture(image, "tree.jpg", 5);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    //event listeners for buttons
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
        
    render();
}

function textureCube()
{
    texture_quad( 1, 0, 3, 2 );
    texture_quad( 2, 3, 7, 6 );
    texture_quad( 3, 0, 4, 7 );
    texture_quad( 6, 5, 1, 2 );
    texture_quad( 4, 5, 6, 7 );
    texture_quad( 5, 4, 0, 1 );
}

function texture_quad(a, b, c, d) 
{    
	points.push( vertices[a] );
    texCoords.push( texCoord[0] );
		
	points.push( vertices[b] );
    texCoords.push( texCoord[1] );
		
	points.push( vertices[c] );
    texCoords.push( texCoord[2] );
		
	points.push( vertices[a] );
    texCoords.push( texCoord[0] );
		
	points.push( vertices[c] );
    texCoords.push( texCoord[2] );
		
	points.push( vertices[d] );
    texCoords.push( texCoord[3] );
    
}

//configuring multiple textures
function configureTexture( image, id ) {
	texture[id] = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture[id] );
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
	gl.generateMipmap( gl.TEXTURE_2D );
	//dealing with mismatched scales
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

//loading in the image files into an array
function initializeTexture( myImage, fileName, id) {
	myImage[id] = new Image();
	myImage[id].onload = function() {
		configureTexture( myImage[id], id );
	}
	myImage[id].src = fileName;
}

function render()
{
    var pMatrix = perspective(45, 1.0, 1.0, 500.0);
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[axis] += 0;
    gl.uniform3fv(thetaLoc, theta);
    translations[2] = -7;
    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(translations[0], translations[1], translations[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));

	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
	    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

	//specifying textures
	for (var i = 0; i < numTextures; i++) {
		gl.bindTexture( gl.TEXTURE_2D, texture[i] );
		gl.drawArrays( gl.TRIANGLES, i*6, 6 ); //draw one side, for 6 sides
	}
    requestAnimFrame( render );
}

