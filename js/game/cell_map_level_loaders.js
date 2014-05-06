//TODO: а нафига сюда grid, h_size и v_size передаются?
MapGenerator.unpackGrid = function(map, grid, h_size, v_size, data) {
	var objByString = {};
	var objs = [Cell, Wall, Hole];
	
	for (var i=0; i<objs.length; i++) {
		for (var j=0; j<objs[i].prototype.strings.length; j++) {
			objByString[objs[i].prototype.strings[j]] = objs[i];
		}
	}
	
	for (var i=0; i<data.length; i++) {
		grid[i] = objByString[data[i]].fromString(data[i]);
	}
}


var cellDirMap = {'>': 0, 'v': 1, '<': 2, '^':3};
var cellTypes = [
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
		func: function(map, player_id, arrow) {
			var col = player_id==0 ? map.neutralColor : map.colorFor(player_id-1);
			if (!col) throw new Error("Map doesn't have color for player №"+player_id);
			return new Cell(cellDirMap[arrow], col);
		},
	}
];
function parseLine(map, line, j) {
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
			m[0] = map;
			map.grid[i + j*map.h_size] = cellTypes[k].func.apply(null, m);
			found = true;
		}
		if (!found) throw new Error("Unkown map element: "+elems[i]);
	}
}
MapGenerator.openLevel = function(map, grid, h_size, v_size, data) {
	var lines = data.split(/\s*\n\s*/);
	map.v_size = lines.length;
	for (var j=0; j<lines.length; j++) {
		parseLine(map, lines[j], j);
	}
}
