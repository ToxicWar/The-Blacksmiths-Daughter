var serverConf = {
//	addr: "10.0.3.241",
//	port: 5000
	addr: location.hostname,
	port: location.port
};

var gameConf = {
	multiplayer: false
};


var urlParams = location.hash.substr(1).split(",");
var pupsConf = {
	w: urlParams[0] || 8,
	h: urlParams[1] || 8,
	cw: urlParams[2] || 48,
	iw: urlParams[3] || 40
};
