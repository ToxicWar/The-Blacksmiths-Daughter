var serverConf = {
//	addr: "10.0.3.241",
//	port: 5000
	addr: location.hostname,
	port: location.port
};

var gameConf = {
	multiplayer: false
};


var urlParams = location.hash.match(/size:(\d+),(\d+),(\d+),(\d+)/) || [];
var pupsConf = {
	w: urlParams[1] || 13,
	h: urlParams[2] || 8,
	cw: urlParams[3] || 78,
	iw: urlParams[4] || 70
};
