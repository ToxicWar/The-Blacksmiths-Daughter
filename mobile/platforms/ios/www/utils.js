function XHR(method, path, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open(method, path, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		callback(xhr.status, xhr.responseText);
	}
	xhr.send(data);
}
