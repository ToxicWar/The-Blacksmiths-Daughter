var core = {
	handlers: {},
	on: function(name, func) {
		if (name in this.handlers) {
			this.handlers[name].push(func);
		} else {
			this.handlers[name] = [func];
		}
	},
	off: function(name, func) {
		var handlers = this.handlers[name];
		if (!handlers) return false;
		if (func) {
			for (var i=0; i<handlers.length; i++) {
				if (handlers[i] !== func) continue;
				handlers.splice(i, 1);
				return true;
			}
		} else {
			handlers.length = 0;
		}
		return false;
	},
	emit: function(name, args) {
		var handlers = this.handlers[name];
		if (!handlers) return;
		for (var i=0; i<handlers.length; i++) {
			handlers[i].apply(null, args);
		}
	}
};
window.onload = function(){ core.emit("window-onload"); };
