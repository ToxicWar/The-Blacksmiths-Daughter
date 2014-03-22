var serverConf = {
//	addr: "10.0.3.241",
//	port: 5000
	addr: '192.168.137.174',
	port: 5000
};


var urlParams = location.hash.substr(1).split(",");
var pupsConf = {
	w: urlParams[0] || 7,
	h: urlParams[1] || 13,
	cw: urlParams[2] || 48,
	iw: urlParams[3] || 40
};
