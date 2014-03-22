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
