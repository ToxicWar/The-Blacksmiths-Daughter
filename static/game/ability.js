var Ability = {
	bomb: function(map, ci, cj) {
		var cell;
		for (var i=ci-2; i<=ci+2; i++)
			for (var j=cj-1; j<=cj+1; j++) {
				if ((cell=map.safeCellAt(i, j)) == null) continue;
				map.triggerAt(i, j, Color.GREEN, true);
			}
	},
	bombReal: function(map, x, y) {
		Ability.bomb(map, map.x2i(x), map.y2j(y));
	}
}
