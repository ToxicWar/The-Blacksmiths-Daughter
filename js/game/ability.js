// Абилки
// hover - абилка проносится над ячейкой, должно возвращать true, если применябельно
// act - запустить абилку в ячейке

//TODO: ability{up, move, act}

var Ability = (function() {
	function Bomb(w, h) {
		this.w = w;
		this.h = h;
		this.prevPos = new Point(-1, -1);
	}
	
	Bomb.prototype._markAll = function(gm, ci, cj) {
		var w=this.w, h=this.h;
		gm.map.forEachInGrid(function(i, j, cell) {
			var usable = !!cell.col;
			if (!usable) return;
			
			var affected = usable &&
				ci-w<=i && i<=ci+w &&
				cj-h<=j && j<=cj+h;
			gm.highlighter.mark(i, j, affected ? "green" : "gray");
		});
	}
	
	Bomb.prototype.hover = function(gm, ci, cj, playerColor) {
		if (!this.prevPos.isAt(ci, cj)) {
			this._markAll(gm, ci, cj);
			this.prevPos.set(ci, cj);
		}
		return true;
	}
	
	Bomb.prototype.act = function(gm, ci, cj, playerColor) {
		var cell;
		for (var i=ci-this.w; i<=ci+this.w; i++) {
			for (var j=cj-this.h; j<=cj+this.h; j++) {
				if ((cell=gm.map.safeCellAt(i, j)) == null) continue;
				gm.map.triggerAt(i, j, playerColor, true);
			}
		}
		return true;
	}
	
	
	function Overcharge(n) {
		this.n = n;
		this.prevPos = new Point(-1, -1);
	}
	
	Overcharge.prototype._markAll = function(gm, ci, cj, playerColor) {
		gm.map.forEachInGrid(function(i, j, cell) {
			var usable = !!(cell.col && cell.col.is(playerColor));
			if (!usable) return;
			
			gm.highlighter.mark(i, j, "green");
		});
	}
	
	Overcharge.prototype._getCellIfAppropriate = function(map, ci, cj, playerColor) {
		var cell = map.safeCellAt(ci, cj);
		// && cell.looksAt
		if (!cell || !cell.col || !cell.col.is(playerColor)) return null;
		return cell;
	}
	
	Overcharge.prototype.hover = function(gm, ci, cj, playerColor) {
		if (!this.prevPos.isAt(ci, cj)) {
			this._markAll(gm, ci, cj, playerColor);
			this.prevPos.set(ci, cj);
		}
		return !!this._getCellIfAppropriate(gm.map, ci, cj, playerColor);
	}
	
	Overcharge.prototype.act = function(gm, ci, cj, playerColor) {
		var cell = this._getCellIfAppropriate(gm.map, ci, cj, playerColor);
		if (!cell) return false;
		
		var delta = cell.looksAt;
		
		for (var i=1; i<this.n; i++) {
			ci += delta.i;
			cj += delta.j;
			if (!gm.map.cellAt(ci, cj).col) break;
			gm.map.triggerAt(ci, cj, playerColor);
		}
		
		return true;
	}
	
	
	return {
		Bomb: Bomb,
		Overcharge: Overcharge
	}
})();

// Adds wrappers like
//function actReal(map, x, y) {
//	return Ability.name.act(map, map.x2i(x), map.y2j(y));
//}
/*
(function()
	//addSimilarFuncForRealCoordsIfNesessary
	function add_similar_func_for_real_coords_if_nesessary(ability, funcName) {
		if (funcName[0] == '_') return;
		if (funcName.match(/Real$/)) return;
		if ((funcName+"Real") in ability) return;
		
		ability[funcName+"Real"] = function(map, x, y, playerColor) {
			ability[funcName](map, map.x2i(x), map.y2j(y), playerColor);
		}
	}
	
	Ability.forEach(function(ability) {
		for (var funcName in ability) {
			add_similar_func_for_real_coords_if_nesessary(ability, funcName);
		}
	});
)
*/
