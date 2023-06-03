var width = 420;
var height = 630;
var gapWidth = width/6;
var gapHeight = height/9;
var turnCount = 0;
var gameSpeed = 300;
var gameTimer;
var isGameOver = false;
var counterAnimate = 0;
var flag = false;

var countMatrix;
var colorMatrix;
var undoCount;
var undoColor;

var canvas;
var button;
var sound;
var gameArena;
var turnIndicator;

findElements();
initialise();

function findElements(){
	canvas = document.getElementById("arena");
	canvas.addEventListener("click", gameLoop);

	button = document.getElementById("undo");
	button.addEventListener("click", undoGame);

	sound = document.getElementById("sound");
	gameArena = canvas.getContext("2d");
	turnIndicator = document.getElementById("turnIndicator");
}

function initialise(){
	button.style.visibility = "visible";
	turnIndicator.style.visibility = "visible";
	isGameOver = false;
	initialiseMatrix();
	drawArena();
	turnCount = 0;
	counterAnimate = 0;
	gameTimer = setInterval(updateMatrix, gameSpeed);
}

function initialiseMatrix(){
	countMatrix = new Array(9).fill(0).map(() => new Array(6).fill(0));
	colorMatrix = new Array(9).fill("").map(() => new Array(6).fill(""));
	undoCount = new Array(9).fill(0).map(() => new Array(6).fill(0));
	undoColor = new Array(9).fill("").map(() => new Array(6).fill(""));
}

function drawArena(){
	gameArena.clearRect(0, 0, width, height);
	
	if(turnCount % 2 == 0)
		gameArena.strokeStyle = "red", turnIndicator.style.color = "red", turnIndicator.innerHTML = "Player 1's Turn";
	else
		gameArena.strokeStyle = "green", turnIndicator.style.color = "green", turnIndicator.innerHTML = "Player 2's Turn";

	for(var counter = 1; counter < 6; counter++){
		drawLine(counter*gapWidth, 0, counter*gapWidth, height);
	}

	for(var counter = 1; counter < 9; counter++){
		drawLine(0, counter*gapHeight, width ,counter*gapHeight);
	}

	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 6; j++){
			if(countMatrix[i][j] == 0)
				continue;
			if(countMatrix[i][j] == 1)
				oneCircle(i, j, colorMatrix[i][j]);
			else if(countMatrix[i][j] == 2)
				twoCircle(i, j, colorMatrix[i][j]);
			else
				threeCircle(i, j, colorMatrix[i][j]);
		}
	}
}

function drawLine(x1, y1, x2, y2){
	gameArena.beginPath();
	gameArena.moveTo(x1, y1);
	gameArena.lineTo(x2, y2);
	gameArena.closePath();
	gameArena.stroke();
}

function oneCircle(row, column, color){
	var strokeColor;
	if((row == 0 && column == 0) || (row == 8 && column == 0) || (row == 0 && column == 5) || (row == 8 && column == 5)){
		if(counterAnimate%2 == 0)
			strokeColor = "black";
		else
			strokeColor = color;
	}
	else{
		strokeColor = "black";
	}

	drawCircle(column*gapWidth + 35, row*gapHeight + 35, color, strokeColor);
}

function twoCircle(row, column, color){
	var strokeColor;

	if(((row >= 1 && row < 8) && (column == 0 || column == 5)) || ((row == 0 || row == 8) && (column >= 1 && column < 5))){
		if(counterAnimate%2 == 0)
			strokeColor = "black";
		else
			strokeColor = color;
	}
	else{
		strokeColor = "black";
	}

	drawCircle(column*gapWidth + 20, row*gapHeight + 35, color, strokeColor);

	drawCircle(column*gapWidth + 50, row*gapHeight + 35, color, strokeColor);
}

function threeCircle(row, column, color){
	var strokeColor;
	if(counterAnimate%2 == 0)
		strokeColor = "black";
	else
		strokeColor = color;

	drawCircle(column*gapWidth + 20, row*gapHeight + 17, color, strokeColor);

	drawCircle(column*gapWidth + 20, row*gapHeight + 53, color, strokeColor);

	drawCircle(column*gapWidth + 50, row*gapHeight + 35, color, strokeColor);
}

function drawCircle(i , j, color, strokeColor){
	gameArena.beginPath();
	gameArena.arc(i, j, 15, 0, Math.PI*2);
	gameArena.fillStyle = color;
	gameArena.fill();

	gameArena.strokeStyle = strokeColor;

	gameArena.lineWidth = 3;
	gameArena.stroke();
	gameArena.closePath();
	gameArena.lineWidth = 1;
}

function undoGame(){
	if(turnCount > 0 && flag == false){
		flag = true;
		turnCount--;
		for(var i = 0; i < 9; i++){
			for(var j = 0; j < 6; j++){
				countMatrix[i][j] = undoCount[i][j];
				colorMatrix[i][j] = undoColor[i][j];
			}
		}
		
	} else {
		 $('.undoMessage').stop().fadeIn(400).delay(2000).fadeOut(400); //fade out after 2 seconds
	}
}

function takeBackUp(){
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 6; j++){
			undoCount[i][j] = countMatrix[i][j];
			undoColor[i][j] = colorMatrix[i][j];
		}
	}
}

function gameLoop(event){
	var rect = canvas.getBoundingClientRect();
	var x = event.clientX - rect.left;  // where did we click(at what distance)
	var y = event.clientY - rect.top;

	var row = Math.floor(x/gapWidth);
	var column = Math.floor(y/gapHeight);

	if(!isGameOver){
		takeBackUp();   
		if(turnCount%2 == 0 && (colorMatrix[column][row] == "" || colorMatrix[column][row] == "red")){
			countMatrix[column][row]++;		
			colorMatrix[column][row] = "red";
			turnCount++;    // other player turn
			flag = false;   // now we can undo
		}
		if(turnCount%2 == 1 && (colorMatrix[column][row] == "" || colorMatrix[column][row] == "green")){
			countMatrix[column][row]++;		
			colorMatrix[column][row] = "green";
			turnCount++;
			flag = false;
		}
	}
}

