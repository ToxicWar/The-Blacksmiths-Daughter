//TODO: нормальная очистка при вращении

// по возможности i и j используются для целочисленных индексов в сетке,
// а x и y - для координат (которые потом будут првращены в индексы, или по которым будет что-то рисоваться)

function Map(conf) {
	var map = this;
	var canvas = conf.canvas;
	var rc;
	var cell_width = conf.cell_width;
	var scale = devicePixelRatio;
	var playersColors = conf.playersColors;
	var neutralColor = conf.neutralColor;
	var h_size = conf.h_size || 0;
	var v_size = conf.v_size || 0;
	
	// сетка. вообще, надо было её двумерным массиво делать, но уж так пошло...
	var grid = new Array(h_size * v_size);
	
	/*Object.defineProperty(this, "rc", {
		get: function() {return rc;}
	});
	
	Object.defineProperty(this, "cell_width", {
		get: function() {return cell_width;}
	});*/
	
	Object.defineProperties(this, {
		"grid": {get: function(){ return grid }},
		"h_size": {get: function(){ return h_size }, set: function(h){ h_size=h }},
		"v_size": {get: function(){ return v_size }, set: function(v){ v_size=v }},
		"playersColors": {get: function(){ return playersColors }},
		"neutralColor": {get: function(){ return neutralColor }},
	});
	
	this.colorFor = function(player_id) {
		return playerColors[player_id];
	}
	
	// начальные манипуляции с канвасом
	this.resetCanvas = function() {
		canvas.style.width = h_size * cell_width + "px";
		canvas.style.height = v_size * cell_width + "px";
		canvas.width  = h_size * cell_width * scale;
		canvas.height = v_size * cell_width * scale;
		rc = canvas.getContext("2d");
		rc.scale(scale, scale);
	}
	
	
	this.applyGenerator = function(gen) {
		if (gen instanceof Function) {
			gen(this, grid, h_size, v_size);
		} else {
			gen[0].apply(gen, [this, grid, h_size, v_size].concat(gen.slice(1)));
		}
	}
	
	this.applyGenerators = function() {
		for (var i=0; i<conf.generators.length; i++) {
			var gen = conf.generators[i];
			this.applyGenerator(gen);
		}
	}
	
	//conf.playersPositionsGenerator(grid, h_size, v_size, conf.playersColors);
	
	this.x2i = function(x) { return x/cell_width|0 }
	this.y2j = function(y) { return y/cell_width|0 }
	
	// возврщает ячейку в позиции i, j
	this.cellAt = function(i, j) {
		return grid[i + j*h_size];
	}
	this.safeCellAt = function(i, j) {
		if (i < 0 || i >= h_size) return null;
		if (j < 0 || j >= v_size) return null;
		return grid[i + j*h_size];
	}
	
	this.copyGridTo = function(array) {
		for (var i=0; i<grid.length; i++) {
			if (array[i] && grid[i] instanceof array[i].constructor) {
				if ('col' in grid[i]) array[i].col = grid[i].col;
				if ('dir' in grid[i]) array[i].dir = grid[i].dir;
			} else {
				array[i] = new grid[i].constructor(grid[i].dir, grid[i].col);
			}
		}
	}
	
	this.packGrig = function() {
		var str = "";
		for (var i=0; i<grid.length; i++) str += grid[i].toString();
		return str;
	}
	
	
	// рисует ячейку в позиции i, j; если надо, пытается ей переопределить направление и цвет
	this.drawCell = function(cell, i, j, dir, col) {
		if (!cell.draw) return;
		var dx = (i+0.5) * cell_width;
		var dy = (j+0.5) * cell_width;
		var csell;
		
		rc.save();
		rc.translate(dx, dy);
		rc.clearRect(-cell_width/2, -cell_width/2, cell_width, cell_width);
		if (cell.connectable) {
			if ((csell=this.cellAt(i+1, j  )).connectable) csell.drawPartAt(rc,-1, 0, cell_width);
			if ((csell=this.cellAt(i-1, j  )).connectable) csell.drawPartAt(rc, 1, 0, cell_width);
			if ((csell=this.cellAt(i  , j+1)).connectable) csell.drawPartAt(rc, 0,-1, cell_width);
			if ((csell=this.cellAt(i  , j-1)).connectable) csell.drawPartAt(rc, 0, 1, cell_width);
		}
		cell.draw(rc, cell_width, dir, col);
		rc.restore();
	}
	
	// перерисовка ВСЕГО. часто не вызывать
	this.drawAll = function() {
		//rc.clearRect(0, 0, canvas.width, canvas.height);
		for (var i=0; i<h_size; i++) {
			for (var j=0; j<v_size; j++) {
				this.drawCell(this.cellAt(i, j), i, j);
			}
		}
	}
	
	// перерисовать в i, j
	this.drawAt = function(i, j) {
		this.drawCell(this.cellAt(i, j), i, j);
	}
	// перерисовать в x и y
	// real - не потому что числа дробные (хотя и такие можно),
	// а потому что реальные (т.е. экранные) координаты
	this.drawAtReal = function(x, y) {
		this.drawAt(x/cell_width|0, y/cell_width|0);
	}
	
	this.triggerAt = function(i, j, color, do_not_chain) {
		return this.cellAt(i,j).trigger(this, i, j, color, do_not_chain);
	}
	
	
	// обновление всего по списку
	var updatingCells = {};
	var firedAnimationEnd = false;
	// добавление в очередь на перерисовку; для и иже с ними //кого?
	this.addUpdatingSomethingAt = function(i, j, obj) {
		updatingCells[i + j*h_size] = obj;
		firedAnimationEnd = false;
	}
	// что-то тут обновляется?
	this.somethingUpdatesAt = function(i, j) {
		return (i + j*h_size) in updatingCells;
	}
	// анимация ещё продолжается?
	this.stillAnimating = function() {
		for (var i in updatingCells) return true;
		return false;
	}
	// апдейт всего того из очереди
	this.update = function() {
		var keys = Object.keys(updatingCells); //TODO: нетруъ каждый кадр массив создавать
		
		for (var i=0; i<keys.length; i++) {
			var ucell = updatingCells[keys[i]];
			var pos = parseInt(keys[i]); // вынимаем координаты из ключа хешмапа
			var ucell_i = pos%h_size;
			var ucell_j = pos/h_size|0;
			
			var updated = ucell.update(this);
			ucell.draw(this); // кадр анимации
			
			if (updated) continue;
			delete updatingCells[keys[i]]; // отанимировало? убираем из очереди
		}
		
		if (keys.length == 0 && !firedAnimationEnd) {
			core.emit("map-animation-end", [playersColors[0]]);
			firedAnimationEnd = true;
		}
	}
	
	// повернуть; для внутреннего (пока) использования
	function rotateBy(i, j, dir_delta) {
		this.cellAt(i, j).rotate(map, i, j, (cell.dir+4+dir_delta)%4);
	}
	// одна из основных торчащих наружу функций
	this.rotateAtRealBy = function(x, y, delta) {
		rotateBy(x/cell_width|0, y/cell_width|0, delta);
	}
	
	this.doTurnReal = function(x, y, delta, color) {
		this.doTurn(x/cell_width|0, y/cell_width|0, delta, color);
	}
	
	this.doTurn = function(i, j, delta, color) {
		if (map.stillAnimating()) return false;
		
		var cell = this.cellAt(i, j);
		
		if (!cell.col || cell.col.valueOf() != color.valueOf()) return false;
		if (playersColors[0].valueOf() != color.valueOf()) return false;
		
		cell.rotate(map, i, j, (cell.dir+4+delta)%4);
		playersColors.push(playersColors.shift());
		core.emit("map-turn-done", [i, j, playersColors[0]]);
		
		return true;
	}
	
	// для тестирования
	this.hackColor = function(i, j, col) {
		var cell = this.cellAt(i, j);
		cell.col = col;
		this.drawCell(cell, i, j);
	}
	this.hackColorReal = function(x, y, col) {
		var i=x/cell_width|0, j=y/cell_width|0;
		this.hackColor(i, j, col);
	}
	
	
	core.on("map-perform-ability", function() {
		//arguments.__proto__ = []; // лёгким движением руки брюки превращаются... в элегантнй массив!
		//// каким-то чудом оно работает. как минимум в Хроме. и в ФФ.
		//var abilityFunc = arguments.shift();
		var abilityFunc = arguments[0];
		arguments[0] = map;
		abilityFunc.apply(null, arguments);
	});
	this.applyGenerators();
	this.resetCanvas();
}
