//TODO: нормальная очистка при вращении

// по возможности i и j используются для целочисленных индексов в сетке,
// а x и y - для координат (которые потом будут првращены в индексы,
//           или по которым будет что-то рисоваться)

function Map(conf) {
	var map = this;
	this.canvas = conf.canvas;
	this.rc;
	this.cell_width = conf.cell_width;
	this.scale = devicePixelRatio;
	this.h_size = 0;
	this.v_size = 0;
	
	// сетка. вообще, надо было её двумерным массиво делать, но уж так пошло...
	this.grid = [];
	
	// обновление всего по списку
	this.updatingCells = {};
	this.firedAnimationEnd = false;
	
	/*core.on("map-ability-perform", function() {
		//arguments.__proto__ = []; // лёгким движением руки брюки превращаются... в элегантнй массив!
		//// каким-то чудом оно работает. как минимум в Хроме. и в ФФ.
		//var abilityFunc = arguments.shift();
		var ability = arguments[0];
		arguments[0] = map;
		var res = ability.act.apply(ability, arguments);
		core.emit("map-ability-performed", ability, res);
	});*/
	this._applyGenerators(conf.generators);
	this.resetCanvas();
}

//-------------------
// Инициализация
//-------------------

// начальные манипуляции с канвасом
Map.prototype.resetCanvas = function() {with(this) {
	canvas.style.width = h_size * cell_width + "px";
	canvas.style.height = v_size * cell_width + "px";
	canvas.width  = h_size * cell_width * scale;
	canvas.height = v_size * cell_width * scale;
	rc = canvas.getContext("2d");
	rc.scale(scale, scale);
}};

Map.prototype._applyGenerator = function(gen) {
	if (gen instanceof Function) {
		gen(this);
	} else {
		var genItself = gen[0];
		gen[0] = this; // now it's arguments
		genItself.apply(null, gen);
	}
};

Map.prototype._applyGenerators = function(generators) {
	for (var i=0; i<generators.length; i++) {
		var gen = generators[i];
		this._applyGenerator(gen);
	}
};


//--------------
// Всякости
//--------------

// есть ли на карте такой цвет
Map.prototype.hasColorsLike = function(color) {with(this) {
	for (var i=0; i<grid.length; i++) {
		if (grid[i].col && grid[i].col.valueOf()==color.valueOf()) return true;
	}
	return false;
}};

// координаты в индексы
Map.prototype.x2i = function(x) { return x / this.cell_width |0 };
Map.prototype.y2j = function(y) { return y / this.cell_width |0 };

// возврщает ячейку в позиции i, j
Map.prototype.cellAt = function(i, j) {
	return this.grid[i + j*this.h_size];
}
Map.prototype.safeCellAt = function(i, j) {
	if (i < 0 || i >= this.h_size) return null;
	if (j < 0 || j >= this.v_size) return null;
	return this.grid[i + j*this.h_size];
}

// копирует свой grid в другой grid
Map.prototype.copyGridTo = function(array) {with(this) {
	for (var i=0; i<grid.length; i++) {
		if (array[i] && grid[i] instanceof array[i].constructor) {
			if ('col' in grid[i]) array[i].col = grid[i].col;
			if ('dir' in grid[i]) array[i].dir = grid[i].dir;
		} else {
			array[i] = new grid[i].constructor(grid[i].dir, grid[i].col);
		}
	}
}}


//---------------
// Отрисовка
//---------------

// рисует ячейку в позиции i, j; если надо, пытается ей переопределить направление и цвет
Map.prototype.drawCell = function(cell, i, j, dir, col) {with(this) {
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
}}

// перерисовка ВСЕГО. часто не вызывать
Map.prototype.drawAll = function() {
	for (var i=0; i<this.h_size; i++) {
		for (var j=0; j<this.v_size; j++) {
			this.drawCell(this.cellAt(i, j), i, j);
		}
	}
}

// перерисовать в i, j
Map.prototype.drawAt = function(i, j) {
	this.drawCell(this.cellAt(i, j), i, j);
}
// перерисовать в x и y
// real - не потому что числа дробные (хотя и такие можно),
// а потому что реальные (т.е. экранные) координаты
/*this.drawAtReal = function(x, y) {
	this.drawAt(x/cell_width|0, y/cell_width|0);
}*/


//--------------
// Механика
//--------------

// "активировать" ячейку в точке (делается после поворота и т.д.)
Map.prototype.triggerAt = function(i, j, color, do_not_chain) {
	return this.cellAt(i,j).trigger(this, i, j, color, do_not_chain);
}

// добавление в очередь на перерисовку; для и иже с ними //кого?
Map.prototype.addUpdatingSomethingAt = function(i, j, obj) {
	if (this.somethingUpdatesAt(i, j)) throw new Error("Already animating at ("+i+","+j+")"); //DEBUG
	this.updatingCells[i + j*this.h_size] = obj;
	this.firedAnimationEnd = false;
};

// что-то тут обновляется?
Map.prototype.somethingUpdatesAt = function(i, j) {
	return (i + j*this.h_size) in this.updatingCells;
};

// анимация ещё продолжается?
Map.prototype.stillAnimating = function() {
	for (var i in this.updatingCells) return true;
	return false;
};

// апдейт всего того из очереди
Map.prototype.update = function() {
	var keys = Object.keys(this.updatingCells); //TODO: нетруъ каждый кадр массив создавать
	
	for (var i=0; i<keys.length; i++) {
		var ucell = this.updatingCells[keys[i]];
		var pos = parseInt(keys[i]); // вынимаем координаты из ключа хешмапа
		var ucell_i = pos % this.h_size;
		var ucell_j = pos / this.h_size|0;
		
		var updated = ucell.update(this);
		ucell.draw(this); // кадр анимации
		
		if (updated) continue;
		delete this.updatingCells[keys[i]]; // отанимировало? убираем из очереди
	}
	
	if (keys.length == 0 && !this.firedAnimationEnd) {
		core.emit("map-animation-end", []);
		this.firedAnimationEnd = true;
	}
};


//----------------
// Управление
//----------------

Map.prototype.doTurn = function(i, j, delta, color) {
	if (this.stillAnimating()) return false;
	
	var cell = this.cellAt(i, j);
	
	if (!cell.col || cell.col.valueOf() != color.valueOf()) return false;
	//if (playersColors[0].valueOf() != color.valueOf()) return false;
	
	cell.rotate(this, i, j, (cell.dir+4+delta)%4);
	//playersColors.push(playersColors.shift());
	//core.emit("map-turn-done", [i, j]);
	
	return true;
};

/*this.doTurnReal = function(x, y, delta, color) {
	this.doTurn(x/cell_width|0, y/cell_width|0, delta, color);
}*/


// для тестирования
Map.prototype.hackColor = function(i, j, col) {
	var cell = this.cellAt(i, j);
	cell.col = col;
	this.drawCell(cell, i, j);
};
Map.prototype.hackColorReal = function(x, y, col) {
	this.hackColor(this.x2i(x), this.y2j(y), col);
};
