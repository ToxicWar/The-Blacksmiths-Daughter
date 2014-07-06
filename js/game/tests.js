// пока здесь, TODO
(function() {
	console.log(" === TESTS BEGIN === ");
	
	console.assertEq = function(a, b, msg) {
		if (a === b) return;
		this.error(msg, a, b);
	}
	
	var u = undefined;
	var r = Color.RED, g = Color.GREEN, n = Color.GRAY;
	
	var colors = {
		players: [Color.GREEN, Color.RED],
		neutral: Color.GRAY
	};
	
	function makeFakeMap() {
		return {
			grid: [],
			h_size: 0,
			v_size: 0
		};
	}
	
	
	var lvl1_clear =
	"-- -- -- -- --\n\
	 |  1v 0^ 0>  |\n\
	 |  0< .  2^  |\n\
	 -- -- -- -- --";
	
	var lvl1_easy =
	"W0 W0 W0 W0 W0\n\
	 W0 11 03 00 W0\n\
	 W0 02 __ 23 W0\n\
	 W0 W0 W0 W0 W0";
	
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
	
	[lvl1_clear, lvl1_easy].forEach(function(lvl1) {
		var fakeMap = makeFakeMap();
		MapGenerator.openLevel(fakeMap, lvl1, colors);
		
		console.assertEq(fakeMap.h_size, 5, "map should have correct width");
		console.assertEq(fakeMap.v_size, 4, "map should have correct height");
		for (var i=0; i<fakeMap.grid.length; i++) {
			console.assertEq(fakeMap.grid[i].constructor, expectedObjs[i],
			                 "should generate correct objects"+
			                 "("+i+", "+fakeMap.grid[i].constructor.name+" vs "+expectedObjs[i].name+")");
			
			console.assertEq(fakeMap.grid[i].dir, expectedDirs[i],
			                 "should set correct directions"+
			                 "("+i+", "+fakeMap.grid[i].dir+" vs "+expectedDirs[i]+")");
			
			console.assertEq(fakeMap.grid[i].col, expectedCols[i],
			                 "should give correct colors"+
			                 "("+i+", "+(fakeMap.grid[i].col&&fakeMap.grid[i].col.toString())+
			                 " vs "+(expectedCols[i]&&expectedCols[i].toString())+")");
		}
	});
	
	
	try {
		MapGenerator.openLevel(makeFakeMap(), "W0 W0\n", colors);
		MapGenerator.openLevel(makeFakeMap(), "-- --\n", colors);
	} catch(e) {
		console.error("trailing newline should not cause exceptions:\n", e);
	}
	
	
	
	var ai_lvl =
	"-- -- -- -- --\n\
	 |  0< 0< 2v  |\n\
	 |  0> 0> 2v  |\n\
	 -- -- -- -- --";
	
	var fakeMap = {
		grid: [],
		h_size: 0,
		v_size: 0,
		copyGridTo: function(array) {
			array.length = this.grid.length;
			for (var i=0; i<array.length; i++) {
				array[i] = new this.grid[i].constructor(this.grid[i].dir, this.grid[i].col);
			}
		},
		triggerAt: Map.prototype.triggerAt,
		stillAnimating: Map.prototype.stillAnimating
	};
	
	var fakeGM = {
		was_used: false,
		map: fakeMap,
		doTurn: function(i, j, player) {
			this.was_used = true;
			console.assertEq([i, j]+"", [3, 1]+"", "should do turn at best position");
			return true;
		}
	};
	
	MapGenerator.openLevel(fakeGM.map, ai_lvl, colors);
	
	var ai = new TestAi(fakeGM, Color.RED);
	
	ai.gotTurn();
	console.assert(fakeGM.was_used, "turn should be done");
	
	console.log(" === TESTS END === ");
	console.log("");
})();
