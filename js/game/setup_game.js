core.on("map-turn-done", function(i, j, color) {
	console.log("turn done, color: with #:", color.toString(), "as int:", color.valueOf());
});

function getMapRandomGenerators() {
	return [
		[MapGenerator.sizeFixed, pupsConf.w, pupsConf.h],
		MapGenerator.cellRandom,
		MapGenerator.dirMiddleSnake,
		MapGenerator.wallBorder,
		[MapGenerator.hole, true, 0.75, 0.25, 0.15],
		MapGenerator.playersPositions
	];
}

function tryGetMapDataFromURL() {
	var m = location.hash.match(/lvl:(.+)/);
	if (m == null) return null;
	return decodeURI(m[1]);
}

function getGenerators(mapData) {
	if (!mapData) mapData = tryGetMapDataFromURL();
	if (gameConf.multiplayer || !mapData) {
		return getMapRandomGenerators();
	} else {
		return [
			[MapGenerator.openLevel, mapData]
		];
	}
}

function getPlayersColors() {
	return [Color.GREEN, Color.RED];
}

function setupMap(mapData, playerColor) {
	var map = new Map({
		canvas: theGameCanvas,
		cell_width: pupsConf.cw,
		generators: getGenerators(mapData),
		playersColors: getPlayersColors(),
		neutralColor: Color.GRAY
	});
	
	playerColor = playerColor || Color.GREEN;
	
	
	var grab_x = NaN, grab_y = NaN, grab_len = NaN;
	function singleDown(x, y) {
		grab_x = x;
		grab_y = y;
		grab_len = 0;
		return true;
	}
	function singleMove(x, y) {
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
		return true;
	}
	function singleUp(is_switching) {
		if (grab_x != grab_x) return;
		if (grab_len < 5 && !is_switching) {
			map.doTurnReal(grab_x, grab_y, 1, playerColor);
		}
		grab_x = grab_y = grab_len = NaN;
		return true;
	}
	
	function doubleDown(x0, y0, x1, y1) {
		return true;
	}
	function doubleMove(x0, y0, x1, y1) {
		return true;
	}
	function doubleUp(is_switching) {
		return true;
	}
	
	theGameCanvas.oncontextmenu = function(e) {
		e.preventDefault();
		var pos = getPos(theGameCanvas);
		core.emit("map-perform-ability", [
			Ability.bombReal,
			e.pageX-pos.x,
			e.pageY-pos.y
		]);
	}
	
	Control.add({
		singleDown: singleDown,
		singleMove: singleMove,
		singleUp: singleUp,
		
		doubleDown: doubleDown,
		doubleMove: doubleMove,
		doubleUp: doubleUp,
		
		//wheelRot: wheelRot,
		
		startElem: theGameCanvas,
		stopElem: document.body
	});
	
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
	
	var level_id = 0;
	var m = location.hash.match(/n:(\d+)/);
	if (m != null) level_id = +m[1];
	
	XHR('GET', "./res/lvl"+level_id+".txt", null, function(code, data) {
		// ноль? да, ноль. оно при загрузке с file:/// возвращает туда ноль
		// TODO: убрать проверку на ноль потом отсюда нафиг
		if (code != 200 && code != 0) {
			alert("Левел луадинг фалед!\n"+code+": "+data);
			return;
		}
		
		var map = setupMap(data);
		
		var bots = [new TestAi(map, Color.RED, function() {
			alert("Ах ты такой разэдакий! Давай ещё раз.");
			location.hash = "n:"+(level_id+1); // изменение якоря НЕ перезагружает страницу!
			location.reload();
		})];
		
		core.on("map-animation-end", function(color) {
			for (var i=0; i<bots.length; i++) {
				if (bots[i].color.valueOf() != color.valueOf()) continue;
				bots[i].turn(map);
			}
		});
	});
	// сокеты? а чего, оно всё равно не работает
});
