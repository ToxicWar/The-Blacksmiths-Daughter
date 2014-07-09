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
		var map = gm.map;
		for (var i=0; i<map.h_size; i++)
			for (var j=0; j<map.v_size; j++) {
				var cell = map.cellAt(i, j);
				var usable = !!cell.col;
				if (!usable) continue;
				
				var affected = usable &&
					ci-this.w<=i && i<=ci+this.w &&
					cj-this.h<=j && j<=cj+this.h;
				gm.highlighter.mark(i, j, affected ? "green" : "gray");
			}
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
		gm.highlighter.clear();
		return true;
	}
	
	
	function Overcharge(n) {
		this.n = n;
		this.prevPos = new Point(-1, -1);
	}
	
	Overcharge.prototype._markAll = function(gm, ci, cj, playerColor) {
		var map = gm.map;
		for (var i=0; i<map.h_size; i++)
			for (var j=0; j<map.v_size; j++) {
				var cell = map.cellAt(i, j);
				var usable = !!(cell.col && cell.col.is(playerColor));
				if (!usable) continue;
				
				gm.highlighter.mark(i, j, usable ? "green" : "gray");
			}
	}
	
	Overcharge.prototype._getCellIfAppropriate = function(map, ci, cj, playerColor) {
		var cell = map.safeCellAt(ci, cj);
		// && cell.looksAt
		if (!cell || !cell.col || cell.col.valueOf()!=playerColor.valueOf()) return null;
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
			gm.map.triggerAt(ci, cj, playerColor);
		}
		
		gm.highlighter.clear();
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
