function Color(r,g,b) {
	this.r = r;
	this.g = g;
	this.b = b;
}

Color.prototype.toString = function() {
	return "#" + (this.r<16?"0":"") + this.r.toString(16) +
	             (this.g<16?"0":"") + this.g.toString(16) +
	             (this.b<16?"0":"") + this.b.toString(16);//если это очень не нравится, вон там вариант короче
	//return "rgb("+[this.r,this.g,this.b]+")";
}

Color.prototype.valueOf = function() {
	return (this.r<<16) + (this.g<<8) + this.b;
}

Color.prototype.copy = function() {
	return new Color(this.r, this.b, this.b);
}

Color.fade = function(out, col0, col1, a) {
	var ia = 1-a;
	out.r = (col0.r*ia + col1.r*a)|0;
	out.g = (col0.g*ia + col1.g*a)|0;
	out.b = (col0.b*ia + col1.b*a)|0;
}

Color.GRAY = new Color(127,127,127);
Color.RED = new Color(255,0,0);
Color.GREEN = new Color(0,255,0);
Color.BLUE = new Color(0,0,255);
Color.WHITE = new Color(255,255,255);
