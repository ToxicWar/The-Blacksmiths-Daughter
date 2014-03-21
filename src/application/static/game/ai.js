function TestAi(map, color) {
	var grid = [];
	
	this.turn = function() {
		map.fillWithColors(grid);
	}
}
