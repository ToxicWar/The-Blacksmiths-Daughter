function FakeMap(map) {
	var fakeMap = this;
	this.grid = [];
	this.h_size = map.h_size;
	this.v_size = map.v_size;
	this.drawAt = function() {};
	this.updatingCells = {};
	this.updated_count = 0;
	
	this.triggerAt = map.triggerAt;
	
	this.addUpdatingSomethingAt = function(i, j, obj) {
		console.log("Adding "+obj.constructor.name+" at ", i, j);
		this.updatingCells[i+j*this.h_size] = obj;
		this.updated_count++;
	};
	
	this.stillAnimating = map.stillAnimating; //TODO
	
	this.update = function() {// копипаста, нетруъ  // уже лучше, но всё равно TODO
		var keys = Object.keys(this.updatingCells);
		for (var i=0; i<keys.length; i++) {
			var ucell = this.updatingCells[keys[i]];
			//var pos = parseInt(keys[i]);
			//var ucell_i = pos%this.h_size;
			//var ucell_j = pos/this.h_size|0;
			
			var updated = ucell.update(this, true);
			//don't ucell.draw(...)
			
			if (updated) continue;
			delete this.updatingCells[keys[i]];
		}
	};
	
	this.cellAtPos = function(pos) {
		return this.grid[pos.i + pos.j*this.h_size];
	};
	
	this.cellAt = function(i, j) {
		return this.grid[i + j*this.h_size];
	};
}


function TestAi(gm, color) {
	this.color = color;
	
	var map = gm.map;
	var fakeMap = new FakeMap(map);
	var triggerablePositions = [];
	
	this.gotTurn = function() {
		console.log(" --- AI begin ---");
		var best_pos = findBestActionForNow();
		
		if (triggerablePositions.length == 0) {
			throw new Error("No triggerable cells found. "+
				"Have I missed any or GameMaster forgot to stop battle?");
		}
		
		if (best_pos == -1) {
			console.log("good action for now was not found");
			best_pos = findBestActionForNextTurn();
		}
		
		if (best_pos == -1) {
			console.log("good action for next turn was not found");
			best_pos = triggerablePositions.random();
		}
		
		var i = best_pos%fakeMap.h_size;
		var j = best_pos/fakeMap.h_size|0;
		var done = gm.doTurn(i, j, this);
		if (!done) throw new Error("Failed to do desired turn at "+i+", "+j+" with "+color.toString()); //DEBUG
		console.log(" --- AI end ---");
	}
	
	this.loss = function() {
		
	}
	
	function findBestActionForNow() {
		triggerablePositions.length = 0;
		var max_count = 1; // 1 - повернулась клетка, ничего не закрасив после
		var best_pos = -1;
		for (var i=0; i<map.grid.length; i++) {
			map.copyGridTo(fakeMap.grid);
			var count = go(i%fakeMap.h_size, i/fakeMap.h_size|0, 1);
			if (count == -1) continue;
			console.log("Count for now: "+count);
			triggerablePositions.push(i);
			if (count > max_count) {max_count = count; best_pos = i;}
		}
		return best_pos;
	}
	
	function findBestActionForNextTurn() {
		var max_count = 1; // 1 - повернулась клетка, ничего не закрасив после
		var best_pos = -1;
		for (var i=0; i<triggerablePositions.length; i++) {
			var pos = triggerablePositions[i];
			map.copyGridTo(fakeMap.grid);
			var count = go(pos%fakeMap.h_size, pos/fakeMap.h_size|0, 2);
			console.log("Count for next: "+count);
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
	
	function go(i, j, rot_delta) {
		fakeMap.updated_count = 0;
		var cell = fakeMap.grid[i + j*fakeMap.h_size];
		if (!triggerable(cell)) return -1;
		
		cell.dir = (cell.dir + rot_delta)%4;
		var delta = cell.looksAt;
		cell.dir = (cell.dir + 3)%4;
		
		if (!fakeMap.cellAt(i+delta.i, j+delta.j).connectable) return 1;
		console.log("GO: cell at ("+i+","+j+"), dir: "+cell.dir);
		
		cell.rotate(fakeMap, i, j, (cell.dir+1)%4);
		
		while (fakeMap.stillAnimating()) fakeMap.update();
		
		console.log("GO: count after: "+fakeMap.updated_count);
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
