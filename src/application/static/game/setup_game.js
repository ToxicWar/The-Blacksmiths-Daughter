function setupGame() {



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
var w = (pupsConf.iw || 16)/2;
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
Cell.prototype.image_width = pupsConf.iw;
Cell.prototype.connectionImage = someConnectionImage;
Cell.prototype.connection_image_width = pupsConf.iw/2;
Cell.prototype.connection_image_height = pupsConf.iw/2;

Wall.prototype.image = wallImage;
Wall.prototype.image_width = pupsConf.iw;





if (gameConf.multiplayer) {
	var room = "someroom";
	var positionsForRoommates;
	var socket = io.connect('http://' + serverConf.addr + ':' + serverConf.port + '/test');
	
//	socket.emit('hello to roommates', {room: room});
//	
//	socket.on('hello from roommates', function(msg) {
//		console.log(msg)
//		if (msg.rooms.indexOf(room) == -1) {
//			setupMap();
//			socket.emit('map to roommates', {room: room, map: map.packGrig()});
//		}
//	});
//	
//	socket.on('map from roommates', function(msg) {
//		console.log(msg)
//		map.applyGenerator([
//			MapGenerator.playersPositions,
//			[Color.GREEN, Color.RED],
//			function(positions){ positionsForRoommates = positions }
//		]);
//	});
	
	socket.emit('get multiplayer event', {});
	
	socket.on('get multiplayer map', function(msg) {
		console.log(msg)
		if (msg.map.length == 0) {console.log("len 0")
			setupMap();
			map.applyGenerator([
				MapGenerator.playersPositions,
				[Color.GREEN, Color.RED],
				function(positions) {console.log(map.packGrig())
					socket.emit('set multiplayer map', {map: map.packGrig(), positions: positions});
				}
			]);
		} else {
			setupMap(msg.map);
			for (var i=0; i<msg.positions.length; i++) {
				var pos = msg.positions;
				map.hackColor(pos.i, pos.j, pos.col);
			}
		}
	});
}


var map;

function setupMap(mapData) {
	map = new Map({
		canvas: theGameCanvas,
		h_size: pupsConf.w,
		v_size: pupsConf.h,
		cell_width: pupsConf.cw,
		generators: (!gameConf.multiplayer || !mapData ? [
			MapGenerator.cellRandom,
			//[MapGenerator.dirByArray, data.map],
			MapGenerator.dirMiddleSnake,
			MapGenerator.wallBorder,
			[MapGenerator.hole, true, 0.75, 0.25, 0.15],
			[MapGenerator.playersPositions, [Color.GREEN, Color.RED]]
		] : [
			[MapGenerator.unpackGrid, mapData],
		]),
		//playersPositionsGenerator: MapGenerator.playersPositions,
		playersColors: [Color.GREEN, Color.RED],
		//playerColor: Color.GREEN,
		onTurn: function(color) {
			console.log("with #:", color.toString(), "as int:", color.valueOf());
		},
		onAnimationEnd: function(color) {
			if (gameConf.multiplayer) return;
			for (var i=0; i<bots.length; i++) {
				if (bots[i].color.valueOf() != color.valueOf()) continue;
				bots[i].turn(map);
			}
		}
	});
	
	var playerColor = Color.GREEN; // а это тоже наверно должно идти от сервера
	var bots = [new TestAi(map, Color.RED)];
	
	
	var grab_x = NaN, grab_y = NaN;
	function grab(x,y) {
		//if (map.stillAnimating()) return;
		//map.rotateAtRealBy(e.offsetX||e.layerX, e.offsetY||e.layerY, 1)
		
	}
	function move(x,y) {
		
	}
	function drop() {
		map.doTurnReal(grab_x, grab_y, 1, Color.GREEN);
	}
	
	
	theGameCanvas.onmousedown = function(e) {
		e.preventDefault();
		grab(e.offsetX||e.layerX, e.offsetY||e.layerY);
	}
	theGameCanvas.onmousemove = function(e) {
		e.preventDefault();
		move(e.offsetX||e.layerX, e.offsetY||e.layerY);
	}
	theGameCanvas.onmouseup = function(e) {
		e.preventDefault();
		drop();
	}
	
	theGameCanvas.ontouchstart = function(e) {
		e.preventDefault();
		e = e.touches[0];
		grab(e.offsetX||e.layerX, e.offsetY||e.layerY);
	}
	theGameCanvas.ontouchmove = function(e) {
		e.preventDefault();
		e = e.touches[0];
		move(e.offsetX||e.layerX, e.offsetY||e.layerY);
	}
	theGameCanvas.ontouchend = function(e) {
		e.preventDefault();
		drop();
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


}
