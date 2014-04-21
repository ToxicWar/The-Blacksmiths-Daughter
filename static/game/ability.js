var Ability = {
	bomb: function(map, ci, cj) {
		var cell;
		for (var i=ci-2; i<=ci+2; i++)
			for (var j=cj-1; j<=cj+1; j++) {
				if ((cell=map.safeCellAt(i, j)) == null) continue;
				//TODO: (after map.update) map.updateAt(i, j, Color.GREEN, true)
				if (!cell.col) continue;
				map.addUpdatingSomethingAt(i, j, new FadingCell(cell, Color.GREEN, true));
			}
	}
}
