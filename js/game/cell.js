// итак, ячейки сетки. минимальная комплектация:
// rotate(map, i, j, rotateBy) - вызывается у ячейки при клике в неё
//    объект карты, координаты, на сколько крутить
// trigger - вызывается, когда рядомстоящая и направленная сюда ячейка поменяла цвет
// дополнительно:
// connectable - тру, если к этой ячейке можно подключаться (не только Cell, ещё телепорт какой-нибудь)
// draw(rc, cell_width, dir, col) - если есть, вызывается при перерисовывании ячейки
//    rc - контекст для рисования,
//    cell_width - ширина ячейки карты
//    dir, col - переопределяют направление и цвет ячейки (опциональны)
// looksAt - куда смотрит клетка. влево, например - [-1, 0], вниз - [0, 1]


function Cell(dir, col) {
	this.dir = dir;
	this.col = col;
}

Cell.prototype.connectable = true;
// и всё равно как-то нетрушно
// но делать ещё один уровень наследования мне хочется ещё меньше
Cell.prototype.arrowImage = cellArrowImage;
Cell.prototype.backImage = cellBackImage;
Cell.prototype.image_width = pupsConf.iw;
Cell.prototype.connectionImage = cellConnectionImage;
Cell.prototype.connection_image_width = pupsConf.iw/2;
Cell.prototype.connection_image_height = pupsConf.iw/2;

Cell.prototype.draw = function(rc, cell_width, dir, col) {
	var iw = this.image_width;
	var ciw=this.connection_image_width, cih=this.connection_image_height;
	
	rc.fillStyle = (col || this.col).toString();
	//rc.fillRect(-iw/2, -iw/2, iw, iw);
	rc.beginPath();
	rc.arc(0, 0, iw/2*0.955, 0, Math.PI*2, true);
	rc.fill();
	rc.drawImage(this.backImage, -iw/2, -iw/2, iw, iw);
	
	rc.rotate((dir || this.dir)/2*Math.PI);
	rc.drawImage(this.arrowImage, -iw/2, -iw/2, iw, iw);
	
	rc.globalCompositeOperation = "destination-over";
	rc.drawImage(this.connectionImage, cell_width/2-ciw, -cih/2, ciw, cih);
	rc.globalCompositeOperation = "source-over";
}

Cell.prototype.drawPartAt = function(rc, di, dj, cell_width) {
	var delta = this.looksAt;
	if (delta.i != di || delta.j != dj) return; // looking in different direction, nothing to draw
	var ciw=this.connection_image_width, cih=this.connection_image_height;
	
	rc.rotate(this.dir/2*Math.PI+Math.PI);
	rc.drawImage(this.connectionImage, cell_width/2-ciw, -cih/2, ciw, cih);
	rc.rotate(-this.dir/2*Math.PI-Math.PI);
}

Object.defineProperty(Cell.prototype, "looksAt", {get: function() {
	switch(this.dir) {
	case 0: return {i: 1, j: 0};
	case 1: return {i: 0, j: 1};
	case 2: return {i:-1, j: 0};
	case 3: return {i: 0, j:-1};
	default: throw new Error("WTF? "+this.dir);
	}
}});

Cell.prototype.rotate = function(map, i, j, rotateBy) {
	map.addUpdatingSomethingAt(i, j, new RotatingCell(map, i, j, this, rotateBy));
}

Cell.prototype.trigger = function(map, i, j, triggerColor, do_not_chain) {
	if (this.col.valueOf() == triggerColor.valueOf()) return false;
	map.addUpdatingSomethingAt(i, j, new FadingCell(map, i, j, this, triggerColor, do_not_chain));
	return true;
}


function Wall() {}
Wall.prototype.image = wallImage;
Wall.prototype.image_width = pupsConf.iw;
Wall.prototype.rotate = function() {}
Wall.prototype.trigger = function() { return false }
Wall.prototype.draw = function(rc) {
	var iw = this.image_width;
	rc.drawImage(this.image, -iw/2, -iw/2, iw, iw);
}


function Hole() {}
Hole.prototype.rotate = function() {}
Hole.prototype.trigger = function() { return false }


// объекты, отвечающие за анимацию ячейки
// update(map) - вызывается на каждом кадре анимации
//    если вернула false, значит анимация закончена

function RotatingCell(map, i, j, cell, dir_to, do_not_chain) {
	this.i = i;//TODO: так ли нужно тут хранить координаты?
	this.j = j;
	this.dir_to = dir_to;
	var dir_from = cell.dir;
	var delta = dir_to-dir_from;
	if (delta > 2) dir_from = 4-dir_from;
	if (delta < -2) dir_from = dir_from-4;
	var lookAtFrom = cell.looksAt;
	lookAtFrom.i+=i; lookAtFrom.j+=j;
	cell.dir = dir_to;
	map.drawAt(lookAtFrom.i, lookAtFrom.j);
	this.lookAtFrom = lookAtFrom;
	this.do_not_chain = do_not_chain;
	
	this.cell = cell;
	this.dir = dir_from;
	this.col = cell.col;
}

RotatingCell.prototype.update = function(map, fast) {
	var d = this.dir_to - this.dir;
	if (Math.abs(d) < 0.1 || fast) {
		this.dir = this.dir_to;
		if (!this.do_not_chain) {
			var lookDelta = this.cell.looksAt;
			map.triggerAt(this.i+lookDelta.i, this.j+lookDelta.j, this.col);
		}
		return false;
	}
	//map.drawAt(this.lookAtFrom.i, this.lookAtFrom.j);
	this.dir += d*0.3;
	//map.drawCell(this.cell, this.i, this.j, this.dir, this.col);
	return true;
}

RotatingCell.prototype.draw = function(map) {
	map.drawCell(this.cell, this.i, this.j, this.dir, this.col);
}


function FadingCell(map, i, j, cell, col_to, do_not_chain) {
	this.i = i;
	this.j = j;
	this.a = 0;
	this.col_to = col_to;
	this.col_from = cell.col;
	this.do_not_chain = do_not_chain;
	
	this.cell = cell;
	this.dir = cell.dir;
	this.col = cell.col.copy(); //почему так?
	// потому что ЖСовый сборщик дофига ленивый, поэтому
	// чем меньше объектов будет создано, тем лучше, поэтому
	// лучше ОДИН новый объект создать щас, чем
	// генерить НОВЫЙ цвет на кажом кадре анимации.
}

FadingCell.prototype.update = function(map, fast) {
	this.a += 0.3;
	if (this.a >= 1 || fast) {
		this.cell.col = this.col = this.col_to;
		if (!this.do_not_chain) {
			var lookDelta = this.cell.looksAt;
			map.triggerAt(this.i+lookDelta.i, this.j+lookDelta.j, this.col);
		}
		return false;
	}
	Color.fade(this.col, this.col_from, this.col_to, this.a);
	return true;
}

FadingCell.prototype.draw = function(map) {
	map.drawCell(this.cell, this.i, this.j, this.dir, this.col);
}
