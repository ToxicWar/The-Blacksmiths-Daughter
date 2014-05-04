function Control(opts) {}
Control.add = function(opts) {
	var singleDown = opts.singleDown;
	var singleMove = opts.singleMove;
	var singleUp = opts.singleUp;
	
	var doubleDown = doubleDown;
	var doubleMove = doubleMove;
	var doubleUp = doubleUp;
	
	var wheelRot = opts.wheelRot;
	
	var startElem = opts.startElem;
	var stopElem = opts.stopElem;
	
	var pos = getPos(stopElem);
	var dx = pos.x;
	var dy = pos.y;
	
	function grab(e) {
		singleDown(e.pageX-dx, e.pageY-dy) && e.preventDefault();
	}
	function move(e) {
		singleMove(e.pageX-dx, e.pageY-dy) && e.preventDefault();
	}
	function drop(e) {
		singleUp(false) && e.preventDefault();
	}
	
	touch_numb = 0;
	function touchStart(e) {
		if (e.touches.length > 2) return;
		var prevent = false;
		
		if (e.touches.length == 1) {
			var t = e.touches[0];
			prevent = singleDown(t.pageX-dx, t.pageY-dy);
		} else {
			if (touch_numb == 1) prevent = singleUp(false);
			var t0 = e.touches[0], t1 = e.touches[1];
			prevent += doubleDown(
				t0.pageX-dx, t0.pageY-dy,
				t1.pageX-dx, t1.pageY-dy
			);
		}

		if (prevent) e.preventDefault();
		touch_numb = e.touches.length;
	}
	
	function touchMove(e) {
		if (e.touches.length > 2) return;
		if (e.touches.length != touch_numb) return; //тут что-то нетак
		
		if (e.touches.length == 1) {
			var t = e.touches[0];
			singleMove(t.pageX-dx, t.pageY-dy) && e.preventDefault();
		} else {
			var t0 = e.touches[0], t1 = e.touches[1];
			//мобильная Опера 12.04 в передёт тачи сюда в обратном порядке
			if (t0.identifier > t1.identifier) {var t=t0; t0=t1; t1=t;}
			doubleMove(
				t0.pageX-dx, t0.pageY-dy,
				t1.pageX-dx, t1.pageY-dy
			) && e.preventDefault();
		}
	}
	
	function touchEnd(e) {
		if (e.touches.length > 1) return;
		
		if (e.touches.length == 0) {
			singleUp(true) && e.preventDefault();
		} else {
			var t = e.touches[0];
			(doubleUp(false) + singleDown(t.pageX-dx, t.pageY-dy)) && e.preventDefault();
		}
		
		touch_numb = e.touches.length;
	}
	
	startElem.on('mousedown', grab);
	startElem.on('mousemove', move);
	stopElem.on('mouseup', drop);
	startElem.on('touchstart', touchStart);
	startElem.on('touchmove', touchMove);
	stopElem.on('touchend', touchEnd);
	
	if (wheelRot) {
		startElem.on('mousewheel',     function(e){ wheelRot(e.wheelDelta/120) && e.preventDefault(); });
		startElem.on('DOMMouseScroll', function(e){ wheelRot(e.detail)         && e.preventDefault(); });
	}
}
