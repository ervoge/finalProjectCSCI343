//Christina Lovett and Emily Vogelsperger
//December 4, 2017
//Final Project

var canvas;
var gl;
var program;

var modelView = [];

var points = [];
var pointsRect = [];
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
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
];

var numFish = 9;
var randPos = []; //array to generate random perspective positions for the boxes
var randMove = [ 0.0, -0.3, 1.2, -0.7, 0.5, 0.7, 0.4, 0.1, -0.4, 0.2 ];
var randSpeed = [ 0.02, 0.03, 0.01, 0.04, 0.03, 0.01, 0.05, 0.02, 0.01, 0.03 ]; //array to generate random speeds for the boxes
var targetMove = []; //array to keep track of boxes' positions
var direction = []; //variable used to move the cubes smoothly from side to side

//variables used to move the camera
var zCamera = 0.0; //to move the camera along the Z axis
var zPerspec = 0.0; //to increment the perspective projection as you move forward

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

	initializeTargetMove();
	initializeDirection();

 	textureCube();

	calcRandPosition(); //makes randPos array
	calcRandMove(); //makes randMove array


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

	//fish textures
	//pufferfish
	initializeTexture(image, "puffer-fish.jpg", 0);

	//jellyfish
	initializeTexture(image, "jellyfish.jpg", 1);

	//sunfish
	initializeTexture(image, "fish3.jpg", 2);

	//underwater world textures
	//texture for the top of the underwater box/surface of the water
	initializeTexture(image, "waves.jpg", 3);

	//texture for the sides of the underwater box
	initializeTexture(image, "blue.jpg", 4);

	//texture for the floor of the underwater box
	initializeTexture(image, "sand.jpg", 5);

	//sunset textures
	//texture for the sunset (far side of the cube)
	initializeTexture(image, "sunset.jpg", 6);

	//texture for the other 3 sides of the cube
	initializeTexture(image, "sunsetSide.jpg", 7);

	//texture for the top of the cube
	initializeTexture(image, "sunsetTop.jpg", 8);

  //event listeners for button
	//button to reset the scene
  window.onkeydown = keyResponse;
	document.getElementById("New Fish").onclick = function(){location.reload(true)};

    render();
}

function keyResponse(event) {
	var key = String.fromCharCode(event.keyCode);
	switch (key) {

        case 'Q':
            translations[1] += 0.1;
            break;
        case 'E':
            translations[1] -= 0.1;
            break;
        case 'A':
						//xCamera += 0.01;
            translations[0] += 0.1;
            break;
        case 'D':
            translations[0] -= 0.1;
            break;
				case 'W':
						zCamera += 0.1;
						zPerspec += 0.20; //to move the boxes with regards to perspective projection
						break;
				case 'S':
						zCamera -= 0.1;
						zPerspec -= 0.20; //to move the boxes with regards to perspective projection
						break;
	}
}

//builds the 3D cube
function textureCube()
{
    texture_quad( 1, 0, 3, 2 );
    texture_quad( 2, 3, 7, 6 );
    texture_quad( 3, 0, 4, 7 );
    texture_quad( 6, 5, 1, 2 );
    texture_quad( 4, 5, 6, 7 );
    texture_quad( 5, 4, 0, 1 );
}

//adds the texture points as you push the cube's points
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
}//end of initializeTexture()

//Calculates an array of random numbers between 1 and 10 for the
//perspective position of the boxes
function calcRandPosition(){
	for(var i = 0; i < numFish; i++){
		var randVal = (Math.floor((Math.random() * 10) + 1)); //calculate a random value
		if(randVal%2 == 0){
			randPos[i] = -1*(randVal); //if it's even, multiply by -1
		}
		else{
			randPos[i] = randVal; //if it's odd, leave it
		}
	}
}//end of calcRandPosition()

//Calculates an array of random numbers between .1 and 1 for the
//random X axis positioning of the boxes
function calcRandMove(){
	for(var i = 0; i < numFish; i++){

		if(i%2 == 0){
			randMove[i] = ((Math.floor((Math.random()*10 + 1)))*.1);
		}
		else{
			randMove[i] = (-1*(Math.floor((Math.random()*10 + 1)))*.1);
		}
	}
}//end of calcRandMove()

//Calculates an array of random numbers between .01 and .1 for the
//random number to increment the boxes' movement by--the speed
function calcRandSpeed(){
	for(var i = 0; i < numFish; i++){
		randSpeed[i] = 0.02;
		//randSpeed[i] = ((Math.floor(Math.random()*10 + 1))*.001);
	}
}//end of calcRandSpeed()

//initializes array as all zeros according to how many fish there are
function initializeTargetMove(){
	for(var i = 0; i < numFish; i++){
		targetMove[i] = 0.0;
	}
}//end of initializeTargetMove()

//initializes direction array as all true according to how many fish there are
function initializeDirection(){
	for(var i = 0; i < numFish; i++){
		direction[i] = true;
	}
}//end of initializeDirection()


