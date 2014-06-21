//TODO: обернуть это во что-нибудь
var clearCellDirMap = {'>': 0, 'v': 1, '<': 2, '^':3};
var clearCellTypes = [
	{
		regEx: /--|\|/,
		func: function(){ return new Wall() }
	},
	{
		regEx: /\.{1,2}/,
		func: function(){ return new Hole() },
	},
	{
		regEx: /(\d)(>|v|<|\^)/,
		func: function(colors, player_id, arrow) {
			var col = player_id==0 ? colors.neutral : colors.players[player_id-1];
			if (!col) throw new Error("No color for player №"+player_id);
			return new Cell(clearCellDirMap[arrow], col);
		},
	}
];

var easyCellTypes = [
	{
		regEx: /W0/,
		func: function(){ return new Wall() }
	},
	{
		regEx: /__/,
		func: function(){ return new Hole() },
	},
	{
		regEx: /(\d)(\d)/,
		func: function(colors, player_id, dir) {
			var col = player_id==0 ? colors.neutral : colors.players[player_id-1];
			if (!col) throw new Error("No color for player №"+player_id);
			return new Cell(+dir, col);
		},
	}
];

function parseLine(map, colors, line, j, cellTypes) {
	var elems = line.split(/\s+/);
	
	if (map.h_size > 0) {
		if (map.h_size != elems.length)
			throw new Error("Wrong elems count at line "+(j+1)+": "+elems.length+", previous was "+map.h_size);
	} else {
		map.h_size = elems.length;
		map.grid.length = map.v_size * map.h_size;
	}
	
	for (var i=0; i<elems.length; i++) {
		var found = false;
		for (var k=0; k<cellTypes.length; k++) {
			var m = elems[i].match(cellTypes[k].regEx);
			if (m == null) continue;
			m[0] = colors;
			map.grid[i + j*map.h_size] = cellTypes[k].func.apply(null, m);
			found = true;
		}
		if (!found) throw new Error("Unkown map element: "+elems[i]);
	}
}

MapGenerator.openLevel = function(map, data, colors) {
	data = data.trim();
	
	// эксклюзивнй (с) интеллектуальный (R) литерационно-позиционно-оценочный^TM отпределятор формата.
	var cellTypes = data.indexOf("W")==-1 ? clearCellTypes : easyCellTypes;
	
	var lines = data.split(/\s*\n\s*/);
	map.v_size = lines.length;
	for (var j=0; j<lines.length; j++) {
		parseLine(map, colors, lines[j], j, cellTypes);
	}
}
