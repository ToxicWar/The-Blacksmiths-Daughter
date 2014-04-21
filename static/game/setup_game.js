core.on("map-turn-done", function(i, j, color) {
	console.log("turn done, color: with #:", color.toString(), "as int:", color.valueOf());
});

function getMapRandomGenerators() {
	return [
		MapGenerator.cellRandom,
		MapGenerator.dirMiddleSnake,
		MapGenerator.wallBorder,
		[MapGenerator.hole, true, 0.75, 0.25, 0.15],
		MapGenerator.playersPositions
	];
}

function getGenerators(mapData) {
	if (gameConf.multiplayer || !mapData) {
		return getMapRandomGenerators()
	} else {
		return [
			[MapGenerator.unpackGrid, mapData]
		];
	}
}

function getPlayersColors() {
	return [Color.GREEN, Color.RED];
}

function setupMap(mapData, playerColor) {
	var map = new Map({
		canvas: theGameCanvas,
		h_size: pupsConf.w,
		v_size: pupsConf.h,
		cell_width: pupsConf.cw,
		generators: getGenerators(mapData),
		playersColors: getPlayersColors(),
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
	theGameCanvas.oncontextmenu = function(e) {
		e.preventDefault();
		var pos = getPos(theGameCanvas);
		Ability.bomb(map, map.x2i(e.pageX-pos.x), map.y2j(e.pageY-pos.y));
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
	// сокеты? а чего, оно всё равно не работает
});
