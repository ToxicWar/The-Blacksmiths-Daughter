function setupGame() {



function log(text) {div_log.innerHTML = text+"</br>"+div_log.innerHTML;}
window.onerror = function(errorMsg, url, lineNumber) {
	var msg = "Error happened on <"+url+
		"\n> on line "+lineNumber+":\n"+
		errorMsg;
	alert(msg);
}


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
			console.log("apply")
			map.applyGenerator([
				MapGenerator.playersPositions,
				[Color.GREEN, Color.RED],
				function(positions) {
					map.drawAll();
					console.log("p", positions)
					for (var i=0; i<positions.length; i++) {
						positions[i].col = positions[i].col.toString()
					}
					socket.emit('set multiplayer map', {
						map: {
							data: map.packGrig(),
							positions: positions
						}
					});
				}
			]);
		} else {
			setupMap(msg.map.data, Color.RED);
			console.log("mmp", msg.map.positions)
			for (var i=0; i<msg.map.positions.length; i++) {
				var pos = msg.map.positions[i];
				map.hackColor(pos.i, pos.j, Color.fromHTML(pos.col));
			}
		}
	});
	
	socket.on('turn event', function(msg) {
		console.log(msg)
		map.doTurn(msg.pos.i, msg.pos.j, 1, map.cellAt(msg.pos.i, msg.pos.j));
	});
} else {
	setupMap();
}


var map;

function setupMap(mapData, playerColor) {
	map = new Map({
		canvas: theGameCanvas,
		h_size: pupsConf.w,
		v_size: pupsConf.h,
		cell_width: pupsConf.cw,
		generators: (!gameConf.multiplayer ? [
			MapGenerator.cellRandom,
			//[MapGenerator.dirByArray, data.map],
			MapGenerator.dirMiddleSnake,
			MapGenerator.wallBorder,
			[MapGenerator.hole, true, 0.75, 0.25, 0.15],
			[MapGenerator.playersPositions, [Color.GREEN, Color.RED]]
		] : (!mapData ? [
			MapGenerator.cellRandom,
			MapGenerator.wallBorder,
			[MapGenerator.hole, true, 0.5, 0.5, 0.15]
		] : [
			[MapGenerator.unpackGrid, mapData],
		])),
		//playersPositionsGenerator: MapGenerator.playersPositions,
		playersColors: [Color.GREEN, Color.RED],
		//playerColor: Color.GREEN,
		onTurn: function(i, j, color) {
			console.log("with #:", color.toString(), "as int:", color.valueOf());
			
			if (gameConf.multiplayer) {
				socket.emit('turn event', {
					pos: {i:i, j:j}
				});
			}
		},
		onAnimationEnd: function(color) {
			if (gameConf.multiplayer) return;
			for (var i=0; i<bots.length; i++) {
				if (bots[i].color.valueOf() != color.valueOf()) continue;
				bots[i].turn(map);
			}
		}
	});
	
	playerColor = playerColor || Color.GREEN;
	console.log(playerColor)
	var bots = [new TestAi(map, Color.RED)];
	
	
	var grab_x = NaN, grab_y = NaN, grab_len = NaN;
	function grab(x, y) {
		//if (map.stillAnimating()) return;
		//map.rotateAtRealBy(e.offsetX||e.layerX, e.offsetY||e.layerY, 1)
		grab_x = x;
		grab_y = y;
		grab_len = 0;
	}
	function move(x, y) {
		grab_len += pointDistance(x, y, grab_x, grab_y);
		grab_x = x;
		grab_y = y;
	}
	function drop() {
		//alert([grab_x, grab_y, 1, Color.GREEN])
		if (grab_len < 5) {
			map.doTurnReal(grab_x, grab_y, 1, playerColor);
		}
	}
	
	
	theGameCanvas.onmousedown = function(e) {
		e.preventDefault();
		var pos = getPos(theGameCanvas);
		grab(e.pageX-pos.x, e.pageY-pos.y);
	}
	theGameCanvas.onmousemove = function(e) {
		e.preventDefault();
		var pos = getPos(theGameCanvas);
		move(e.pageX-pos.x, e.pageY-pos.y);
	}
	theGameCanvas.onmouseup = function(e) {
		e.preventDefault();
		drop();
	}
	
	theGameCanvas.ontouchstart = function(e) {
		e.preventDefault();
		e = e.touches[0];
		var pos = getPos(theGameCanvas);
		grab(e.pageX-pos.x, e.pageY-pos.y);
	}
	theGameCanvas.ontouchmove = function(e) {
		e.preventDefault();
		e = e.touches[0];
		var pos = getPos(theGameCanvas);
		move(e.pageX-pos.x, e.pageY-pos.y);
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
