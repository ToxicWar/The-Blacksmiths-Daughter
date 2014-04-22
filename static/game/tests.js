// пока здесь, TODO
(function() {
	var u = undefined;
	var r = Color.RED, g = Color.GREEN, n = Color.GRAY;
	
	var lvl1 =
	"-- -- -- -- --\
	 |  1v 0^ 0>  |\
	 |  0< .  2^  |\
	 -- -- -- -- --";
	
	var expectedObjs = [
		Wall, Wall, Wall, Wall, Wall,
		Wall, Cell, Cell, Cell, Wall,
		Wall, Cell, Hole, Cell, Wall,
		Wall, Wall, Wall, Wall, Wall,
	];
	
	var expectedDirs = [
		u, u, u, u, u,
		u, 1, 3, 0, u,
		u, 2, u, 3, u,
		u, u, u, u, u,
	];
	
	var expectedCols = [
		u, u, u, u, u,
		u, g, n, n, u,
		u, n, u, r, u,
		u, u, u, u, u,
	];
	
	var fakeMap = {
		grid: [],
		colorFor: function(id) {return [Color.GREEN, Color.RED][id]},
		neutralColor: Color.GRAY
	};
	MapGenerator.openLevel(fakeMap, null, 0, 0, lvl1);
	
	console.assert(fakeMap.grid.length == 5*4, "map should have correct size");
	for (var i=0; i<fakeMap.grid.length; i++) {
		console.assert(fakeMap.grid[i].constructor === expectedObjs[i],
		               "should generate correct objects"+
		               "("+i+", "+fakeMap.grid[i].constructor.name+" vs "+expectedObjs[i].name+")");
		
		console.assert(fakeMap.grid[i].dir === expectedDirs[i],
		               "should set correct directions"+
		               "("+i+", "+fakeMap.grid[i].dir+" vs "+expectedDirs[i]+")");
		
		console.assert(fakeMap.grid[i].col === expectedCols[i],
		               "should give correct colors"+
		               "("+i+", "+(fakeMap.grid[i].col&&fakeMap.grid[i].col.toString())+
		               " vs "+(expectedCols[i]&&expectedCols[i].toString())+")");
	}
})();