function render()
{
		var pMatrix = perspective(45, 1.0, 1.0, 500.0);


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Generates random cubes that move along the X axis
		//puffer-fish.jpg - puffer-fish
		for(var i = 0; i < (numFish/3); i++){

			if(targetMove[i] >= 4.0){
				direction[i] = false;
			}

			if(targetMove[i] <= -4.0){
				direction[i] = true;
			}

			if(direction[i]){
				targetMove[i] += randSpeed[i];
			}
			else{
				targetMove[i] -= randSpeed[i];
			}

			translations[2] = randPos[i];
			mvMatrix = mat4();
			mvMatrix = mult(mvMatrix, translate((translations[0] + randMove[i] + targetMove[i]), (translations[1] + (.02)*i), (translations[2] + zPerspec)));

			gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
			gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

			gl.bindTexture( gl.TEXTURE_2D, texture[0] );
			gl.drawArrays( gl.TRIANGLES, 0, 36 );
		}

		//Generates random cubes that move along the Y axis
		//jellyfish.jpg - jellyfish
		for(var i = (numFish/3); i < ((numFish/3)*2); i++){

			if(targetMove[i] >= 2.0){
				direction[i] = false;
			}

			if(targetMove[i] <= -2.0){
				direction[i] = true;
			}

			if(direction[i]){
				targetMove[i] += randSpeed[i];
			}
			else{
				targetMove[i] -= randSpeed[i];
			}

			translations[2] = randPos[i];
			mvMatrix = mat4();
			mvMatrix = mult(mvMatrix, translate((translations[0] + randMove[i]), (translations[1] + targetMove[i]), (translations[2] + zPerspec)));

			gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
			gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

			gl.bindTexture( gl.TEXTURE_2D, texture[1] );
			gl.drawArrays( gl.TRIANGLES, 0, 36 );
		}

		//generates random cubes that move diagonally
		//fish3.jpg - sunfish
		for(var i = ((numFish/3)*2); i < numFish; i++){

			if(targetMove[i] >= 2.0){
				direction[i] = false;
			}

			if(targetMove[i] <= -2.0){
				direction[i] = true;
			}

			if(direction[i]){
				targetMove[i] += randSpeed[i];
			}
			else{
				targetMove[i] -= randSpeed[i];
			}

			translations[2] = randPos[i];
			mvMatrix = mat4();
			mvMatrix = mult(mvMatrix, translate((translations[0] + randMove[i] + targetMove[i]), (translations[1] + targetMove[i]), (translations[2] + zPerspec)));

			gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
			gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

			gl.bindTexture( gl.TEXTURE_2D, texture[2] );
			gl.drawArrays( gl.TRIANGLES, 0, 36 );
		}

		//underwater box to fit the world under the water
		translations[2] = 0;
		mvMatrix = mat4( );
		mvMatrix = mult(mvMatrix, translate(translations[0], translations[1], (translations[2] + zCamera)));
		mvMatrix = mult(mvMatrix, scalem(10.0, 5.0, 20.0));

		gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
		gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

		//specifying textures for the scenery
		gl.bindTexture( gl.TEXTURE_2D, texture[4] ); //side -> blue.jpg
		gl.drawArrays( gl.TRIANGLES, 0, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[4] ); //side -> blue.jpg
		gl.drawArrays( gl.TRIANGLES, 6, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[5] ); //floor -> sand.jpg
		gl.drawArrays( gl.TRIANGLES, 12, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[3] ); //top -> waves.jpg
		gl.drawArrays( gl.TRIANGLES, 18, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[4] ); //side -> blue.jpg
		gl.drawArrays( gl.TRIANGLES, 24, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[4] ); //side -> blue.jpg
		gl.drawArrays( gl.TRIANGLES, 30, 6 );


		//drawing sunset texture map
		translations[2] = 0;
		mvMatrix = mat4( );
		mvMatrix = mult(mvMatrix, translate(translations[0], (translations[1] + 5.0), (translations[2] + zCamera)));
		mvMatrix = mult(mvMatrix, scalem(10.0, 5.0, 20.0));

		gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
		gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

		//specifying textures for the scenery above the water
		gl.bindTexture( gl.TEXTURE_2D, texture[7] ); //side -> sunsetSide.jpg
		gl.drawArrays( gl.TRIANGLES, 0, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[7] ); //side -> sunsetSide.jpg
		gl.drawArrays( gl.TRIANGLES, 6, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[3] ); //floor -> waves.jpg
		gl.drawArrays( gl.TRIANGLES, 12, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[8] ); //top -> sunsetTop.jpg
		gl.drawArrays( gl.TRIANGLES, 18, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[6] ); //sunset -> sunset.jpg
		gl.drawArrays( gl.TRIANGLES, 24, 6 );

		gl.bindTexture( gl.TEXTURE_2D, texture[7] ); //side -> sunsetSide.jpg
		gl.drawArrays( gl.TRIANGLES, 30, 6 );

    requestAnimFrame( render );
}
