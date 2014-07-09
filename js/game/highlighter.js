function Highlighter(conf) {
	this.map = conf.map;
	this.canvas = conf.canvas;
	this.rc = this.canvas.getContext('2d');
	this.canvas.style.opacity = 0.5;
	this.resetCanvas();
	this._cache = [];
}

Highlighter.prototype.resetCanvas = function() {
	this.canvas.width  = this.canvas.offsetWidth;
	this.canvas.height = this.canvas.offsetHeight;
}

Highlighter.prototype._get = function(i, j) {
	return this._cache[i + this.map.h_size*j];
}

Highlighter.prototype._set = function(i, j, val) {
	this._cache[i + this.map.h_size*j] = val;
}

Highlighter.prototype.mark = function(i, j, mode) {
	//this.canvas.display = null;
	if (this._get(i, j) !== mode) {
		this._set(i, j, mode);
		var w = this.map.cell_width;
		this.rc.fillStyle = mode;
		this.rc.fillRect(i*w, j*w, w, w);
	}
}

Highlighter.prototype.clear = function() {
	this.rc.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this._cache.length = 0;
	//this.canvas.display = "none";
}