function populateCornerCells(i, j){
	countMatrix[i][j] -= 2;
	countMatrix[ i == 8 ? i-1 : i+1 ][j]++;
	countMatrix[i][ j==5 ? j-1 : j+1 ]++;
	colorMatrix[ i == 8 ? i-1 : i+1 ][j] = colorMatrix[i][j];
	colorMatrix[i][ j==5 ? j-1 : j+1 ] = colorMatrix[i][j];
	if(countMatrix[i][j] == 0)
		colorMatrix[i][j] = "";
	sound.play();
}

function populateSideHCells(i, j){  // H = Height
	countMatrix[i][j] -= 3;
	countMatrix[i-1][j]++;
	countMatrix[i+1][j]++;
	countMatrix[i][ j==0 ? j+1 : j-1 ]++;
	colorMatrix[i][ j==0 ? j+1 : j-1 ] = colorMatrix[i][j];
	colorMatrix[i-1][j] = colorMatrix[i][j];
	colorMatrix[i+1][j] = colorMatrix[i][j];
	if(countMatrix[i][j] == 0)
		colorMatrix[i][j] = "";
	sound.play();
}

function populateSideWCells(i, j) {  // W = Width
	countMatrix[i][j] -= 3;
	countMatrix[ i==0 ? i+1 : i-1 ][j]++;
	countMatrix[i][j-1]++;
	countMatrix[i][j+1]++;
	colorMatrix[ i==0 ? i+1 : i-1 ][j] = colorMatrix[i][j];
	colorMatrix[i][j-1] = colorMatrix[i][j];
	colorMatrix[i][j+1] = colorMatrix[i][j];
	if(countMatrix[i][j] == 0)
		colorMatrix[i][j] = "";
	sound.play();
}

function notStable(){
	var ans = false;
	if(countMatrix[0][0] >= 2 || countMatrix[8][0] >= 2 || countMatrix[8][5] >= 2 || countMatrix[0][5] >= 2)
		ans = true;

	for(var i = 1; i < 8; i++)
		if(countMatrix[i][0] >= 3 || countMatrix[i][5] >= 3)
			ans = true;

	for(var i = 1; i < 5; i++)
		if(countMatrix[0][i] >= 3 || countMatrix[8][i] >= 3)
			ans = true;

	for(var i = 1; i < 8; i++)
		for(var j = 1; j < 8; j++)
			if(countMatrix[i][j] >= 4)
				ans = true;

	return ans;
}

function updateMatrix(){
	counterAnimate++;
	drawArena();
	var cornerCord = [[0,0], [8,0], [8,5], [0,5]];

	if(notStable()){
		for(var i = 0; i < 4;i++)
			if(countMatrix[cornerCord[i][0]][cornerCord[i][1]] >= 2){ populateCornerCells(cornerCord[i][0], cornerCord[i][1]); break; }

		for(var i = 1; i < 8; i++){
			if(countMatrix[i][0] >= 3){ populateSideHCells(i, 0); break; }
			if(countMatrix[i][5] >= 3){ populateSideHCells(i, 5); break; }
		}

		for(var i = 1; i < 5; i++){
			if(countMatrix[0][i] >= 3){ populateSideWCells(0, i); break; }
			if(countMatrix[8][i] >= 3){ populateSideWCells(8, i); break; }
		}

		for(var i = 1; i < 8; i++){
			for(var j = 1; j < 5; j++){
				if(countMatrix[i][j] >= 4){

					countMatrix[i][j] -= 4;
					countMatrix[i-1][j]++;
					countMatrix[i+1][j]++;
					countMatrix[i][j-1]++;
					countMatrix[i][j+1]++;

					colorMatrix[i-1][j] = colorMatrix[i][j];
					colorMatrix[i+1][j] = colorMatrix[i][j];
					colorMatrix[i][j-1] = colorMatrix[i][j];
					colorMatrix[i][j+1] = colorMatrix[i][j];

					if(countMatrix[i][j] == 0)
						colorMatrix[i][j] = "";
					sound.play();

					break;
				}
			}
		}
	}
	checkGameOver();
}

function checkGameOver(){
	if(gameOver() == 1 || gameOver() == 2){
		isGameOver = true;
		document.getElementById("undo").style.visibility = "hidden";
		turnIndicator.style.visibility = "hidden";
		drawArena();
		setTimeout(gameOverScreen.bind(null,gameOver()), 2000);
		clearInterval(gameTimer);
		setTimeout(initialise, 6000);
	}
}

function gameOver(){
	var countRed = 0;
	var countGreen = 0;
	for(var i = 0; i < 9; i++){
		for(var j = 0;j < 6; j++){
			if(colorMatrix[i][j] == "red") countRed++;
			if(colorMatrix[i][j] == "green") countGreen++;
		}
	}
	if(turnCount > 1){
		if(countRed == 0){
			return 2;
		}
		if(countGreen == 0){
			return 1;
		}
	}
}

function gameOverScreen(player){
	if(player == 2){
		showWinner("Player 2 Wins!");
	}
	else{
		showWinner("Player 1 Wins!");
	}
}

function showWinner(winnerTxt){

	gameArena.clearRect(0, 0, width, height);
	gameArena.fillStyle = "black";
	gameArena.fillRect(0, 0, width, height);
	gameArena.fillStyle = "white";
	gameArena.font = "40px Montserrat";

	gameArena.fillText(winnerTxt, width/2 - 135, height/2 - 30);

} 