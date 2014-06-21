//TODO: description here!

var Ability = (function() {
	function Bomb(w, h) {
		this.w = w;
		this.h = h;
	}
	
	Bomb.prototype.hover = function(map, ci, cj, playerColor) {
		return true;
	}
	
	Bomb.prototype.act = function(map, ci, cj, playerColor) {
		var cell;
		for (var i=ci-this.w; i<=ci+this.w; i++) {
			for (var j=cj-this.h; j<=cj+this.h; j++) {
				if ((cell=map.safeCellAt(i, j)) == null) continue;
				map.triggerAt(i, j, playerColor, true);
			}
		}
		return true;
	}
	
	
	function Overcharge(n) {
		this.n = n;
	}
	
	Overcharge.prototype._getCellIfAppropriate = function(map, ci, cj, playerColor) {
		var cell = map.safeCellAt(ci, cj);
		// && cell.looksAt
		if (!cell || !cell.col || cell.col.valueOf()!=playerColor.valueOf()) return null;
		return cell;
	}
	
	Overcharge.prototype.hover = function(map, ci, cj, playerColor) {
		return !!this._getCellIfAppropriate(map, ci, cj, playerColor);
	}
	
	Overcharge.prototype.act = function(map, ci, cj, playerColor) {
		var cell = this._getCellIfAppropriate(map, ci, cj, playerColor);
		if (!cell) return false;
		
		var delta = cell.looksAt;
		
		for (var i=1; i<this.n; i++) {
			ci += delta.i;
			cj += delta.j;
			map.triggerAt(ci, cj, playerColor);
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
