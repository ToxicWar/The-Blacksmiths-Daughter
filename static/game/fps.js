function FPS(callback) {
	this.last_frame_at = new Date().getTime()-1000;
	this.frames = 0;
	this.fps = 1;
	this.callback = callback;
}

FPS.prototype.update = function() {
	this.frames += 1;
	var ct = new Date().getTime();
	if (ct - this.last_frame_at > 1000) {
		this.last_frame_at = ct;
		this.fps = this.frames;
		this.frames = 0;
		this.callback(this.fps);
	}
}
