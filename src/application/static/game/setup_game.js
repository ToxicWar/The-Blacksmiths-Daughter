function setupGame() {


var urlParams = location.hash.substr(1).split(",");
var theVeryGlobalUrlParams = {
	w: urlParams[0],
	h: urlParams[1],
	cw: urlParams[2],
	iw: urlParams[3]
};



// можно подгружать, можно генерить. не суть.
/*var someCellImage = document.createElement("canvas");
var w = theVeryGlobalUrlParams.iw || 16;
someCellImage.width = someCellImage.height = w * devicePixelRatio;
var rc = someCellImage.getContext("2d");
rc.scale(devicePixelRatio, devicePixelRatio);
rc.beginPath();
rc.arc(w/2, w/2, w/2-1, 0, Math.PI*2, true);
rc.moveTo(w/2, w/2);
rc.lineTo(w,   w/2);
rc.stroke();
document.body.appendChild(someCellImage);*/

var someConnectionImage = document.createElement("canvas");
var w = (theVeryGlobalUrlParams.iw || 16)/2;
someConnectionImage.width = someConnectionImage.height = w * devicePixelRatio;
var rc = someConnectionImage.getContext("2d");
rc.scale(devicePixelRatio, devicePixelRatio);
rc.strokeRect(0, 0, w, w);
rc.fillStyle = "white";
rc.fillRect(0, 1, w, w-2);
document.body.appendChild(someConnectionImage);

/*var someWallImage = document.createElement("canvas");
var w = theVeryGlobalUrlParams.iw || 16;
someWallImage.width = someWallImage.height = w * devicePixelRatio;
var rc = someWallImage.getContext("2d");
rc.scale(devicePixelRatio, devicePixelRatio);
rc.beginPath();
rc.moveTo(0, 0);
rc.lineTo(w, w);
rc.moveTo(0, w);
rc.lineTo(w, 0);
rc.stroke();
rc.strokeRect(0, 0, w, w);
document.body.appendChild(someWallImage);*/




// не лучшая идея, потом надо будет поменять
Cell.prototype.arrowImage = cellArrowImage;
Cell.prototype.backImage = cellBackImage;
Cell.prototype.image_width = theVeryGlobalUrlParams.iw || 16;
Cell.prototype.connectionImage = someConnectionImage;
Cell.prototype.connection_image_width = (theVeryGlobalUrlParams.iw || 16)/2;
Cell.prototype.connection_image_height = (theVeryGlobalUrlParams.iw || 16)/2;

Wall.prototype.image = wallImage;
Wall.prototype.image_width = theVeryGlobalUrlParams.iw || 16;




var map = new Map({
	canvas: theGameCanvas,
	h_size: theVeryGlobalUrlParams.w || 32,
	v_size: theVeryGlobalUrlParams.h || 32,
	cell_width: theVeryGlobalUrlParams.cw || 20,
	generators: [
		MapGenerator.cellRandom,
		MapGenerator.dirMiddleSnake,
		MapGenerator.wallBorder,
		[MapGenerator.hole, true, 0.75, 0.25, 0.15]
	],
	playersPositionsGenerator: MapGenerator.playersPositions,
	playersColors: [Color.GREEN, Color.RED],
	//playerColor: Color.GREEN,
	onTurn: function(color) {
		console.log("with #:", color.toString(), "as int:", color.valueOf());
	}
});

theGameCanvas.onclick = function(e) {
	//if (map.stillAnimating()) return;
	//map.rotateAtRealBy(e.offsetX||e.layerX, e.offsetY||e.layerY, 1)
	map.doTurn(e.offsetX||e.layerX, e.offsetY||e.layerY, 1, Color.GREEN);
}
theGameCanvas.oncontextmenu = function(e) {
	e.preventDefault();
	//map.hackColor(e.offsetX||e.layerX, e.offsetY||e.layerY);
	map.doTurn(e.offsetX||e.layerX, e.offsetY||e.layerY, 1, Color.RED);
}

window.benchmark = false; // DEBUG
window.fps = new FPS(function(fps){ /*fps_box.textContent = fps*/ }); // DEBUG
map.drawAll();
function step() {
	map.update();
	if (benchmark) map.drawAll();
	
	fps.update();
	setTimeout(step, benchmark ? 1 : 32);
}
step();


}