function XHR(method, path, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open(method, path, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		callback(xhr.status, xhr.responseText);
	}
	xhr.send(data);
}

function getPos(obj) {
	var curleft = 0, curtop = 0;
	if (obj.offsetParent)
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	return {x: curleft, y: curtop};
}

function toRangeOrMiddle(a, x ,b) {
	if (b < a) return (a+b)/2;
	if (x < a) return a;
	if (x > b) return b;
	return x;
}

Array.prototype.random = function() {
	return this[Math.random()*this.length|0];
}

HTMLElement.prototype.getAbsoluteClientRect = function() {
	var box = this.getBoundingClientRect();
	box.left += window.pageXOffset;
	box.top += window.pageYOffset;
	return box;
}

window.onerror = function(errorMsg, url, lineNumber) {
	var msg = "Error happened on <"+url+
		"\n> on line "+lineNumber+":\n"+
		errorMsg;
	alert(msg);
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.isAt = function(x, y) {
	return x===this.x && y===this.y;
}

Point.prototype.is = function(point) {
	return point.x===this.x && point.y===this.y;
}

Point.prototype.set = function(x, y) {
	this.x = x;
	this.y = y;
}
