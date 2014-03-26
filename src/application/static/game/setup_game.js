core.on("map-turn-done", function(i, j, color) {
	console.log("turn done, color: with #:", color.toString(), "as int:", color.valueOf());
});

function setupMap(mapData, playerColor) {
	var map = new Map({
		canvas: theGameCanvas,
		h_size: pupsConf.w,
		v_size: pupsConf.h,
		cell_width: pupsConf.cw,
		generators: (!gameConf.multiplayer ? [
			MapGenerator.cellRandom,
			MapGenerator.dirMiddleSnake,
			MapGenerator.wallBorder,
			[MapGenerator.hole, true, 0.75, 0.25, 0.15],
			MapGenerator.playersPositions
		] : (!mapData ? [
			MapGenerator.cellRandom,
			MapGenerator.wallBorder,
			[MapGenerator.hole, true, 0.5, 0.5, 0.15]
		] : [
			[MapGenerator.unpackGrid, mapData],
		])),
		playersColors: [Color.GREEN, Color.RED],
		onTurn: function(i, j, color) {
			core.emit("map-turn-done", [i, j, color]); // TODO: если труъ, надо будет впилить в саму карту
		},
		onAnimationEnd: function(color) {
			core.emit("map-animation-end", [color]);
		}
	});
	
	playerColor = playerColor || Color.GREEN;
	
	
	var grab_x = NaN, grab_y = NaN, grab_len = NaN;
	function grab(x, y) {
		grab_x = x;
		grab_y = y;
		grab_len = 0;
	}
	function move(x, y) {
		if (grab_x != grab_x) return;
		grab_len += pointDistance(x, y, grab_x, grab_y);
		/*if (grab_len >= 5) {
			var dx = x-grab_x;
			var dy = y-grab_y;
			var parent = theGameCanvas.parentNode;
			var dw = theGameCanvas.offsetWidth - parent.offsetWidth;
			var dh = theGameCanvas.offsetHeight - parent.offsetHeight;
			console.log(dw, dh, dx, dy)
			parent.style.position = "relative";
			theGameCanvas.style.position = "absolute";
			theGameCanvas.style.marginLeft = toRangeOrMiddle(-dw, theGameCanvas.offsetLeft+dx, 0) + "px";
			theGameCanvas.style.marginTop  = toRangeOrMiddle(-dh, theGameCanvas.offsetTop+dy,  0) + "px";
		}*/
		grab_x = x;
		grab_y = y;
	}
	function drop() {
		if (grab_x != grab_x) return;
		if (grab_len < 5) {
			map.doTurnReal(grab_x, grab_y, 1, playerColor);
		}
		grab_x = grab_y = grab_len = NaN;
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
	window.fps = new FPS(function(fps){ benchmark && console.log(fps) }); // DEBUG
	map.drawAll();
	function step() {
		map.update();
		if (benchmark) map.drawAll();

		fps.update();
		setTimeout(step, benchmark ? 1 : 32);
	}
	step();
	return map;
}



core.on("window-onload", function() {
	if (!gameConf.multiplayer) {
		var map = setupMap();
		var bots = [new TestAi(map, Color.RED, function() {
			alert("Ах ты такой разэдакий! Давай ещё раз.");
		})];
		core.on("map-animation-end", function(color) {
			for (var i=0; i<bots.length; i++) {
				if (bots[i].color.valueOf() != color.valueOf()) continue;
				bots[i].turn(map);
			}
		});
		return;
	}
	
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
//			function(positions){ positionsForRoommates = positions }
//		]);
//	});
	
	socket.emit('get multiplayer event', {});
	
	core.on("map-turn-done", function(i, j, color) {
		if (gameConf.multiplayer) {
			socket.emit('turn event', {
				pos: {i:i, j:j}
			});
		}
	});
	
	
	socket.on('get multiplayer map', function(msg) {
		console.log(msg)
		if (msg.map.length == 0) {console.log("len 0")
			var map = setupMap();
			console.log("apply")
			map.applyGenerator([
				MapGenerator.playersPositions,
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
			var map = setupMap(msg.map.data, Color.RED);
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
});
