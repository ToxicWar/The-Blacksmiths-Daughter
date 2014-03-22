$(function() {
	var ctx = document.getElementById('canvas').getContext('2d');
	var scale = 18;

	ctx.fillStyle = "rgba(0, 0, 200)";
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			ctx.fillRect (i*(scale+2), j*(scale+2), scale, scale);
		}
	}
});