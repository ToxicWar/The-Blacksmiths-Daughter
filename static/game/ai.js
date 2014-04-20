function FakeMap(map) {
	var fakeMap = this;
	this.grid = [];
	this.h_size = map.h_size;
	this.v_size = map.v_size;
	this.drawAt = function() {};
	this.updatingCells = {};
	this.updated_count = 0;
	this.addUpdatingSomethingAt = function(i, j, obj) {
		console.log(i,j,obj.constructor.name)
		this.updatingCells[i+j*this.h_size] = obj;
		this.updated_count++;
	};
	this.stillAnimating = function() {
		for (var i in this.updatingCells) return true;
		return false;
	}
	this.update = function() {// копипаста, нетруъ, TODO
		var keys = Object.keys(this.updatingCells);
		for (var i=0; i<keys.length; i++) {
			var ucell = this.updatingCells[keys[i]];
			var pos = parseInt(keys[i]);
			var ucell_i = pos%this.h_size;
			var ucell_j = pos/this.h_size|0;
			
			var updated = ucell.update(this, true);
			
			if (updated) continue;
			delete this.updatingCells[keys[i]];
			
			var delta = ucell.cell.looksAt;
			var _i = ucell_i + delta.i;
			var _j = ucell_j + delta.j;
			var nextCell = this.grid[_i + _j*this.h_size];
			// тыкаем следующую в цепочке, если поддерживает цвета и ещё не нашего цвета
			if (nextCell.col && nextCell.col.valueOf() != ucell.cell.col.valueOf()) {
				nextCell.trigger(fakeMap, _i, _j, ucell.cell.col);
			}
		}
	}
	this.cellAtPos = function(pos) {
		return this.grid[pos.i + pos.j*this.h_size];
	}
	this.cellAt = function(i, j) {
		return this.grid[i + j*this.h_size];
	}
}

function TestAi(map, color, callback) {
	this.color = color;
	
	var fakeMap = new FakeMap(map);
	var triggerablePositions = [];
	
	this.turn = function(map) {
		var best_pos = findBestActionForNow();
		
		if (triggerablePositions.length == 0) {
			if (callback) callback();
			return;
		}
		
		if (best_pos == -1) {
			console.log("good action for now was not found");
			best_pos = findBestActionForNextTurn();
		}
		
		if (best_pos == -1) {
			console.log("good action for next turn was not found");
			best_pos = triggerablePositions.random();
		}
		
		map.doTurn(best_pos%fakeMap.h_size, best_pos/fakeMap.h_size|0, 1, color);
	}
	
	function findBestActionForNow() {
		triggerablePositions.length = 0;
		var max_count = 1; // 1 - повернулась клетка, ничего не закрасив после
		var best_pos = -1;
		for (var i=0; i<map.grid.length; i++) {
			map.copyGridTo(fakeMap.grid);
			var count = go(i%fakeMap.h_size, i/fakeMap.h_size|0, 0);
			if (count == -1) continue;
			triggerablePositions.push(i);
			//console.log(i%fakeMap.h_size, i/fakeMap.h_size|0,count)
			if (count > max_count) {max_count = count; best_pos = i;}
		}
		return best_pos;
	}
	
	function findBestActionForNextTurn() {
		var max_count = 1; // 1 - повернулась клетка, ничего н закрасив после
		var best_pos = -1;
		for (var i=0; i<triggerablePositions.length; i++) {
			var pos = triggerablePositions[i];
			map.copyGridTo(fakeMap.grid);
			var count = go(pos%fakeMap.h_size, pos/fakeMap.h_size|0, 1);
			console.log("count", count)
			if (count == -1) continue;
			if (count > max_count) {max_count = count; best_pos = pos;}
		}
		return best_pos;
	}
	
	function triggerable(cell) {
		if (!(cell instanceof Cell)) return false;
		if (cell.col.valueOf() != color.valueOf()) return false;
		return true;
	}
	
	function go(i, j, additional_delta) {
		fakeMap.updated_count = 0;
		var cell = fakeMap.grid[i + j*fakeMap.h_size];
		if (!triggerable(cell)) return -1;
		
		cell.dir = (cell.dir+1 + additional_delta)%4;
		var delta = cell.looksAt;
		cell.dir = (cell.dir+3)%4;
		//console.log(i,j,delta,fakeMap.cellAt(i+delta.i, j+delta.j))
		if (!fakeMap.cellAt(i+delta.i, j+delta.j).connectable) return 1;
		console.log(cell.dir)
		
		cell.rotate(fakeMap, i, j, (cell.dir+1)%4);
		
		while (fakeMap.stillAnimating()) fakeMap.update();
		
		return fakeMap.updated_count;
	}
	
	/*function rotateTriggerableCellsBy(delta) {
		for (var i=0; i<triggerablePositions.length; i++) {
			var pos = triggerablePositions[i];
			var cell = fakeMap.grid[pos];
			if ('dir' in cell) cell.dir = (cell.dir+4+delta)%4;
		}
	}*/
}
