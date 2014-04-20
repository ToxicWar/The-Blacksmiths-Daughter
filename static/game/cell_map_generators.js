MapGenerator = {};

MapGenerator.cellRandom = function(map, grid, h_size, v_size) {
	for (var i=0; i<grid.length; i++)
		grid[i] = new Cell(Math.random()*4|0, Color.GRAY);
}

MapGenerator.dirByArray = function(map, grid, h_size, v_size, arr) {
	for (var i=0; i<arr.length; i++)
		grid[i].dir = arr[i];
}

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

MapGenerator.dirMiddleSnake = function(map, grid, h_size, v_size) {
	var i_from = h_size/4|0, i_to = h_size*3/4;
	for (var i=i_from; i<i_to; i++) {
		for (var j=v_size/4|0; j<v_size*3/4; j++) {
			var pos = i + j*h_size;
			if (grid[pos].dir !== undefined) {
				grid[pos].dir = j%2 ? (i<i_to-1 ? 0 : 1) : (i>i_from ? 2 : 1);
			}
		}
	}
}

MapGenerator.wallBorder = function(map, grid, h_size, v_size) {
	for (var i=0; i<h_size; i++) grid[i] = grid[i+h_size*(v_size-1)] = new Wall();
	for (var i=0; i<v_size; i++) grid[i*h_size] = grid[(h_size-1)+i*h_size] = new Wall();
}

MapGenerator.hole = function(map, grid, h_size, v_size, relative, x, y, r) {
	if (relative) {
		var min = h_size < v_size ? h_size : v_size;
		x *= min;
		y *= min;
		r *= min;
	}
	for (var i=(x-r-0.5)|0; i<x+r; i++) {
		for (var j=(y-r-0.5)|0; j<y+r; j++) {
			var len = Math.sqrt((i-x)*(i-x)+(j-y)*(j-y));
			var pos = i + j*h_size;
			if (len < r-1) grid[pos] = new Hole(); else
			if (len < r)   grid[pos] = new Wall();
		}
	}
}

function pointDistance(x0, y0, x1, y1) {
	return Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
}
function lastOnRay(grid, h_size, v_size, angle, Obj) {
	var dx = Math.cos(angle);
	var dy = Math.sin(angle);
	var x_origin = h_size/2;
	var y_origin = v_size/2;
	var x = x_origin, y = y_origin;
	var last_i, last_j;
	while (x>=0 && x<h_size && y>=0 && y<v_size) {
		var i=x|0, j=y|0;
		if (grid[i + j*h_size] instanceof Obj) {
			last_i = i;
			last_j = j;
		}
		x += dx;
		y += dy;
	}
	return [last_i, last_j, pointDistance(last_i, last_j, x_origin, y_origin)];
}
MapGenerator.playersPositions = function(map, grid, h_size, v_size, callback) {
	var colors = map.playersColors;
	var angle_delta = Math.PI*2 / colors.length;
	var positions = [];
	
	for (var col_i=0; col_i<colors.length; col_i++) {
		var max_dis = -Infinity;
		var max_pos = null;
		for (var i=0; i<3; i++) {
			var randomized_angle = Math.PI + angle_delta*col_i + Math.random()*angle_delta/2 - angle_delta/4;
			var pos = lastOnRay(grid, h_size, v_size, randomized_angle, Cell);
			if (pos[2] > max_dis) {max_dis = pos[2]; max_pos=pos;}
		}
		
		if (callback) {
			positions.push({
				i: max_pos[0],
				j: max_pos[1],
				col: colors[col_i]
			});
		}
		grid[max_pos[0] + max_pos[1]*h_size].col = colors[col_i];
	}
	if (callback) callback(positions);
}
